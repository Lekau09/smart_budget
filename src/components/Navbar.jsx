import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Menu, Settings, Lock, LogOut, Search as SearchIcon } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Navbar({ onToggle }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("Month");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          onClick={onToggle} 
          aria-label="Toggle sidebar"
          className="btn"
          title="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="search">
          <SearchIcon size={18} />
          <input
            type="text"
            placeholder="Search transactions, categories"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
          />
        </div>

        <div className="time-filter">
          {["Week", "Month", "Year"].map((range) => (
            <button
              key={range}
              className={timeRange === range ? "active" : ""}
              onClick={() => setTimeRange(range)}
              aria-pressed={timeRange === range}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        <NotificationBell />

        <div className="user-menu" ref={dropdownRef}>
          <button
            className="user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            title={user?.name || "User menu"}
          >
            <div>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="user-name">{user?.name || "User"}</div>
              <div className="user-email">{user?.email || "Not logged in"}</div>
            </div>
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <button onClick={() => { navigate("/app/settings"); setDropdownOpen(false); }}>
                <Settings size={18} />
                Settings
              </button>
              <button onClick={() => { navigate("/app/sessions"); setDropdownOpen(false); }}>
                <Lock size={18} />
                Sessions
              </button>
              <hr />
              <button className="logout" onClick={handleLogout}>
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
