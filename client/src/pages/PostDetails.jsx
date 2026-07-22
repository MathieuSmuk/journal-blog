import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostActions from "../components/PostActions";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { API_URL } from "../config/api";
import toast from "react-hot-toast";
import "../styles/postDetails.css";
import "../styles/tags.css";

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setPageError("");

        const token = localStorage.getItem("token");

        const headers = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/posts/${id}`, {
          headers,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Post not found");
        }

        setPost(data);
      } catch (error) {
        console.error("Post loading error:", error);
        setPageError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleting(true);
      setActionError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You must be logged in to delete this post.");
      }

      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }

      toast.success(
        post.is_draft
          ? "Draft deleted successfully!"
          : "Post deleted successfully!",
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Post deletion error:", error);

      setActionError(error.message);
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (pageError) {
    return <p>Error: {pageError}</p>;
  }

  if (!post) {
    return <p>Post not found.</p>;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const isOwner = user?.id === post.user_id;

  return (
    <div className="post-details-page">
      <article className="post-details-card">
        <h1>{post.title}</h1>

        {post.category && (
          <span className="category-badge">{post.category}</span>
        )}

        <p className="post-meta">
          By <Link to={`/users/${post.user_id}`}>{post.author}</Link> ·{" "}
          {new Date(post.created_at).toLocaleDateString()}
        </p>

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="tag-list">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-badge">
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.updated_at && post.updated_at !== post.created_at && (
          <p className="post-updated">
            Updated {new Date(post.updated_at).toLocaleDateString()}
          </p>
        )}

        {post.image_url && (
          <img
            src={post.image_url}
            alt={`Cover for ${post.title}`}
            className="post-details-image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}

        <MarkdownRenderer content={post.content} />

        {isOwner && (
          <PostActions
            postId={post.id}
            deleting={deleting}
            onEdit={(postId) => navigate(`/edit/${postId}`)}
            onDelete={handleDelete}
          />
        )}

        {actionError && <p className="action-error">{actionError}</p>}

        {isOwner && (
          <p className="post-status">
            Status: {post.is_draft ? "Draft" : "Published"}
          </p>
        )}

        <small className="post-created">
          First created: {new Date(post.created_at).toLocaleString()}
        </small>
      </article>
    </div>
  );
}

export default PostDetails;
