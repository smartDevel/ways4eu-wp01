"use client";

import Link from "next/link";
import { useState } from "react";
import { internalPath, postAuthor } from "@/lib/wp";

export default function ListView({ posts }) {
  const [expandedPosts, setExpandedPosts] = useState(() => new Set());
  const allExpanded = posts.length > 0 && posts.every((post) => expandedPosts.has(post.id));

  function togglePost(postId) {
    setExpandedPosts((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function toggleAllPosts() {
    setExpandedPosts(allExpanded ? new Set() : new Set(posts.map((post) => post.id)));
  }

  return (
    <>
      <div className="post-list-controls">
        <button
          type="button"
          className="all-posts-toggle"
          aria-expanded={allExpanded}
          aria-controls={posts.map((post) => `post-content-${post.id}`).join(" ")}
          onClick={toggleAllPosts}
        >
          {allExpanded ? "Collapse all posts" : "Expand all posts"}
        </button>
      </div>
      {posts.map((post) => {
        const author = postAuthor(post);
        const isExpanded = expandedPosts.has(post.id);
        const contentId = `post-content-${post.id}`;
        return (
          <article key={post.id} className="post-list-item">
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
      })}
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
