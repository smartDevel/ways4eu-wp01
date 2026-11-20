"use client";

import Link from "next/link";
import { useState } from "react";
import { internalPath, postAuthor } from "@/lib/wp";

export default function ListView({ posts }) {
  const [full, setFull] = useState(false);

  return (
    <>
      <div className="button-row view-toggle" aria-label="Post view">
        <button type="button" className={!full ? "selected" : ""} aria-pressed={!full} onClick={() => setFull(false)}>
          Excerpt-View
        </button>
        <button type="button" className={full ? "selected" : ""} aria-pressed={full} onClick={() => setFull(true)}>
          Full-View
        </button>
      </div>
      {posts.map((post) => {
        const author = postAuthor(post);
        return (
          <article key={post.id} className="post-list-item">
            <Link href={internalPath(post.link)}>
              <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
            </Link>
            <PostMeta post={post} author={author} />
            {full ? (
              <div className="wp-content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
            ) : (
              <div className="excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
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
