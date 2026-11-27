"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { decodeEntities } from "@/components/PostTaxonomy";

const STORAGE_KEY = "curiosphere:tag-cloud-position:v1";
const STORE_EVENT = "curiosphere:tag-cloud-position-change";
const POSITIONS = new Set(["off", "left", "right"]);

export default function TagCloudLayout({ children, tags, activeTag, perPage }) {
  const position = useTagCloudPosition();
  const cloud = position === "off" ? null : (
    <TagCloud tags={tags} activeTag={activeTag} perPage={perPage} position={position} />
  );

  return (
    <>
      <TagCloudPicker position={position} />
      <div className={`archive-layout tag-cloud-${position}`}>
        {position === "left" && cloud}
        <div className="archive-posts">{children}</div>
        {position === "right" && cloud}
      </div>
    </>
  );
}

function TagCloudPicker({ position }) {
  function changePosition(event) {
    const next = normalizePosition(event.target.value);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Keep the preference active for this page if storage is unavailable.
    }
    window.dispatchEvent(new Event(STORE_EVENT));
  }

  return (
    <div className="tag-cloud-preference">
      <label htmlFor="tag-cloud-position">Tag cloud</label>
      <select
        id="tag-cloud-position"
        value={position}
        onChange={changePosition}
        aria-describedby="tag-cloud-preference-help"
      >
        <option value="off">Off</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
      <span id="tag-cloud-preference-help">Shown beside posts when enough screen space is available.</span>
    </div>
  );
}

function TagCloud({ tags, activeTag, perPage, position }) {
  const normalizedTags = Array.isArray(tags) ? tags.filter((tag) => tag?.id && tag?.slug && tag?.name && tag.count > 0) : [];
  if (normalizedTags.length === 0) return null;
  const counts = normalizedTags.map((tag) => Number(tag.count));
  const minimum = Math.min(...counts);
  const maximum = Math.max(...counts);

  return (
    <aside className="tag-cloud-sidebar" data-position={position} aria-label={`Popular tags, ${position} sidebar`}>
      <nav className="tag-cloud" aria-label="Popular tag cloud">
        <div className="tag-cloud-heading">
          <span>Explore topics</span>
          <strong>Popular tags</strong>
        </div>
        <ul>
          {normalizedTags.map((tag) => {
            const active = tag.slug === activeTag;
            const level = popularityLevel(Number(tag.count), minimum, maximum);
            return (
              <li key={tag.id}>
                <Link
                  href={`/tag/${tag.slug}/?perPage=${perPage}`}
                  className={active ? "is-active" : undefined}
                  data-popularity={level}
                  aria-current={active ? "page" : undefined}
                  aria-label={`${decodeEntities(tag.name)}, ${tag.count} ${tag.count === 1 ? "post" : "posts"}`}
                  title={`${tag.count} ${tag.count === 1 ? "post" : "posts"}`}
                >
                  {decodeEntities(tag.name)}
                  <span className="screen-reader-text"> ({tag.count} posts)</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

function popularityLevel(count, minimum, maximum) {
  if (maximum === minimum) return 3;
  const logarithmicCount = Math.log1p(count);
  const logarithmicMinimum = Math.log1p(minimum);
  const logarithmicMaximum = Math.log1p(maximum);
  const ratio = (logarithmicCount - logarithmicMinimum) / (logarithmicMaximum - logarithmicMinimum);
  return Math.min(5, Math.max(1, Math.round(ratio * 4) + 1));
}

function useTagCloudPosition() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function subscribe(onStoreChange) {
  function onStorage(event) {
    if (event.key === STORAGE_KEY) onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(STORE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  try {
    return normalizePosition(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return "off";
  }
}

function getServerSnapshot() {
  return "off";
}

function normalizePosition(value) {
  return POSITIONS.has(value) ? value : "off";
}
