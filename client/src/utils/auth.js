import toast from "react-hot-toast";

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function logoutUser(message = "") {
  clearAuth();

  if (message) {
    sessionStorage.setItem("authMessage", message);
  }

  window.location.href = "/login";
}

export function handleAuthResponse(response) {
  if (response.status === 401) {
    logoutUser("Your session expired. Please log in again.");
    return null;
  }

  return response;
}

export function showStoredAuthMessage() {
  const message = sessionStorage.getItem("authMessage");

  if (message) {
    toast.error(message);
    sessionStorage.removeItem("authMessage");
  }
}
