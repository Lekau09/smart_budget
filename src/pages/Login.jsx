import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      await login(email.trim(), password);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => navigate("/app/dashboard"), 1000);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(135deg, var(--bg-page) 0%, var(--bg-secondary) 100%)", 
      padding: "var(--spacing-lg)"
    }}>
      <div style={{ 
        maxWidth: "420px", 
        width: "100%",
        animation: "slideInUp 500ms ease-out"
      }}>
        {/* Main Card */}
        <div style={{ 
          background: "var(--bg-primary)", 
          padding: "var(--spacing-3xl)",
          borderRadius: "var(--radius-2xl)", 
          boxShadow: "var(--shadow-xl)", 
          border: "1px solid var(--border-light)"
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-2xl)" }}>
            <div style={{ 
              width: "56px", 
              height: "56px", 
              background: "linear-gradient(135deg, var(--primary-main) 0%, var(--primary-dark) 100%)",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--spacing-lg)",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.24)"
            }}>
              <Mail size={28} color="#ffffff" strokeWidth={2} />
            </div>
            <h1 style={{ 
              fontSize: "var(--font-size-3xl)", 
              fontWeight: 800, 
              color: "var(--primary-dark)", 
              margin: "0 0 var(--spacing-sm) 0",
              letterSpacing: "-0.5px"
            }}>Welcome Back</h1>
            <p style={{ 
              fontSize: "var(--font-size-sm)", 
              color: "var(--text-muted)", 
              margin: 0,
              fontWeight: 500
            }}>Log in to your SmartBudget account</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="alert alert-danger" style={{ animation: "slideInUp 300ms ease" }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ animation: "slideInUp 300ms ease" }}>
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  style={{
                    paddingLeft: "var(--spacing-2xl)",
                    fontSize: "var(--font-size-sm)"
                  }}
                  className="form-input"
                />
                <Mail size={18} style={{ 
                  position: "absolute", 
                  left: "var(--spacing-md)", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--text-muted)",
                  pointerEvents: "none"
                }} />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)" }}>
                <label className="form-label">Password</label>
                <a href="#" style={{ 
                  fontSize: "var(--font-size-xs)", 
                  color: "var(--primary-main)", 
                  textDecoration: "none", 
                  fontWeight: 600,
                  transition: "color var(--transition-fast)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-dark)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--primary-main)"}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  style={{
                    paddingLeft: "var(--spacing-2xl)",
                    paddingRight: "var(--spacing-2xl)",
                    fontSize: "var(--font-size-sm)"
                  }}
                  className="form-input"
                />
                <Lock size={18} style={{ 
                  position: "absolute", 
                  left: "var(--spacing-md)", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--text-muted)",
                  pointerEvents: "none"
                }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{ 
                    position: "absolute", 
                    right: "var(--spacing-md)", 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    background: "none", 
                    border: "none", 
                    cursor: loading ? "not-allowed" : "pointer", 
                    color: "var(--text-muted)",
                    padding: 0,
                    opacity: loading ? 0.5 : 1,
                    transition: "color var(--transition-fast)"
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.color = "var(--primary-main)")}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "var(--spacing-sm)", 
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              userSelect: "none"
            }}>
              <input 
                type="checkbox" 
                disabled={loading}
                style={{ 
                  cursor: loading ? "not-allowed" : "pointer", 
                  width: "18px", 
                  height: "18px",
                  accentColor: "var(--primary-main)"
                }} 
              />
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", fontWeight: 500 }}>Keep me logged in</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-large"
              style={{
                marginTop: "var(--spacing-md)",
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%"
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  Logging in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", margin: "var(--spacing-2xl) 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-light)" }} />
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-light)" }} />
          </div>

          {/* Sign Up Link */}
          <p style={{ 
            textAlign: "center", 
            fontSize: "var(--font-size-sm)", 
            color: "var(--text-secondary)", 
            margin: 0,
            fontWeight: 500
          }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ 
              color: "var(--primary-main)", 
              fontWeight: 700, 
              textDecoration: "none",
              transition: "color var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-dark)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--primary-main)"}
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "var(--spacing-xl)", 
          fontSize: "var(--font-size-xs)", 
          color: "var(--text-muted)"
        }}>
          <Link to="/" style={{ 
            color: "var(--text-muted)", 
            textDecoration: "none",
            transition: "color var(--transition-fast)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-main)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
          >
            ← Back to home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
