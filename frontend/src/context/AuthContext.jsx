import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/api";
import useInactivityTimeout from "../hooks/useInactivityTimeout";

// Fallback: 15 minutes (matches backend default)
const DEFAULT_SESSION_TIMEOUT_MS = 15 * 60 * 1000;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeoutMs, setSessionTimeoutMs] = useState(
    DEFAULT_SESSION_TIMEOUT_MS,
  );

  // Initialize on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const isPageRefresh = sessionStorage.getItem("auth_session_active");

    // If sessionStorage missing, the tab was actually closed (clear localStorage)
    // If sessionStorage exists, it's a page refresh (restore from localStorage)
    if (!isPageRefresh && savedUser) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } else if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }

    // Mark this session as active (persists on refresh, cleared on tab close)
    sessionStorage.setItem("auth_session_active", "true");
    setLoading(false);
  }, []);

  // Fetch session timeout from backend config
  useEffect(() => {
    api
      .get("/config")
      .then((res) => {
        if (res.data?.data?.sessionTimeoutMs) {
          setSessionTimeoutMs(res.data.data.sessionTimeoutMs);
        }
      })
      .catch(() => {
        // Fallback to default if config endpoint unavailable
      });
  }, []);

  // Cleanup on window/tab close (don't interfere with page refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only notify backend on actual close (best effort)
      // Don't clear localStorage here - let sessionStorage handle it
      try {
        navigator.sendBeacon("/api/auth/logout");
      } catch {
        // Beacon may fail on page close — safe to ignore
      }
    };

    // beforeunload fires on close AND refresh, but sessionStorage protects refresh
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const userData = response.data.data || response.data.user || null;
      const token = response.data.token;

      if (!userData || !token) {
        return { success: false, message: "Invalid login response." };
      }

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const userData = response.data.data;
      const token = response.data.token;

      if (!userData || !token) {
        return { success: false, message: "Invalid registration response." };
      }

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  // Auto-logout on inactivity
  const handleInactivityTimeout = useCallback(() => {
    if (user) {
      alert("You have been logged out due to inactivity.");
      logout();
    }
  }, [user]);

  useInactivityTimeout(handleInactivityTimeout, sessionTimeoutMs, !!user);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
