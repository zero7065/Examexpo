import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  useEffect(() => { document.title = "404 — ExamPadi AI"; }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 80, fontWeight: 900, background: "linear-gradient(135deg, #6C3CE9, #D4A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 8 }}>
          404
        </div>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Page not found</h2>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>This page doesn't exist — but your exam score can. Let's get back to studying.</p>
        <button onClick={() => navigate("/dashboard")} style={{ padding: "12px 28px", borderRadius: 10, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
          Go Home →
        </button>
      </div>
    </div>
  );
}