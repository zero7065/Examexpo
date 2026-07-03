export default function LivePulse() {
  const items = [
    { value: "JAMB + WAEC", label: "exams covered", icon: "📚", color: "#4D9EFF" },
    { value: "10 Years", label: "past questions database", icon: "🏆", color: "#FFB800" },
    { value: "25+", label: "subjects available", icon: "📝", color: "#00E5A0" },
    { value: "Free", label: "to start today", icon: "🎯", color: "#6C3CE9" },
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
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 2, background: item.color,
          }} />
          <div style={{
            fontSize: 30,
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
    </div>
  );
}