import axios from "axios";

// Use full backend URL in production, proxy in development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // No cookie config, only Authorization header
});

// Handle responses
// Attach Authorization header for all requests if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear user data on unauthorized access (only for protected routes)
      localStorage.removeItem("user");
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
