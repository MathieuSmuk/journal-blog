import { Link } from "react-router-dom";
import truncateText from "../utils/truncateText";
import MarkdownRenderer from "./MarkdownRenderer";
import "../styles/postCard.css";
import "../styles/tags.css";

function PostCard({ post, onTagClick }) {
  const preview = truncateText(post.content, 150);

  return (
    <article className="post-card">
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="post-card-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      {post.category && <span className="category-badge">{post.category}</span>}
      <div className="post-card-header">
        {post.is_draft && <span className="draft-badge">Draft</span>}

        <h3>
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h3>

        <p className="post-meta">
          By <Link to={`/users/${post.user_id}`}>{post.author}</Link> ·{" "}
          {new Date(post.created_at).toLocaleDateString()}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="tag-list">
            {post.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="tag-badge tag-button"
                onClick={() => onTagClick && onTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="post-preview">
        <MarkdownRenderer content={preview} />
      </div>

      <Link className="read-more-link" to={`/posts/${post.id}`}>
        Read More →
      </Link>
    </article>
  );
}

export default PostCard;
