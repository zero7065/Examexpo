// src/ErrorBoundary.jsx
import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg, #0a0a0f)",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💥</div>
            <h2 style={{ color: "var(--text, #fff)", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{
              color: "var(--text-muted, #888)",
              fontSize: 14,
              marginBottom: 24,
              background: "rgba(255,255,255,0.05)",
              padding: "12px 16px",
              borderRadius: 8,
              fontFamily: "monospace",
              wordBreak: "break-word",
            }}>
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                background: "var(--primary, #00E5A0)",
                border: "none",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                color: "#000",
                transition: "opacity 0.2s",
              }}
              onMouseOver={e => e.target.style.opacity = 0.85}
              onMouseOut={e => e.target.style.opacity = 1}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
