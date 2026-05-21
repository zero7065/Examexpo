// src/ErrorBoundary.jsx
import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          fontFamily: "'Inter', system-ui, sans-serif",
          padding: 24,
        }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Something went wrong
            </h2>
            <pre style={{
              color: "#FF4D6A",
              fontSize: 13,
              marginBottom: 24,
              background: "#1a1a1f",
              padding: "12px 16px",
              borderRadius: 8,
              fontFamily: "monospace",
              wordBreak: "break-word",
              overflow: "auto",
              maxWidth: 500,
            }}>
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                background: "#6C3CE9",
                border: "none",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                color: "#fff",
              }}
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
