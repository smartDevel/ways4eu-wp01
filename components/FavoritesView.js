"use client";

import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import FavoriteRating from "@/components/FavoriteRating";
import { useFavorites } from "@/components/FavoritesProvider";
import ShareButtons from "@/components/ShareButtons";
import { useMemo, useRef, useState } from "react";

export default function FavoritesView() {
  const { favorites, ready } = useFavorites();
  const [sortBy, setSortBy] = useState("saved");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [expandedPosts, setExpandedPosts] = useState(() => new Set());
  const [postContent, setPostContent] = useState(() => new Map());
  const [loadingPosts, setLoadingPosts] = useState(() => new Set());
  const [failedPosts, setFailedPosts] = useState(() => new Set());
  const loadingPostsRef = useRef(new Set());
  const postContentRef = useRef(new Map());
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
  const visibleIds = visibleFavorites.map((favorite) => favorite.id);
  const allVisibleExpanded = visibleIds.length > 0 && visibleIds.every((id) => expandedPosts.has(id));

  function togglePost(postId) {
    const opening = !expandedPosts.has(postId);
    setExpandedPosts((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    if (opening) loadPostContent([postId]);
  }

  function toggleAllPosts() {
    setExpandedPosts((current) => {
      const next = new Set(current);
      for (const id of visibleIds) {
        if (allVisibleExpanded) next.delete(id);
        else next.add(id);
      }
      return next;
    });
    if (!allVisibleExpanded) loadPostContent(visibleIds);
  }

  async function loadPostContent(postIds) {
    const missingIds = postIds.filter((id) => (
      !postContentRef.current.has(id) && !loadingPostsRef.current.has(id)
    ));
    if (missingIds.length === 0) return;

    for (const id of missingIds) loadingPostsRef.current.add(id);
    setLoadingPosts(new Set(loadingPostsRef.current));
    setFailedPosts((current) => {
      const next = new Set(current);
      for (const id of missingIds) next.delete(id);
      return next;
    });

    const failed = new Set();
    try {
      const batches = [];
      for (let index = 0; index < missingIds.length; index += 100) {
        batches.push(missingIds.slice(index, index + 100));
      }
      const responses = await Promise.all(batches.map(async (batch) => {
        const response = await fetch(`/api/posts?ids=${batch.join(",")}`);
        if (!response.ok) throw new Error("Post request failed");
        return response.json();
      }));
      const received = new Set();
      const nextContent = new Map(postContentRef.current);
      for (const posts of responses) {
        for (const post of posts) {
          received.add(Number(post.id));
          nextContent.set(Number(post.id), post.content);
        }
      }
      for (const id of missingIds) if (!received.has(id)) failed.add(id);
      postContentRef.current = nextContent;
      setPostContent(nextContent);
    } catch {
      for (const id of missingIds) failed.add(id);
    } finally {
      for (const id of missingIds) loadingPostsRef.current.delete(id);
      setLoadingPosts(new Set(loadingPostsRef.current));
      if (failed.size > 0) {
        setFailedPosts((current) => new Set([...current, ...failed]));
      }
    }
  }

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

      {visibleFavorites.length > 0 && (
        <div className="post-list-controls favorites-expand-controls">
          <button
            type="button"
            className="all-posts-toggle"
            aria-expanded={allVisibleExpanded}
            aria-controls={visibleIds.map((id) => `favorite-content-${id}`).join(" ")}
            onClick={toggleAllPosts}
          >
            {allVisibleExpanded ? "Collapse all posts" : "Expand all posts"}
          </button>
        </div>
      )}

      {visibleFavorites.length === 0 ? (
        <div className="favorites-no-results">
          <h2>No favorites match this filter</h2>
          <button type="button" onClick={() => setRatingFilter("all")}>Show all favorites</button>
        </div>
      ) : <div className="favorites-list">
      {visibleFavorites.map((favorite) => {
        const isExpanded = expandedPosts.has(favorite.id);
        const contentId = `favorite-content-${favorite.id}`;
        return <article key={favorite.id} className="favorite-list-item">
          <div className="favorite-list-heading">
            <Link href={favorite.path}>
              <h2>{favorite.title}</h2>
            </Link>
            <FavoriteButton post={favorite} />
          </div>
          <FavoriteMeta favorite={favorite} />
          <FavoriteRating post={favorite} />
          <button
            type="button"
            className="post-toggle"
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={() => togglePost(favorite.id)}
          >
            <span>{isExpanded ? "Show excerpt" : "Read full post"}</span>
            <span className="post-toggle-icon" aria-hidden="true">⌄</span>
          </button>
          <div id={contentId}>
            {isExpanded ? (
              <FavoriteFullContent
                content={postContent.get(favorite.id)}
                failed={failedPosts.has(favorite.id)}
                loading={loadingPosts.has(favorite.id)}
                path={favorite.path}
                retry={() => loadPostContent([favorite.id])}
              />
            ) : favorite.excerpt ? <p className="excerpt">{favorite.excerpt}</p> : null}
          </div>
          {!isExpanded && <Link className="favorite-open-link" href={favorite.path}>Open post →</Link>}
        </article>
      })}
      </div>}
      <ShareButtons title="My CurioSphere favorites" url="/favorites/" favorites={favorites} />
    </>
  );
}

function FavoriteFullContent({ content, failed, loading, path, retry }) {
  if (loading) return <p className="favorite-content-status" role="status">Loading full post…</p>;
  if (failed) {
    return (
      <div className="favorite-content-status" role="status">
        <p>The full post could not be loaded.</p>
        <button type="button" onClick={retry}>Try again</button>{" "}
        <Link href={path}>Open post →</Link>
      </div>
    );
  }
  if (!content) return <p className="favorite-content-status" role="status">Loading full post…</p>;
  return <div className="wp-content" dangerouslySetInnerHTML={{ __html: content }} />;
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
