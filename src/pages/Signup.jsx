import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, ArrowRight, Check } from "lucide-react";
import SMSConfiguration from "../components/SMSConfiguration";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [smsConfig, setSmsConfig] = useState(null); // SMS configuration after signup
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
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

    // Validate phone number format
    if (!/^[\d+\-\s\(\)]{7,20}$/.test(phone.trim())) {
      setError("Please enter a valid phone number (7-20 characters, digits and +- allowed)");
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
      const userData = await signup(email.trim(), password, name.trim(), phone.trim());
      
      // Show SMS configuration modal if sms_ingest data is present
      if (userData?.sms_ingest?.webhook_url) {
        setSmsConfig({
          webhookUrl: userData.sms_ingest.webhook_url,
          ingestSecret: userData.sms_ingest.ingest_secret || "",
          phoneNumber: userData.user?.phone_number || phone.trim()
        });
      } else {
        // Fallback if no SMS config
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/app/dashboard"), 1500);
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
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
          padding: "var(--spacing-xl)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--border-light)"
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, var(--primary-main) 0%, var(--primary-dark) 100%)",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--spacing-md)",
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.24)"
            }}>
              <User size={24} color="#ffffff" strokeWidth={2} />
            </div>
            <h1 style={{
              fontSize: "var(--font-size-2xl)",
              fontWeight: 800,
              color: "var(--primary-dark)",
              margin: "0 0 var(--spacing-xs) 0",
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
            <div className="alert alert-danger" style={{ animation: "slideInUp 300ms ease", marginBottom: "var(--spacing-md)" }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: "var(--font-size-sm)" }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ animation: "slideInUp 300ms ease", marginBottom: "var(--font-size-md)" }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: "var(--font-size-sm)" }}>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {/* Name and Email Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label" style={{ fontSize: "var(--font-size-xs)", marginBottom: "var(--spacing-xs)" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={loading}
                    style={{
                      paddingLeft: "var(--spacing-xl)",
                      fontSize: "var(--font-size-sm)",
                      height: "40px"
                    }}
                    className="form-input"
                  />
                  <User size={16} style={{
                    position: "absolute",
                    left: "var(--spacing-sm)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none"
                  }} />
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="signupEmail" className="form-label" style={{ fontSize: "var(--font-size-xs)", marginBottom: "var(--spacing-xs)" }}>Email</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="signupEmail"
                    name="signupEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    style={{
                      paddingLeft: "var(--spacing-xl)",
                      fontSize: "var(--font-size-sm)",
                      height: "40px"
                    }}
                    className="form-input"
                  />
                  <Mail size={16} style={{
                    position: "absolute",
                    left: "var(--spacing-sm)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none"
                  }} />
                </div>
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label" style={{ fontSize: "var(--font-size-xs)", marginBottom: "var(--spacing-xs)" }}>Phone Number (for SMS)</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+263712345678 or 0712345678"
                disabled={loading}
                style={{
                  fontSize: "var(--font-size-sm)",
                  height: "40px"
                }}
                className="form-input"
              />
            </div>

            {/* Password Fields Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="signupPassword" className="form-label" style={{ fontSize: "var(--font-size-xs)", marginBottom: "var(--spacing-xs)" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="signupPassword"
                    name="signupPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    style={{
                      paddingLeft: "var(--spacing-xl)",
                      paddingRight: "var(--spacing-xl)",
                      fontSize: "var(--font-size-sm)",
                      height: "40px"
                    }}
                    className="form-input"
                  />
                  <Lock size={16} style={{
                    position: "absolute",
                    left: "var(--spacing-sm)",
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
                      right: "var(--spacing-sm)",
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label" style={{ fontSize: "var(--font-size-xs)", marginBottom: "var(--spacing-xs)" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    style={{
                      paddingLeft: "var(--spacing-xl)",
                      paddingRight: "var(--spacing-xl)",
                      fontSize: "var(--font-size-sm)",
                      height: "40px"
                    }}
                    className="form-input"
                  />
                  <Lock size={16} style={{
                    position: "absolute",
                    left: "var(--spacing-sm)",
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
                      right: "var(--spacing-sm)",
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
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-sm)",
                marginTop: "var(--spacing-xs)"
              }}>
                <div style={{ flex: 1, height: "3px", background: "var(--border-light)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
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
                  color: getPasswordStrengthColor()
                }}>
                  {getPasswordStrengthLabel()}
                </span>
              </div>
            )}

            {/* Terms Agreement */}
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--spacing-sm)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              userSelect: "none",
              marginTop: "var(--spacing-xs)"
            }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={loading}
                style={{
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "16px",
                  height: "16px",
                  minWidth: "16px",
                  marginTop: "1px",
                  accentColor: "var(--primary-main)"
                }}
              />
              <span style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                fontWeight: 500,
                lineHeight: "1.4"
              }}>
                I agree to the{" "}
                <a href="#" style={{
                  color: "var(--primary-main)",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "color var(--transition-fast)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-dark)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--primary-main)"}
                >
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" style={{
                  color: "var(--primary-main)",
                  textDecoration: "none",
                  fontWeight: 600,
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
              className="btn btn-primary"
              style={{
                marginTop: "var(--spacing-sm)",
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                height: "44px",
                fontSize: "var(--font-size-sm)"
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", margin: "var(--spacing-lg) 0 var(--spacing-md) 0" }}>
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
              fontWeight: 600,
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

      {/* SMS Configuration Modal - Shown after successful signup */}
      {smsConfig && (
        <SMSConfiguration
          webhookUrl={smsConfig.webhookUrl}
          ingestSecret={smsConfig.ingestSecret}
          phoneNumber={smsConfig.phoneNumber}
          onDone={() => navigate("/app/dashboard")}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
