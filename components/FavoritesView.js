"use client";

import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { useFavorites } from "@/components/FavoritesProvider";

export default function FavoritesView() {
  const { favorites, ready } = useFavorites();

  if (!ready) {
    return <p className="favorites-status" role="status">Loading your favorites…</p>;
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <span className="favorites-empty-star" aria-hidden="true">☆</span>
        <h2>No saved posts yet</h2>
        <p>Use the <b>Save</b> button on any post to add it to this list.</p>
        <Link href="/">Browse latest posts</Link>
      </div>
    );
  }

  return (
    <div className="favorites-list">
      {favorites.map((favorite) => (
        <article key={favorite.id} className="favorite-list-item">
          <div className="favorite-list-heading">
            <Link href={favorite.path}>
              <h2>{favorite.title}</h2>
            </Link>
            <FavoriteButton post={favorite} />
          </div>
          <FavoriteMeta favorite={favorite} />
          {favorite.excerpt && <p className="excerpt">{favorite.excerpt}</p>}
          <Link className="favorite-open-link" href={favorite.path}>Open post →</Link>
        </article>
      ))}
    </div>
  );
}

function FavoriteMeta({ favorite }) {
  const published = formatDate(favorite.date);
  const saved = formatDate(favorite.savedAt);

  return (
    <p className="favorite-meta">
      {favorite.author?.name && <>By <b>{favorite.author.name}</b>{published ? " · " : ""}</>}
      {published && <>Published {published}</>}
      {saved && <span>Saved {saved}</span>}
    </p>
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}
