import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, ArrowRight, Check } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = React.useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms of Service");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signup(name.trim(), email.trim(), password);
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/app/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "var(--danger)";
    if (passwordStrength === 2) return "var(--warning)";
    if (passwordStrength === 3) return "var(--primary-main)";
    return "var(--success)";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "No password yet";
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
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
              background: "linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%)",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--spacing-lg)",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.24)"
            }}>
              <User size={28} color="#ffffff" strokeWidth={2} />
            </div>
            <h1 style={{
              fontSize: "var(--font-size-3xl)",
              fontWeight: 800,
              color: "var(--primary-dark)",
              margin: "0 0 var(--spacing-sm) 0",
              letterSpacing: "-0.5px"
            }}>Create Account</h1>
            <p style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-muted)",
              margin: 0,
              fontWeight: 500
            }}>Join thousands managing their finances</p>
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
            {/* Name Field */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                  style={{
                    paddingLeft: "var(--spacing-2xl)",
                    fontSize: "var(--font-size-sm)"
                  }}
                  className="form-input"
                />
                <User size={18} style={{
                  position: "absolute",
                  left: "var(--spacing-md)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none"
                }} />
              </div>
            </div>

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
              <label className="form-label">Password</label>
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

              {/* Password Strength Indicator */}
              {password && (
                <div style={{
                  marginTop: "var(--spacing-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)"
                }}>
                  <div style={{ flex: 1, height: "4px", background: "var(--border-light)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(passwordStrength / 4) * 100}%`,
                      background: getPasswordStrengthColor(),
                      transition: "width var(--transition-slow)",
                      borderRadius: "var(--radius-full)"
                    }} />
                  </div>
                  <span style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    color: getPasswordStrengthColor(),
                    whiteSpace: "nowrap"
                  }}>
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
              )}

              <div className="form-helper">
                At least 8 characters, uppercase, number, and symbol for strong security
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--spacing-sm)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              userSelect: "none"
            }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={loading}
                style={{
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "18px",
                  height: "18px",
                  minWidth: "18px",
                  marginTop: "2px",
                  accentColor: "var(--primary-main)"
                }}
              />
              <span style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--text-secondary)",
                fontWeight: 500,
                lineHeight: "1.5"
              }}>
                I agree to the{" "}
                <a href="#" style={{
                  color: "var(--primary-main)",
                  textDecoration: "none",
                  fontWeight: 700,
                  transition: "color var(--transition-fast)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-dark)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--primary-main)"}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" style={{
                  color: "var(--primary-main)",
                  textDecoration: "none",
                  fontWeight: 700,
                  transition: "color var(--transition-fast)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-dark)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--primary-main)"}
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success btn-large"
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
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

          {/* Sign In Link */}
          <p style={{
            textAlign: "center",
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            margin: 0,
            fontWeight: 500
          }}>
            Already have an account?{" "}
            <Link to="/login" style={{
              color: "var(--primary-main)",
              fontWeight: 700,
              textDecoration: "none",
              transition: "color var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-dark)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--primary-main)"}
            >
              Sign in
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
