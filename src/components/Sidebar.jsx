import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home, List, CreditCard, BarChart3,
  Settings as IconSettings
} from "lucide-react";

export default function Sidebar({ collapsed }) {
  const mainNav = [
    { to: "/app/dashboard",    label: "Dashboard",    icon: <Home size={20} /> },
    { to: "/app/transactions", label: "Transactions", icon: <List size={20} /> },
    { to: "/app/savings",      label: "Savings",      icon: <CreditCard size={20} /> },
    { to: "/app/analytics",    label: "Analytics",    icon: <BarChart3 size={20} /> },
  ];

  const navItemStyle = { textDecoration: "none" };

  return (
    <aside className="sidebar"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}     
      aria-label="Navigation">

      {/* Brand — same height as navbar (64px) so logo aligns with navbar content */}
      <div className="brand" role="banner" style={{ display:'flex', alignItems:'center', gap:10, padding:'0 14px', height:64, flexShrink:0 }}>
        {/* Blue wallet icon box — matches landing page */}
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#3B82F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',      
          flexShrink: 0,
        }}>
          {/* Lucide Wallet icon — same as landing page */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
          </svg>
        </div>
        {!collapsed && (
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            SmartSpend
          </span>
        )}
      </div>

      {/* Main nav — grows to fill space */}
      <nav className="nav" aria-label="Main navigation" style={{ flex: 1 }}>    
        {mainNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            title={collapsed ? item.label : undefined}
            style={navItemStyle}
          >
            <span className="icon" aria-hidden="true">{item.icon}</span>        
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section — Settings */}
      <div style={{ paddingBottom: 8 }}>
        {/* Settings pinned to bottom */}
        <NavLink
          to="/app/settings"
          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          title={collapsed ? "Settings" : undefined}
          style={navItemStyle}
        >
          <span className="icon" aria-hidden="true"><IconSettings size={20} /></span>
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>

    </aside>
  );
}
