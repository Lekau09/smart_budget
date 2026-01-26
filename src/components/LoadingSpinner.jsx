import React from "react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 320,
      flexDirection: "column",
      gap: 16
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: "3px solid var(--border)",
        borderTop: "3px solid var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <div style={{ color: "var(--slate-600)", fontSize: 14, fontWeight: 500 }}>
        {message}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
