import "../../styles/navbar.css";
import { Link } from "react-router-dom";
import { logoutUser } from "../../utils/auth";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    logoutUser("You have been logged out.");
  };

  return (
    <nav>
      <Link to="/" className="site-title">
        <h2>Journal Blog</h2>
      </Link>

      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        {user && (
          <li>
            <Link to="/create">Create Post</Link>
          </li>
        )}

        {!user && (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>

            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}

        {user && (
          <>
            <li>
              <Link to={`/users/${user.id}`} className="welcome-message">
                Welcome back, {user.username}!
              </Link>
            </li>

            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
