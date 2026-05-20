import React, { useState } from 'react';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';

/**
 * SMSConfiguration Component
 * 
 * Displayed after successful signup
 * Shows webhook URL and setup instructions for SMS Forwarder app
 * 
 * Props:
 *   webhookUrl (string) - Complete webhook URL for SMS Forwarder
 *   ingestSecret (string) - 64-char hex secret key
 *   phoneNumber (string) - User's registered phone number
 *   onDone (function) - Callback when user completes setup
 */

export default function SMSConfiguration({ 
  webhookUrl, 
  ingestSecret, 
  phoneNumber,
  onDone 
}) {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const copyToClipboard = () => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(webhookUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fallback if clipboard API fails
          fallbackCopy(webhookUrl);
        });
    } else {
      // Fallback for old browsers or insecure contexts
      fallbackCopy(webhookUrl);
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    document.body.removeChild(textarea);
  };

  if (dismissed) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--spacing-lg)",
      zIndex: 50
    }}>
      <div style={{
        background: "var(--bg-primary)",
        borderRadius: "var(--radius-2xl)",
        boxShadow: "var(--shadow-xl)",
        maxWidth: "672px",
        width: "100%",
        maxHeight: "80vh",
        overflowY: "auto",
        border: "1px solid var(--border-light)",
        animation: "slideInUp 500ms ease-out"
      }}>
        
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, var(--primary-main) 0%, var(--primary-dark) 100%)",
          color: "white",
          padding: "var(--spacing-xl)",
          borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
            <CheckCircle size={32} />
            <div>
              <h2 style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: 800,
                margin: "0 0 var(--spacing-xs) 0",
                letterSpacing: "-0.5px"
              }}>Account Created! 🎉</h2>
              <p style={{
                color: "rgba(255, 255, 255, 0.9)",
                margin: 0,
                fontSize: "var(--font-size-sm)",
                fontWeight: 500
              }}>Now set up SMS forwarding (takes 2 minutes)</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "var(--spacing-xl)", display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>

          {/* Phone Number Verification */}
          <div style={{
            background: "var(--success-light)",
            border: "1px solid var(--success)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-md)"
          }}>
            <p style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-secondary)",
              margin: "0 0 var(--spacing-xs) 0",
              fontWeight: 500
            }}>Your registered phone:</p>
            <p style={{
              fontSize: "var(--font-size-lg)",
              fontFamily: "monospace",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: "0 0 var(--spacing-xs) 0"
            }}>{phoneNumber}</p>
            <p style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-muted)",
              margin: 0,
              fontWeight: 500
            }}>✓ Verified and ready for SMS</p>
          </div>

          {/* Webhook URL Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                color: "var(--text-primary)"
              }}>
                Your Webhook URL:
              </label>
              <button
                onClick={copyToClipboard}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-xs)",
                  padding: "var(--spacing-xs) var(--spacing-sm)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 500,
                  background: copied ? "var(--success-light)" : "var(--bg-secondary)",
                  color: copied ? "var(--success)" : "var(--text-secondary)",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.currentTarget.style.background = "var(--bg-hover)";
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.currentTarget.style.background = "var(--bg-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-light)";
                  }
                }}
              >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            {/* URL Display Box */}
            <div style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--spacing-md)",
              fontFamily: "monospace",
              fontSize: "var(--font-size-xs)",
              overflowX: "auto",
              wordBreak: "break-all"
            }}>
              <code style={{ color: "var(--text-primary)" }}>{webhookUrl}</code>
            </div>
            
            <p style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-muted)",
              margin: 0,
              fontWeight: 500
            }}>
              💡 This URL uniquely identifies your account. Paste it into SMS Forwarder app.
            </p>
          </div>

          {/* Setup Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <h3 style={{
              fontSize: "var(--font-size-base)",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0
            }}>Quick Setup:</h3>
            <ol style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)", margin: 0, paddingLeft: 0, listStyle: "none" }}>
              <li style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0,
                  width: "24px",
                  height: "24px",
                  background: "var(--primary-main)",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700
                }}>1</span>
                <span style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  lineHeight: 1.5
                }}>
                  <strong>Install SMS Forwarder</strong> from{" "}
                  <a
                    href="https://f-droid.org/packages/tech.bogomolov.incomingsmsgateway/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--primary-main)",
                      textDecoration: "none",
                      fontWeight: 600,
                      transition: "color var(--transition-fast)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-dark)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--primary-main)"}
                  >
                    F-Droid
                  </a>
                </span>
              </li>
              <li style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0,
                  width: "24px",
                  height: "24px",
                  background: "var(--primary-main)",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700
                }}>2</span>
                <span style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  lineHeight: 1.5
                }}>
                  <strong>Open the app</strong> and grant SMS read permission
                </span>
              </li>
              <li style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0,
                  width: "24px",
                  height: "24px",
                  background: "var(--primary-main)",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700
                }}>3</span>
                <span style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  lineHeight: 1.5
                }}>
                  <strong>Tap "Add New Forwarder"</strong> → Select HTTP
                </span>
              </li>
              <li style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0,
                  width: "24px",
                  height: "24px",
                  background: "var(--primary-main)",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700
                }}>4</span>
                <span style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  lineHeight: 1.5
                }}>
                  <strong>Insert sender number/text</strong> to filter SMS (e.g. Mpesa:MPESA, Ecocash:199, Standard Bank:StdLesBank, FNB:+26652000002)
                </span>
              </li>
              <li style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0,
                  width: "24px",
                  height: "24px",
                  background: "var(--primary-main)",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700
                }}>5</span>
                <span style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  lineHeight: 1.5
                }}>
                  <strong>Paste the webhook URL</strong> above into the URL field
                </span>
              </li>
              <li style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0,
                  width: "24px",
                  height: "24px",
                  background: "var(--primary-main)",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700
                }}>6</span>
                <span style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-primary)",
                  lineHeight: 1.5
                }}>
                  <strong>Save and test</strong> - transactions will appear in dashboard
                </span>
              </li>
            </ol>
          </div>

          {/* Secret Key (Hidden by default) */}
          <details style={{ fontSize: "var(--font-size-sm)" }}>
            <summary style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              color: "var(--text-primary)",
              cursor: "pointer",
              margin: 0,
              transition: "color var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary-main)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            >
              Technical: View Secret Key
            </summary>
            <div style={{
              marginTop: "var(--spacing-md)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--spacing-md)"
            }}>
              <p style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                margin: "0 0 var(--spacing-xs) 0",
                fontWeight: 500
              }}>Your ingest secret (for reference):</p>
              <code style={{
                fontSize: "var(--font-size-xs)",
                fontFamily: "monospace",
                color: "var(--text-primary)",
                wordBreak: "break-all"
              }}>{ingestSecret}</code>
            </div>
          </details>

        </div>

        {/* Footer */}
        <div style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-light)",
          padding: "var(--spacing-lg)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "0 0 var(--radius-2xl) var(--radius-2xl)"
        }}>
          <button
            onClick={onDone}
            style={{
              padding: "var(--spacing-sm) var(--spacing-lg)",
              background: "var(--primary-main)",
              color: "white",
              borderRadius: "var(--radius-lg)",
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              transition: "background var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--primary-dark)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--primary-main)"}
          >
            Go to Dashboard
          </button>
        </div>

      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Usage Example in Signup.jsx:
 * 
 * After successful signup, in the success flow:
 * 
 * const handleSignupSuccess = (userData) => {
 *   return (
 *     <SMSConfiguration
 *       webhookUrl={userData.webhook_url}
 *       ingestSecret={userData.ingest_secret}
 *       phoneNumber={userData.phone_number}
 *       onDone={() => navigate('/dashboard')}
 *     />
 *   );
 * };
 */
