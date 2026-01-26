import React from "react";

export default function Loading({ size = "md" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "32px 20px", minHeight: size === "sm" ? 100 : 200 }}>
      <div style={{ position: "relative", width: size === "sm" ? 32 : 48, height: size === "sm" ? 32 : 48 }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
          .spinner { animation: spin 0.8s linear infinite; }
          .pulse { animation: pulse 2s ease-in-out infinite; }
        `}</style>
        <svg className="spinner" viewBox="0 0 50 50" style={{ width: "100%", height: "100%" }}>
          <circle cx="25" cy="25" r="20" fill="none" stroke="#0B5FFF" strokeWidth="3" strokeDasharray="31.4 94.2" />
        </svg>
      </div>
      <div style={{ fontSize: 13, color: "var(--slate-600)", fontWeight: 500 }}>Loading…</div>
    </div>
  );
}
