"use client";

import { useId } from "react";
import { useFavorites } from "@/components/FavoritesProvider";

const RATINGS = [1, 2, 3, 4, 5];

export default function FavoriteRating({ post }) {
  const labelId = useId();
  const { ready, isFavorite, getRating, setRating } = useFavorites();

  if (!ready || !isFavorite(post.id)) return null;
  const rating = getRating(post.id);

  return (
    <div className="favorite-rating" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="favorite-rating-label">Your rating</span>
      <div className="favorite-rating-stars">
        {RATINGS.map((value) => (
          <button
            key={value}
            type="button"
            className={value <= rating ? "is-selected" : ""}
            aria-pressed={rating === value}
            aria-label={`Rate ${value} ${value === 1 ? "star" : "stars"}`}
            title={`Rate ${value} ${value === 1 ? "star" : "stars"}`}
            onClick={() => setRating(post.id, value)}
          >
            <span aria-hidden="true">★</span>
          </button>
        ))}
      </div>
      <span className="favorite-rating-value" aria-live="polite">
        {rating ? `${rating} of 5 stars` : "Not rated"}
      </span>
    </div>
  );
}
