import axios from "axios";

// Use relative path for API calls - Vite proxy will handle routing
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending httpOnly cookies with requests
});

// Handle responses
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
