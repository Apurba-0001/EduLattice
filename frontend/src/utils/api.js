import axios from "axios";

// Use full backend URL in production, proxy in development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // No cookie config, only Authorization header
});

let csrfToken = localStorage.getItem("csrfToken");

// Handle responses
// Attach Authorization header for all requests if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(config.method.toUpperCase())
    ) {
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    // Treat any API call as user activity to prevent inactivity logout
    // while the user is actively using the app (uploading, navigating, etc.)
    window.dispatchEvent(new Event("user-activity"));
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    // Store CSRF token from response headers if present
    const newCsrfToken = response.headers["x-csrf-token"];
    if (newCsrfToken) {
      csrfToken = newCsrfToken;
      localStorage.setItem("csrfToken", newCsrfToken);
    }

    return response;
  },
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // SECURITY: Clear both token and user data on unauthorized access
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("csrfToken");
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
