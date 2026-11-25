"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import FavoriteRating from "@/components/FavoriteRating";
import { PostsPerPagePicker } from "@/components/DisplayPreferences";
import { internalPath, postAuthor } from "@/lib/wp";

export default function ListView({ posts, featuredPosts = [], postsPerPage = 10 }) {
  const [expandedPosts, setExpandedPosts] = useState(() => new Set());
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [postContent, setPostContent] = useState(() => new Map());
  const [loadingPosts, setLoadingPosts] = useState(() => new Set());
  const [failedPosts, setFailedPosts] = useState(() => new Set());
  const loadingPostsRef = useRef(new Set());
  const postContentRef = useRef(new Map());
  const displayedPosts = [...featuredPosts, ...posts];
  const allPostsExpanded = displayedPosts.length > 0 && displayedPosts.every((post) => expandedPosts.has(post.id));
  const allExpanded = allPostsExpanded && (featuredPosts.length === 0 || featuredOpen);

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
    if (allExpanded) {
      setExpandedPosts(new Set());
      setFeaturedOpen(false);
    } else {
      setExpandedPosts(new Set(displayedPosts.map((post) => post.id)));
      if (featuredPosts.length > 0) setFeaturedOpen(true);
      loadPostContent(displayedPosts.map((post) => post.id));
    }
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
      for (let index = 0; index < missingIds.length; index += 10) {
        batches.push(missingIds.slice(index, index + 10));
      }
      const responses = await Promise.all(batches.map(async (batch) => {
        const response = await fetch(`/api/posts?ids=${batch.join(",")}`);
        if (!response.ok) throw new Error("Post request failed");
        return response.json();
      }));
      const received = new Set();
      const nextContent = new Map(postContentRef.current);
      for (const batchPosts of responses) {
        for (const post of batchPosts) {
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
      if (failed.size > 0) setFailedPosts((current) => new Set([...current, ...failed]));
    }
  }

  function renderPost(post, featured = false) {
    const author = postAuthor(post);
    const isExpanded = expandedPosts.has(post.id);
    const contentId = `post-content-${post.id}`;
    return (
      <article key={post.id} className={`post-list-item${featured ? " featured-post" : ""}`}>
        <Link href={internalPath(post.link)}>
          <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
        </Link>
        <PostMeta post={post} author={author} />
        <div className="favorite-actions">
          <FavoriteButton post={post} />
          <FavoriteRating post={post} />
        </div>
        <button
          type="button"
          className="post-toggle"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={() => togglePost(post.id)}
        >
          <span>{isExpanded ? "Show excerpt" : "Read full post"}</span>
          <span className="post-toggle-icon" aria-hidden="true">⌄</span>
        </button>
        {isExpanded ? (
          <div id={contentId}>
            <PostFullContent
              content={postContent.get(post.id)}
              failed={failedPosts.has(post.id)}
              loading={loadingPosts.has(post.id)}
              path={internalPath(post.link)}
              retry={() => loadPostContent([post.id])}
            />
          </div>
        ) : (
          <div id={contentId} className="excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
        )}
      </article>
    );
  }

  return (
    <>
      <div className="post-list-controls">
        <PostsPerPagePicker value={postsPerPage} />
        <button
          type="button"
          className="all-posts-toggle"
          aria-expanded={allExpanded}
          aria-controls={displayedPosts.map((post) => `post-content-${post.id}`).join(" ")}
          onClick={toggleAllPosts}
        >
          {allExpanded ? "Collapse all posts" : "Expand all posts"}
        </button>
      </div>
      {featuredPosts.length > 0 && (
        <section className="featured-posts" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="post-section-heading">
            <button
              type="button"
              className="featured-section-toggle"
              aria-expanded={featuredOpen}
              aria-controls="featured-posts-content"
              onClick={() => setFeaturedOpen((current) => !current)}
            >
              <span>Featured</span>
              <span className="featured-toggle-icon" aria-hidden="true">⌄</span>
            </button>
          </h2>
          <div id="featured-posts-content" hidden={!featuredOpen}>
            {featuredPosts.map((post) => renderPost(post, true))}
          </div>
        </section>
      )}
      {featuredPosts.length > 0 && <h2 className="post-section-heading latest-posts-heading">Latest posts</h2>}
      {posts.map((post) => renderPost(post))}
    </>
  );
}

function PostFullContent({ content, failed, loading, path, retry }) {
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

export function PostMeta({ post, author = postAuthor(post) }) {
  const date = new Date(post.date);
  return (
    <div className="post-meta">
      {author && <Link href={internalPath(author.link)}>By <b>{author.name}</b></Link>}{" "}
      on <b>{date.toDateString()}</b>
    </div>
  );
}
