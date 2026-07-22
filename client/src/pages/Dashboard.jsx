import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { API_URL } from "../config/api";
import "../styles/dashboard.css";

function Dashboard() {
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loadingPublished, setLoadingPublished] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [pageError, setPageError] = useState("");

  const fetchPublishedPosts = async (search = "", tag = "") => {
    try {
      setLoadingPublished(true);
      setPageError("");

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (tag) {
        params.append("tag", tag);
      }

      const queryString = params.toString();

      const url = queryString
        ? `${API_URL}/api/posts?${queryString}`
        : `${API_URL}/api/posts`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch published posts");
      }

      setPublishedPosts(data);
    } catch (error) {
      console.error("Published posts fetch error:", error);
      setPageError(error.message);
    } finally {
      setLoadingPublished(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("token");

      await fetchPublishedPosts();

      if (!token) {
        setDraftPosts([]);
        setLoadingDrafts(false);
        return;
      }

      try {
        setLoadingDrafts(true);

        const response = await fetch(`${API_URL}/api/posts/my-drafts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch drafts");
        }

        setDraftPosts(data);
      } catch (error) {
        console.error("Draft posts fetch error:", error);
        setPageError(error.message);
      } finally {
        setLoadingDrafts(false);
      }
    };

    loadDashboard();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchPublishedPosts(searchTerm, selectedTag);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    fetchPublishedPosts(searchTerm, tag);
  };

  const clearTagFilter = () => {
    setSelectedTag("");
    fetchPublishedPosts(searchTerm, "");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Browse published posts and manage your private drafts.</p>
      </div>

      {pageError && <p className="empty-message">{pageError}</p>}

      <section className="post-section">
        <div className="post-section-header">
          <h2>Published Posts</h2>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search published posts..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <button type="submit">Search</button>
          </form>

          {selectedTag && (
            <p className="active-filter">
              Filtering by tag: <strong>{selectedTag}</strong>{" "}
              <button type="button" onClick={clearTagFilter}>
                Clear
              </button>
            </p>
          )}
        </div>

        {loadingPublished ? (
          <p className="empty-message">Loading published posts...</p>
        ) : publishedPosts.length === 0 ? (
          <p className="empty-message">No published posts found.</p>
        ) : (
          <div className="posts-grid">
            {publishedPosts.map((post) => (
              <PostCard key={post.id} post={post} onTagClick={handleTagClick} />
            ))}
          </div>
        )}
      </section>

      <section className="post-section">
        <h2>Drafts</h2>

        {loadingDrafts ? (
          <p className="empty-message">Loading drafts...</p>
        ) : draftPosts.length === 0 ? (
          <p className="empty-message">No drafts yet.</p>
        ) : (
          <div className="posts-grid">
            {draftPosts.map((post) => (
              <PostCard key={post.id} post={post} onTagClick={handleTagClick} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
