import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import { API_URL } from "../config/api";

function UserProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setPageError("");
        setProfile(null);

        const response = await fetch(`${API_URL}/api/users/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load user profile");
        }

        setProfile(data);
      } catch (error) {
        console.error("User profile loading error:", error);
        setPageError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (pageError) {
    return <p>Error: {pageError}</p>;
  }

  if (!profile?.user) {
    return <p>User profile not found.</p>;
  }

  const publishedPosts = Array.isArray(profile.posts) ? profile.posts : [];

  return (
    <div className="user-profile-page">
      <header className="profile-header">
        <h1>{profile.user.username}</h1>

        <p>Joined {new Date(profile.user.created_at).toLocaleDateString()}</p>

        <p>
          {publishedPosts.length}{" "}
          {publishedPosts.length === 1 ? "published post" : "published posts"}
        </p>
      </header>

      <section className="profile-posts">
        <h2>Published Posts</h2>

        {publishedPosts.length === 0 ? (
          <p className="empty-message">No published posts yet.</p>
        ) : (
          <div className="posts-grid">
            {publishedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default UserProfile;
