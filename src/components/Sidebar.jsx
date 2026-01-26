import React from "react";
import { NavLink } from "react-router-dom";
import { Home, List, CreditCard, BarChart3, Target, Clock, Settings as IconSettings, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed }) {
  const nav = [
    { to: "/app/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/app/transactions", label: "Transactions", icon: <List size={20} /> },
    { to: "/app/savings", label: "Savings", icon: <CreditCard size={20} /> },
    { to: "/app/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
    { to: "/app/goals", label: "Goals", icon: <Target size={20} /> },
    { to: "/app/settings", label: "Settings", icon: <IconSettings size={20} /> }
  ];

  return (
    <aside className="sidebar" style={{ display: "flex", flexDirection: "column", height: "100vh" }} aria-label="Navigation">
      <div className="brand" role="banner">
        <div className="logo" aria-hidden="true">SB</div>
        {!collapsed && <div className="title">SmartBudget</div>}
      </div>

      <nav className="nav" aria-label="Main navigation" style={{ flex: 1 }}>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            title={collapsed ? item.label : undefined}
            style={{ textDecoration: "none" }}
          >
            <span className="icon" aria-hidden="true">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="collapse" aria-hidden={false}>
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-pressed={collapsed}
          title={collapsed ? "Expand" : "Collapse"}
          style={{ textDecoration: "none" }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
