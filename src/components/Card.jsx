import React from "react";

export default function Card({ title, subtitle, icon, children, compact = false, style = {} }) {
  return (
    <section className={`card ${compact ? "card-compact" : ""}`} style={style} aria-labelledby={title}>
      {title && (
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {icon && (
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(30,64,175,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                {icon}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
              {subtitle && <div className="card-subtitle">{subtitle}</div>}
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: title ? 12 : 0 }}>{children}</div>
    </section>
  );
}
