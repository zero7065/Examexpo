// TypingIndicator — 3-dot pulse with 🧠 while the tutor thinks.
export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, marginRight: 8, flexShrink: 0 }}>🧠</div>
      <div style={{ padding: "14px 20px", borderRadius: "18px 18px 18px 4px", background: "var(--bg-2)", border: "1px solid var(--border)" }}>
        <div className="typing-dots" style={{ display: "flex", gap: 4 }}>
          <span /><span /><span />
        </div>
      </div>
      <style>{`
        .typing-dots span { width: 8px; height: 8px; background: var(--text-muted); border-radius: 50%; animation: dotBounce 1.4s infinite ease-in-out both; }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes dotBounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  );
}
