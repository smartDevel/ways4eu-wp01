function Comment({ comment, repliesByParent, depth = 0 }) {
  const replies = repliesByParent.get(comment.id) || [];
  const initial = comment.author_name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const date = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${comment.date_gmt}Z`));

  return (
    <li className="comment-item" data-depth={Math.min(depth, 3)}>
      <article>
        <header className="comment-header">
          <span className="comment-avatar" aria-hidden="true">{initial}</span>
          <div>
            <strong>{comment.author_name || "Guest"}</strong>
            <a href={comment.link} target="_blank" rel="noreferrer">
              <time dateTime={`${comment.date_gmt}Z`}>{date}</time>
              <span className="screen-reader-text"> — open this comment on WordPress.com</span>
            </a>
          </div>
        </header>
        <div
          className="comment-content"
          dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
        />
      </article>
      {replies.length > 0 && (
        <ol className="comment-replies">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              repliesByParent={repliesByParent}
              depth={depth + 1}
            />
          ))}
        </ol>
      )}
    </li>
  );
}

export default function WordPressComments({ comments, commentStatus, postUrl }) {
  const available = comments !== null;
  const approvedComments = comments || [];
  const commentIds = new Set(approvedComments.map((comment) => comment.id));
  const repliesByParent = new Map();

  for (const comment of approvedComments) {
    const parent = comment.parent && commentIds.has(comment.parent) ? comment.parent : 0;
    repliesByParent.set(parent, [...(repliesByParent.get(parent) || []), comment]);
  }

  const roots = repliesByParent.get(0) || [];
  const isOpen = commentStatus === "open";
  const commentLabel = approvedComments.length === 1 ? "1 comment" : `${approvedComments.length} comments`;

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <div className="comments-heading-row">
        <div>
          <p className="comments-kicker">Community discussion</p>
          <h2 id="comments-heading">{available ? commentLabel : "Comments"}</h2>
        </div>
        {isOpen && (
          <a className="comment-button" href={`${postUrl}#respond`} target="_blank" rel="noreferrer">
            Write a comment <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      <p className="comments-note">
        Comments are stored with the original article on WordPress.com and protected by its moderation and spam controls.
        {isOpen && " You can comment with a WordPress.com account or continue as a guest."}
      </p>

      {!available && (
        <p className="comments-status" role="status">
          Comments are temporarily unavailable. The article remains available as normal.
        </p>
      )}

      {available && roots.length === 0 && (
        <p className="comments-empty">
          {isOpen ? "No comments yet. Start the conversation." : "There are no comments on this article."}
        </p>
      )}

      {roots.length > 0 && (
        <ol className="comment-list">
          {roots.map((comment) => (
            <Comment key={comment.id} comment={comment} repliesByParent={repliesByParent} />
          ))}
        </ol>
      )}

      {!isOpen && <p className="comments-closed">Comments are closed for this article.</p>}
    </section>
  );
}
