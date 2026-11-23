"use client";

import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import FavoriteRating from "@/components/FavoriteRating";
import { useFavorites } from "@/components/FavoritesProvider";
import ShareButtons from "@/components/ShareButtons";
import { useMemo, useState } from "react";

export default function FavoritesView() {
  const { favorites, ready } = useFavorites();
  const [sortBy, setSortBy] = useState("saved");
  const [ratingFilter, setRatingFilter] = useState("all");
  const visibleFavorites = useMemo(() => {
    const filtered = favorites.filter((favorite) => {
      if (ratingFilter === "all") return true;
      if (ratingFilter === "unrated") return favorite.rating === 0;
      return favorite.rating === Number(ratingFilter);
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === "rating") return right.rating - left.rating || newestSaved(left, right);
      if (sortBy === "title") return left.title.localeCompare(right.title, "en", { sensitivity: "base" });
      if (sortBy === "published") return newestDate(left.date, right.date);
      return newestSaved(left, right);
    });
  }, [favorites, ratingFilter, sortBy]);

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
    <>
      <div className="favorites-controls" aria-label="Sort and filter favorites">
        <label>
          Sort by
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="saved">Recently saved</option>
            <option value="rating">Highest rating</option>
            <option value="title">Title A–Z</option>
            <option value="published">Newest published</option>
          </select>
        </label>
        <label>
          Filter by rating
          <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
            <option value="all">All favorites</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
            <option value="unrated">Not rated</option>
          </select>
        </label>
        <p className="favorites-result-count" role="status">
          {visibleFavorites.length} of {favorites.length} {favorites.length === 1 ? "favorite" : "favorites"}
        </p>
      </div>

      {visibleFavorites.length === 0 ? (
        <div className="favorites-no-results">
          <h2>No favorites match this filter</h2>
          <button type="button" onClick={() => setRatingFilter("all")}>Show all favorites</button>
        </div>
      ) : <div className="favorites-list">
      {visibleFavorites.map((favorite) => (
        <article key={favorite.id} className="favorite-list-item">
          <div className="favorite-list-heading">
            <Link href={favorite.path}>
              <h2>{favorite.title}</h2>
            </Link>
            <FavoriteButton post={favorite} />
          </div>
          <FavoriteMeta favorite={favorite} />
          <FavoriteRating post={favorite} />
          {favorite.excerpt && <p className="excerpt">{favorite.excerpt}</p>}
          <Link className="favorite-open-link" href={favorite.path}>Open post →</Link>
        </article>
      ))}
      </div>}
      <ShareButtons title="My CurioSphere favorites" url="/favorites/" favorites={favorites} />
    </>
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

function newestSaved(left, right) {
  return newestDate(left.savedAt, right.savedAt);
}

function newestDate(left, right) {
  return new Date(right || 0).getTime() - new Date(left || 0).getTime();
}
