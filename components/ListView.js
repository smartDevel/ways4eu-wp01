"use client";

import Link from "next/link";
import { useState } from "react";
import { internalPath, postAuthor } from "@/lib/wp";

export default function ListView({ posts, featuredPosts = [] }) {
  const [expandedPosts, setExpandedPosts] = useState(() => new Set());
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const displayedPosts = [...featuredPosts, ...posts];
  const allPostsExpanded = displayedPosts.length > 0 && displayedPosts.every((post) => expandedPosts.has(post.id));
  const allExpanded = allPostsExpanded && (featuredPosts.length === 0 || featuredOpen);

  function togglePost(postId) {
    setExpandedPosts((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function toggleAllPosts() {
    if (allExpanded) {
      setExpandedPosts(new Set());
      setFeaturedOpen(false);
    } else {
      setExpandedPosts(new Set(displayedPosts.map((post) => post.id)));
      if (featuredPosts.length > 0) setFeaturedOpen(true);
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
          <div id={contentId} className="wp-content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
        ) : (
          <div id={contentId} className="excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
        )}
      </article>
    );
  }

  return (
    <>
      <div className="post-list-controls">
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

export function PostMeta({ post, author = postAuthor(post) }) {
  const date = new Date(post.date);
  return (
    <div className="post-meta">
      {author && <Link href={internalPath(author.link)}>By <b>{author.name}</b></Link>}{" "}
      on <b>{date.toDateString()}</b>
    </div>
  );
}
