export function validatePost(title, content, imageUrl = "") {
  const errors = {};

  const MIN_TITLE_LENGTH = 3;
  const MIN_CONTENT_LENGTH = 10;

  if (title.trim().length < MIN_TITLE_LENGTH) {
    errors.title = "Title must be at least 3 characters";
  }

  if (content.trim().length < MIN_CONTENT_LENGTH) {
    errors.content = "Content must be at least 10 characters";
  }

  if (
    imageUrl.trim() &&
    !imageUrl.trim().startsWith("http://") &&
    !imageUrl.trim().startsWith("https://")
  ) {
    errors.imageUrl = "Image URL must start with http:// or https://";
  }

  return errors;
}
