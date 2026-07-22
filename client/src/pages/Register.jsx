import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import toast from "react-hot-toast";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail || !password) {
      setError("Username, email, and password are required.");
      return;
    }

    if (trimmedUsername.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created! You can now log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      setError(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-username">Username</label>
          <br />

          <input
            id="register-username"
            type="text"
            value={username}
            autoComplete="username"
            required
            minLength={2}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
          />
        </div>

        <br />

        <div>
          <label htmlFor="register-email">Email</label>
          <br />

          <input
            id="register-email"
            type="email"
            value={email}
            autoComplete="email"
            required
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
          />
        </div>

        <br />

        <div>
          <label htmlFor="register-password">Password</label>
          <br />

          <input
            id="register-password"
            type="password"
            value={password}
            autoComplete="new-password"
            required
            minLength={8}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
          />
        </div>

        <br />

        <button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;
