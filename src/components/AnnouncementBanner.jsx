// src/components/AnnouncementBanner.jsx
import { useState, useEffect } from "react";

const ANNOUNCEMENTS = [
  { id: 1, message: "🆕 2026 exam questions now available — AI-predicted style!", type: "info", delay: 3000 },
  { id: 2, message: "🔥 WAEC May/June 2026 is ongoing — practice now!", type: "warning", delay: 9000 },
  { id: 3, message: "✅ New: Share questions directly to WhatsApp with one tap", type: "success", delay: 16000 },
  { id: 4, message: "🎯 New feature: AI Exam Predictor — see likely 2026 topics", type: "info", delay: 23000 },
  { id: 5, message: "📊 Stats page upgraded — now shows weak topic analysis", type: "success", delay: 30000 },
  { id: 6, message: "⚡ Pro plan: Unlimited questions + Full CBT simulation", type: "info", delay: 38000 },
];

export default function AnnouncementBanner() {
  const [shown, setShown] = useState([]);

  useEffect(() => {
    const timers = ANNOUNCEMENTS.map(ann =>
      setTimeout(() => {
        setShown(s => [...s, ann]);
        setTimeout(() => setShown(s => s.filter(a => a.id !== ann.id)), 5000);
      }, ann.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const colors = {
    success: "#00E5A0", info: "#4D9EFF", warning: "#FFB800", error: "#FF4D6A"
  };

  return (
    <div style={{
      position: "fixed", top: 80, right: 16, zIndex: 8000,
      display: "flex", flexDirection: "column", gap: 8,
      maxWidth: 320, width: "calc(100vw - 32px)",
      pointerEvents: "none",
    }}>
      {shown.map(ann => (
        <div key={ann.id} style={{
          background: "var(--bg-2)",
          border: `1px solid ${colors[ann.type]}44`,
          borderLeft: `4px solid ${colors[ann.type]}`,
          borderRadius: 10,
          padding: "12px 16px",
          boxShadow: "var(--card-shadow)",
          color: "var(--text)",
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.4,
          animation: "slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          {ann.message}
        </div>
      ))}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
