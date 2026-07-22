import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validatePost } from "../utils/validatePost";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { API_URL } from "../config/api";
import toast from "react-hot-toast";
import "../styles/postForm.css";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        const [tagsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_URL}/api/tags`),
          fetch(`${API_URL}/api/categories`),
        ]);

        if (!tagsResponse.ok) {
          throw new Error("Failed to load tags");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to load categories");
        }

        const [tagsData, categoriesData] = await Promise.all([
          tagsResponse.json(),
          categoriesResponse.json(),
        ]);

        setAvailableTags(tagsData);
        setAvailableCategories(categoriesData);
      } catch (error) {
        console.error(error);

        setErrors((previousErrors) => ({
          ...previousErrors,
          general: error.message,
        }));
      }
    };

    loadFormOptions();
  }, []);

  const handleTagChange = (tagId) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }

      return [...prev, tagId];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);

    setErrors({});

    const validationErrors = validatePost(title, content, imageUrl);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
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
        throw new Error(data.message || "Failed to create post");
      }

      toast.success(
        isDraft ? "Draft saved successfully!" : "Post published successfully!",
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Create post error:", error);

      setErrors({
        general: error.message,
      });

      toast.error(error.message);
    }
  };

  return (
    <div className="post-form-page">
      <h1>Create Post</h1>

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

              setErrors((prev) => ({
                ...prev,
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

              setErrors((prev) => ({
                ...prev,
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
              onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
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
            {/* Markdown Editor */}
            <div className="editor-panel">
              <h3>Editor</h3>

              <textarea
                rows="20"
                className="post-textarea"
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    content: "",
                  }));
                }}
              />

              {errors.content && <p>{errors.content}</p>}
            </div>

            {/* Markdown Preview */}
            <div
              style={{
                width: "50%",
                border: "1px solid #ccc",
                padding: "15px",
                minHeight: "300px",
              }}
            >
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

          {availableTags.map((tag) => (
            <label key={tag.id}>
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => handleTagChange(tag.id)}
              />
              {tag.name}
            </label>
          ))}
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
          {submitting ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
