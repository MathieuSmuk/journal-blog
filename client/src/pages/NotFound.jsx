import { Link } from "react-router-dom";
import "../styles/notFound.css";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <h1>404</h1>

        <h2>Page Not Found</h2>

        <p className="not-found-url">
          Requested path: {window.location.pathname}
        </p>

        <p>
          Sorry, the page you're looking for doesn't exist or may have been
          moved.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="primary-button">
            Return Home
          </Link>

          <Link to="/dashboard" className="secondary-button">
            Browse Posts
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
