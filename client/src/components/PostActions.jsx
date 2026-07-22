function PostActions({ postId, onDelete, deleting, onEdit }) {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={() => onEdit(postId)}>Edit Post</button>

      <button onClick={() => onDelete(postId)} disabled={deleting}>
        {deleting ? "Deleting..." : "Delete Post"}
      </button>
    </div>
  );
}

export default PostActions;
