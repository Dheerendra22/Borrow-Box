import axios from "axios";

// Create an Axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second request timeout
});

// Request interceptor: Attach JWT token to Authorization header if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Normalizes network errors and handles 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Session expiration / Unauthorized handling
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }

    // 2. Safe error message normalization for network loss or server timeouts
    if (!error.response) {
      if (!error.message || error.message === "Network Error") {
        error.userFriendlyMessage = "Cannot reach server. Please check your connection and try again.";
      } else {
        error.userFriendlyMessage = error.message;
      }
    } else {
      error.userFriendlyMessage = error.response.data?.message || "An unexpected error occurred.";
    }

    return Promise.reject(error);
  }
);

export default api;
