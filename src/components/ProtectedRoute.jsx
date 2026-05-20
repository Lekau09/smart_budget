import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    console.log("🛡️ ProtectedRoute: loading", loading, "user", user);
  }, [loading, user]);

  if (loading) {
    console.log("🛡️ ProtectedRoute: showing loading spinner");
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--surface)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <div style={{ fontSize: "16px", color: "var(--text-muted)" }}>Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("🛡️ ProtectedRoute: no user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("🛡️ ProtectedRoute: user authenticated, rendering children");
  return children;
}
