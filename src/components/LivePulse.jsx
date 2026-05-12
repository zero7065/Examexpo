// src/components/LivePulse.jsx
import { useEffect, useState } from "react";

export default function LivePulse() {
  const [stats, setStats] = useState({
    activeNow: 342,
    questionsToday: 12847,
    totalUsers: 189247,
    totalQuestions: 3847291,
  });

  // Simulate real-time updates with spontaneous changes
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        // Random fluctuations to make it look live
        const activeNow = Math.floor(300 + Math.random() * 350); // 300-650 range
        const questionsToday = prev.questionsToday + Math.floor(Math.random() * 50);
        const totalUsers = prev.totalUsers + Math.floor(Math.random() * 3);
        const totalQuestions = prev.totalQuestions + Math.floor(Math.random() * 20);

        return {
          activeNow,
          questionsToday,
          totalUsers,
          totalQuestions,
        };
      });
    }, 3500); // Update every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  const items = [
    {
      value: stats.activeNow,
      label: "studying right now",
      icon: "🟢",
      live: true,
      color: "#00E5A0",
      range: "300-650",
    },
    {
      value: stats.questionsToday.toLocaleString(),
      label: "questions answered today",
      icon: "📝",
      live: false,
      color: "#4D9EFF",
    },
    {
      value: stats.totalUsers.toLocaleString(),
      label: "students enrolled",
      icon: "🎓",
      live: false,
      color: "#FFB800",
    },
    {
      value: stats.totalQuestions.toLocaleString(),
      label: "total questions practiced",
      icon: "🏆",
      live: false,
      color: "#FF6B6B",
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 16,
      padding: "32px 0",
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: "var(--bg-2)",
          border: `1px solid ${item.color}33`,
          borderRadius: 14,
          padding: "20px 18px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Glow line at top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 2, background: item.color,
          }} />

          {/* Live indicator */}
          {item.live && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#00E5A0",
                animation: "livePulse 1.5s infinite",
                display: "inline-block",
                flexShrink: 0,
              }} />
              <span style={{ color: "#00E5A0", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                LIVE
              </span>
            </div>
          )}

          <div style={{
            fontSize: item.live ? 36 : 30,
            fontWeight: 800,
            color: "var(--text)",
            fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
            lineHeight: 1,
            marginBottom: 6,
          }}>
            {item.value}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.4 }}>
            {item.icon} {item.label}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(0, 229, 160, 0.6); }
          70%  { box-shadow: 0 0 0 8px rgba(0, 229, 160, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 229, 160, 0); }
        }
      `}</style>
    </div>
  );
}