import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { validatePost } from "../utils/validatePost";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { API_URL } from "../config/api";
import toast from "react-hot-toast";
import "../styles/postForm.css";

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isDraft, setIsDraft] = useState(true);

  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState("");
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setPageError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("You must be logged in to edit this post.");
        }

        const [tagsResponse, categoriesResponse, postResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/tags`),
            fetch(`${API_URL}/api/categories`),
            fetch(`${API_URL}/api/posts/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (!tagsResponse.ok) {
          throw new Error("Failed to load tags");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to load categories");
        }

        if (!postResponse.ok) {
          const errorData = await postResponse.json();

          throw new Error(errorData.message || "Failed to load post");
        }

        const [tagsData, categoriesData, postData] = await Promise.all([
          tagsResponse.json(),
          categoriesResponse.json(),
          postResponse.json(),
        ]);

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || user.id !== postData.user_id) {
          throw new Error("You are not authorized to edit this post.");
        }

        setAvailableTags(tagsData);
        setAvailableCategories(categoriesData);

        setTitle(postData.title);
        setContent(postData.content);
        setImageUrl(postData.image_url || "");
        setIsDraft(postData.is_draft);
        setSelectedCategoryId(postData.category_id || "");

        const postTags = Array.isArray(postData.tags) ? postData.tags : [];

        const matchingTagIds = tagsData
          .filter((tag) => postTags.includes(tag.name))
          .map((tag) => tag.id);

        setSelectedTagIds(matchingTagIds);
      } catch (error) {
        console.error("Edit post loading error:", error);
        setPageError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleTagChange = (tagId) => {
    setSelectedTagIds((previousTagIds) => {
      if (previousTagIds.includes(tagId)) {
        return previousTagIds.filter(
          (selectedTagId) => selectedTagId !== tagId,
        );
      }

      return [...previousTagIds, tagId];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrors({});

    const validationErrors = validatePost(title, content, imageUrl);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You must be logged in to edit this post.");
      }

      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl.trim(),
          is_draft: isDraft,
          tagIds: selectedTagIds,
          category_id: selectedCategoryId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update post");
      }

      toast.success(
        isDraft
          ? "Draft updated successfully!"
          : "Published post updated successfully!",
      );

      navigate(`/posts/${id}`);
    } catch (error) {
      console.error("Edit post submission error:", error);

      setErrors({
        general: error.message,
      });

      toast.error(error.message);
    }
  };

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (pageError) {
    return <p>{pageError}</p>;
  }

  return (
    <div className="post-form-page">
      <h1>Edit Post</h1>

      {errors.general && <p>{errors.general}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <br />

          <input
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);

              setErrors((previousErrors) => ({
                ...previousErrors,
                title: "",
              }));
            }}
          />

          {errors.title && <p>{errors.title}</p>}
        </div>

        <br />

        <div>
          <label>Cover Image URL</label>
          <br />

          <input
            type="url"
            value={imageUrl}
            placeholder="https://example.com/image.jpg"
            onChange={(event) => {
              setImageUrl(event.target.value);

              setErrors((previousErrors) => ({
                ...previousErrors,
                imageUrl: "",
              }));
            }}
          />

          {errors.imageUrl && <p>{errors.imageUrl}</p>}
        </div>

        <br />

        <div>
          <div>
            <label>Content (Markdown supported)</label>

            <button
              type="button"
              onClick={() =>
                setShowMarkdownHelp((previousValue) => !previousValue)
              }
              style={{
                marginLeft: "10px",
              }}
            >
              ?
            </button>
          </div>

          {showMarkdownHelp && (
            <div className="markdown-help">
              <h4>Markdown Help</h4>

              <ul>
                <li>
                  <code># Heading</code>
                </li>
                <li>
                  <code>**bold text**</code>
                </li>
                <li>
                  <code>*italic text*</code>
                </li>
                <li>
                  <code>- item</code>
                </li>
                <li>
                  <code>[Link](https://example.com)</code>
                </li>
              </ul>
            </div>
          )}

          <div className="editor-preview-layout">
            <div className="editor-panel">
              <h3>Editor</h3>

              <textarea
                rows="20"
                className="post-textarea"
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);

                  setErrors((previousErrors) => ({
                    ...previousErrors,
                    content: "",
                  }));
                }}
              />

              {errors.content && <p>{errors.content}</p>}
            </div>

            <div className="preview-panel">
              <h3>Preview</h3>

              <MarkdownRenderer content={content} />
            </div>
          </div>
        </div>

        <br />

        <div>
          <h3>Category</h3>

          <select
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
          >
            <option value="">No category</option>

            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <h3>Tags</h3>

          <div className="tag-checkbox-list">
            {availableTags.map((tag) => (
              <label key={tag.id} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={() => handleTagChange(tag.id)}
                />

                {tag.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={isDraft}
              onChange={(event) => setIsDraft(event.target.checked)}
            />
            Save as Draft
          </label>
        </div>

        <br />

        <button type="submit" disabled={submitting} className="submit-button">
          {submitting ? "Updating..." : "Update Post"}
        </button>
      </form>
    </div>
  );
}

export default EditPost;
