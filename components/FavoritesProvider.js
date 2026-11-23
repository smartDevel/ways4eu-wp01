"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "curiosphere:favorites:v1";
const STORE_EVENT = "curiosphere:favorites-change";
const EMPTY_FAVORITES = [];
const FavoritesContext = createContext(null);
let cachedSerialized = "[]";
let cachedFavorites = EMPTY_FAVORITES;
let memorySerialized = null;

export default function FavoritesProvider({ children }) {
  const favorites = useSyncExternalStore(subscribe, getFavoritesSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeHydration, getHydratedSnapshot, getServerHydratedSnapshot);

  const toggleFavorite = useCallback((post) => {
    const favorite = normalizeFavorite(post);
    if (!favorite) return;

    const current = getFavoritesSnapshot();
    const exists = current.some((item) => item.id === favorite.id);
    const next = exists
      ? current.filter((item) => item.id !== favorite.id)
      : [{ ...favorite, savedAt: new Date().toISOString() }, ...current];
    writeFavorites(next);
  }, []);

  const value = useMemo(() => ({
    favorites,
    ready,
    count: favorites.length,
    isFavorite: (postId) => favorites.some((item) => item.id === Number(postId)),
    toggleFavorite,
  }), [favorites, ready, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error("useFavorites must be used inside FavoritesProvider");
  return value;
}

function normalizeFavorite(post) {
  const id = Number(post?.id);
  if (!Number.isFinite(id)) return null;

  const author = post?.author || post?._embedded?.author?.[0] || null;
  return {
    id,
    title: textValue(post?.title),
    excerpt: textValue(post?.excerpt),
    path: localPostPath(post?.path || post?.link),
    date: typeof post?.date === "string" ? post.date : "",
    author: author?.name ? {
      name: author.name,
      path: localPostPath(author.path || author.link),
    } : null,
  };
}

function textValue(value) {
  const html = typeof value === "string" ? value : value?.rendered;
  if (typeof html !== "string") return "";
  const document = new DOMParser().parseFromString(html, "text/html");
  return document.body.textContent?.trim() || "";
}

function localPostPath(value) {
  if (!value) return "/";
  try {
    const url = new URL(value, window.location.origin);
    return url.hostname === "ways4eu.wordpress.com" || url.origin === window.location.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : url.href;
  } catch {
    return value;
  }
}

function writeFavorites(favorites) {
  const serialized = JSON.stringify(favorites);
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
    memorySerialized = null;
  } catch {
    memorySerialized = serialized;
  }
  cachedSerialized = serialized;
  cachedFavorites = favorites;
  window.dispatchEvent(new Event(STORE_EVENT));
}

function readFavorites(serialized = "[]") {
  try {
    const parsed = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => Number.isFinite(Number(item?.id)) && typeof item?.path === "string")
      .map((item) => ({
        id: Number(item.id),
        title: typeof item.title === "string" ? item.title : "",
        excerpt: typeof item.excerpt === "string" ? item.excerpt : "",
        path: item.path,
        date: typeof item.date === "string" ? item.date : "",
        author: item.author?.name ? item.author : null,
        savedAt: typeof item.savedAt === "string" ? item.savedAt : "",
      }));
  } catch {
    return [];
  }
}

function getFavoritesSnapshot() {
  let serialized = memorySerialized;
  if (serialized === null) {
    try {
      serialized = window.localStorage.getItem(STORAGE_KEY) || "[]";
    } catch {
      serialized = "[]";
    }
  }
  if (serialized !== cachedSerialized) {
    cachedSerialized = serialized;
    cachedFavorites = readFavorites(serialized);
  }
  return cachedFavorites;
}

function getServerSnapshot() {
  return EMPTY_FAVORITES;
}

function subscribe(onStoreChange) {
  function onStorage(event) {
    if (event.key !== STORAGE_KEY) return;
    memorySerialized = null;
    onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORE_EVENT, onStoreChange);
  };
}

function subscribeHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}
