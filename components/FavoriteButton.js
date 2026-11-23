"use client";

import { useFavorites } from "@/components/FavoritesProvider";

export default function FavoriteButton({ post }) {
  const { ready, isFavorite, toggleFavorite } = useFavorites();
  const saved = ready && isFavorite(post.id);
  const label = saved ? "Remove from favorites" : "Save to favorites";

  return (
    <button
      type="button"
      className={`favorite-button${saved ? " is-favorite" : ""}`}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      disabled={!ready}
      onClick={() => toggleFavorite(post)}
    >
      <span className="favorite-star" aria-hidden="true">{saved ? "★" : "☆"}</span>
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
