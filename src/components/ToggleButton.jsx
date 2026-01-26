import React from "react";

export default function ToggleButton({ open, onClick, label = "Toggle sidebar" }) {
  return (
    <button
      className="sidebar-toggle"
      aria-expanded={!open}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <i className={`fa-solid ${open ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
    </button>
  );
}
