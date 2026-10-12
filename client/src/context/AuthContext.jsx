import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Load the authenticated user profile when token is available on startup
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (response.data && response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // Register function
  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });
    if (response.data?.success) {
      const { user: userData, token: userToken } = response.data.data;
      localStorage.setItem("token", userToken);
      setToken(userToken);
      setUser(userData);
      return response.data;
    }
  };

  // Login function
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data?.success) {
      const { user: userData, token: userToken } = response.data.data;
      localStorage.setItem("token", userToken);
      setToken(userToken);
      setUser(userData);
      return response.data;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
