"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COLOR_SCHEMES, normalizePageSize, PAGE_SIZES } from "@/lib/preferences";

const COLOR_SCHEME_KEY = "curiosphere:color-scheme:v1";
const PAGE_SIZE_KEY = "curiosphere:posts-per-page:v1";
const THEME_EVENT = "curiosphere:color-scheme-change";
const DEFAULT_SCHEME = "ocean";

export function ColorSchemePicker() {
  const scheme = useSyncExternalStore(subscribeToScheme, getSchemeSnapshot, getServerSchemeSnapshot);

  useEffect(() => {
    document.documentElement.dataset.theme = scheme;
  }, [scheme]);

  function changeScheme(event) {
    const next = normalizeScheme(event.target.value);
    try {
      window.localStorage.setItem(COLOR_SCHEME_KEY, next);
    } catch {
      // The active scheme still applies for this page when storage is blocked.
    }
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <label className="theme-picker">
      <span>Color theme</span>
      <select value={scheme} onChange={changeScheme} aria-label="Color theme">
        {COLOR_SCHEMES.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </label>
  );
}

export function PostsPerPagePicker({ value }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.has("perPage")) {
      persistPageSize(value);
      return;
    }

    const stored = readPageSize();
    if (stored !== value) {
      params.set("perPage", String(stored));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pathname, router, search, value]);

  function changePageSize(event) {
    const next = normalizePageSize(event.target.value);
    persistPageSize(next);
    const params = new URLSearchParams(search);
    params.set("perPage", String(next));
    const firstPagePath = pathname.replace(/\/page\/\d+\/?$/, "/") || "/";
    router.replace(`${firstPagePath}?${params.toString()}`);
  }

  return (
    <label className="page-size-picker">
      <span>Posts per page</span>
      <select value={value} onChange={changePageSize}>
        {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
      </select>
    </label>
  );
}

function subscribeToScheme(onStoreChange) {
  function onStorage(event) {
    if (event.key === COLOR_SCHEME_KEY) onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

function getSchemeSnapshot() {
  try {
    return normalizeScheme(window.localStorage.getItem(COLOR_SCHEME_KEY));
  } catch {
    return normalizeScheme(document.documentElement.dataset.theme);
  }
}

function getServerSchemeSnapshot() {
  return DEFAULT_SCHEME;
}

function normalizeScheme(value) {
  return COLOR_SCHEMES.some(([scheme]) => scheme === value) ? value : DEFAULT_SCHEME;
}

function readPageSize() {
  try {
    return normalizePageSize(window.localStorage.getItem(PAGE_SIZE_KEY));
  } catch {
    return 10;
  }
}

function persistPageSize(value) {
  try {
    window.localStorage.setItem(PAGE_SIZE_KEY, String(normalizePageSize(value)));
  } catch {
    // The URL remains the source of truth when storage is blocked.
  }
}
