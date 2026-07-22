import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="home-page">
      <section className="hero-section">
        <p className="eyebrow">Personal Journal Blog Platform</p>

        <h1>Write, save drafts, and publish your thoughts.</h1>

        <p className="hero-text">
          A full-stack blogging app built for Markdown writing, private drafts,
          user-owned posts, and public published entries.
        </p>

        <div className="hero-actions">
          <Link to="/dashboard" className="primary-button">
            View Posts
          </Link>

          {user ? (
            <Link to="/create" className="secondary-button">
              Create Post
            </Link>
          ) : (
            <Link to="/register" className="secondary-button">
              Create Account
            </Link>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2>Features</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Markdown Writing</h3>
            <p>
              Compose posts with headings, lists, links, bold text, and live
              previews.
            </p>
          </div>

          <div className="feature-card">
            <h3>Drafts & Publishing</h3>
            <p>
              Save work privately as drafts, then publish when your post is
              ready.
            </p>
          </div>

          <div className="feature-card">
            <h3>User Ownership</h3>
            <p>
              Each user controls their own posts, drafts, edits, and deletes.
            </p>
          </div>

          <div className="feature-card">
            <h3>Public Blog</h3>
            <p>
              Published posts are visible to readers while drafts stay private.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
