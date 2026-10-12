import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "./Card";

// Guard for protected routes: redirects unauthenticated users to /login
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full animate-pulse space-y-6">
        <div className="h-28 bg-slate-200/80 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-200/80 rounded-2xl" />
          <div className="h-24 bg-slate-200/80 rounded-2xl" />
          <div className="h-24 bg-slate-200/80 rounded-2xl" />
        </div>
        <Card className="p-8 h-64 bg-slate-200/50" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Guard for guest-only routes: redirects authenticated users to /dashboard
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
