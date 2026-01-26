import React, { useState } from "react";
import Card from "../../components/Card";
import { Globe, Smartphone, Monitor, Trash2, Shield, Clock } from "lucide-react";

export default function Sessions() {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      browser: "Chrome",
      deviceType: "Desktop",
      location: "Dar es Salaam, TZ",
      lastActive: new Date(Date.now() - 1000 * 60),
      current: true
    },
    {
      id: 2,
      device: "Safari on iPhone",
      browser: "Safari",
      deviceType: "Mobile",
      location: "Dar es Salaam, TZ",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
      current: false
    },
    {
      id: 3,
      device: "Firefox on Linux",
      browser: "Firefox",
      deviceType: "Desktop",
      location: "Dar es Salaam, TZ",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
      current: false
    }
  ]);

  const [message, setMessage] = useState(null);

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case "Mobile":
        return "📱";
      case "Desktop":
        return "🖥";
      default:
        return "💻";
    }
  };

  const formatLastActive = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `Active ${minutes} minutes ago`;
    if (hours < 24) return `Active ${hours} hours ago`;
    return `Active ${days} days ago`;
  };

  const handleLogoutSession = (id) => {
    if (sessions.find(s => s.id === id)?.current) {
      setMessage({ type: "warning", text: "You cannot logout your current session" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setSessions(sessions.filter(s => s.id !== id));
    setMessage({ type: "success", text: "✓ Session ended" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogoutAllOthers = () => {
    if (!window.confirm("End all other sessions? You'll stay logged in on this device.")) return;
    setSessions(sessions.filter(s => s.current));
    setMessage({ type: "success", text: "✓ All other sessions have been ended" });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="page-title">Session Management</div>
        <div className="page-subtitle">Monitor and manage your active login sessions</div>
      </div>

      {/* Status Messages */}
      {message && (
        <div style={{
          marginBottom: 16,
          padding: "12px 16px",
          borderRadius: "8px",
          backgroundColor:
            message.type === "success" ? "#D1FAE5" :
              message.type === "warning" ? "#FEF3C7" : "#FEE2E2",
          color:
            message.type === "success" ? "#047857" :
              message.type === "warning" ? "#92400E" : "#991B1B",
          fontSize: 14,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          {message.type === "success" ? "✓" : "!"} {message.text}
        </div>
      )}

      {/* Security Alert */}
      <Card style={{ marginBottom: 20, padding: "12px 16px", backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD" }}>
        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
          <div style={{ fontSize: 20 }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 600, color: "#0369A1", marginBottom: 4 }}>Security Tip</div>
            <div style={{ fontSize: 13, color: "#0C4A6E" }}>
              Regularly review your sessions and log out from devices you no longer use. This helps keep your account secure.
            </div>
          </div>
        </div>
      </Card>

      {/* Session Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{
          padding: "16px",
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          boxShadow: "var(--card-shadow)"
        }}>
          <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 6 }}>Active Sessions</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent-blue)" }}>{sessions.length}</div>
        </div>
        <div style={{
          padding: "16px",
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          boxShadow: "var(--card-shadow)"
        }}>
          <div style={{ fontSize: 12, color: "var(--slate-600)", marginBottom: 6 }}>Current Session</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--navy-900)" }}>Chrome on Windows</div>
        </div>
      </div>

      {/* Sessions List */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--navy-900)" }}>Your Sessions</div>
            <div style={{ fontSize: 13, color: "var(--slate-600)" }}>Devices and browsers where you're logged in</div>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={handleLogoutAllOthers}
              style={{
                padding: "8px 16px",
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 12
              }}
            >
              End Other Sessions
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={{
                padding: "16px",
                backgroundColor: session.current ? "#F0F9FF" : "var(--slate-50)",
                border: session.current ? "2px solid var(--accent-blue)" : "1px solid var(--border-color)",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: 12
              }}
            >
              {/* Left Side - Device Info */}
              <div style={{ flex: 1, display: "flex", gap: 12 }}>
                <div style={{ fontSize: 32, textAlign: "center", minWidth: 40 }}>
                  {getDeviceIcon(session.deviceType)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, color: "var(--navy-900)" }}>{session.device}</div>
                    {session.current && (
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        backgroundColor: "var(--accent-blue)",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: "3px"
                      }}>
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--slate-600)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {session.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {formatLastActive(session.lastActive)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Actions */}
              {!session.current && (
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#FCA5A5";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#FEE2E2";
                  }}
                >
                  End Session
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Session Settings */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: "var(--navy-900)", marginBottom: 4 }}>Session Settings</div>
          <div style={{ fontSize: 13, color: "var(--slate-600)" }}>Control your session preferences</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            padding: "12px",
            backgroundColor: "var(--slate-50)",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--navy-900)", fontSize: 14, marginBottom: 2 }}>
                Session Notifications
              </div>
              <div style={{ fontSize: 12, color: "var(--slate-600)" }}>
                Get notified when logging in from a new device
              </div>
            </div>
            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: 8
            }}>
              <input type="checkbox" defaultChecked style={{ cursor: "pointer", width: 20, height: 20 }} />
            </label>
          </div>

          <div style={{
            padding: "12px",
            backgroundColor: "var(--slate-50)",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--navy-900)", fontSize: 14, marginBottom: 2 }}>
                ⏰ Auto-logout
              </div>
              <div style={{ fontSize: 12, color: "var(--slate-600)" }}>
                Automatically logout after 30 minutes of inactivity
              </div>
            </div>
            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: 8
            }}>
              <input type="checkbox" style={{ cursor: "pointer", width: 20, height: 20 }} />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
