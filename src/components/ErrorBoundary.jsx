import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error?.message || String(error) };
  }

  componentDidCatch(error, info) {
    // Log to console (or send to logging endpoint)
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    const { hasError, errorInfo } = this.state;
    if (hasError) {
      return (
        <div style={{ padding: 28 }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border-light)", borderRadius: 12, padding: 24, boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ color: "var(--danger)", marginBottom: 8 }}>Something went wrong</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>An unexpected error occurred while rendering the page. You can try refreshing or returning to the homepage.</p>
              <pre style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--surface-alt)", padding: 12, borderRadius: 8, overflowX: "auto" }}>{errorInfo}</pre>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => window.location.reload()}>Reload</button>
                <a className="btn-primary" href="/">Back to home</a>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
