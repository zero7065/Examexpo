// src/components/WelcomeModal.jsx - Fully offline
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const SPEECHES = [
  "Every exam champion started exactly where you are right now — at zero. The questions you practice today are problems you won't face on exam day.",
  "1.9 million students will sit JAMB this year. The ones who pass aren't smarter — they practiced more. You just made the smartest decision: starting early.",
  "The difference between a 300 and a 180 isn't intelligence. It's repetition. You're here, you've started, and that already puts you ahead.",
];

export default function WelcomeModal() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [speech] = useState(SPEECHES[Math.floor(Math.random() * SPEECHES.length)]);

  useEffect(() => {
    // Check if this is first login (new user)
    if (user) {
      const hasSeenWelcome = localStorage.getItem("ep-welcome-shown");
      if (!hasSeenWelcome) {
        setTimeout(() => setShow(true), 800);
        localStorage.setItem("ep-welcome-shown", "true");
      }
    }
  }, [user]);

  function handleClose() {
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, backdropFilter: "blur(8px)",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        background: "#121218", borderRadius: 24,
        padding: "48px 36px", maxWidth: 480, width: "100%",
        textAlign: "center", border: "1px solid #333",
        boxShadow: "0 24px 80px rgba(108,60,233,0.15)",
        animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>🎉</div>

        <h1 style={{ color: "#6C3CE9", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Welcome to ExamPadi AI!
        </h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
          {user?.name || "Student"}, your journey to exam success starts today.
        </p>

        <div style={{
          background: "#6C3CE915", border: "1px solid #6C3CE933",
          borderRadius: 14, padding: "20px 18px", marginBottom: 28,
          borderLeft: "3px solid #6C3CE9",
        }}>
          <p style={{ color: "#fff", fontSize: 15, lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
            "{speech}"
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            { icon: "📚", label: "30 free questions", sub: "every day" },
            { icon: "🤖", label: "30 AI tutor Qs", sub: "every day" },
            { icon: "📊", label: "Progress tracking", sub: "from day one" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#1a1a1f", borderRadius: 12, padding: "14px 8px",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{item.label}</div>
              <div style={{ color: "#888", fontSize: 11 }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <button onClick={handleClose} style={{
          width: "100%", padding: "16px", borderRadius: 12,
          background: "#6C3CE9", border: "none",
          color: "#fff", fontWeight: 800, fontSize: 17,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 8px 24px rgba(108,60,233,0.3)",
        }}>
          Let's Start Practicing 🚀
        </button>
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>
    </div>
  );
}