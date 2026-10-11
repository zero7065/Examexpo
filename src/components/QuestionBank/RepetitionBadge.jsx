// RepetitionBadge — 🔥 high-yield tag + DATA/AI origin pill.
export default function RepetitionBadge({ question, showOrigin = false }) {
  if (!question) return null;
  const years = Array.isArray(question.repeatedFrom) ? question.repeatedFrom.length : 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {question.highYield && (
        <span
          title={years > 0 ? `Appeared in ${years} exam year(s)` : "High-yield topic"}
          style={{
            fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
            background: "rgba(249,115,22,0.12)", color: "#f97316",
            border: "1px solid rgba(249,115,22,0.35)",
            textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
          }}
        >
          🔥 High-yield{years > 0 ? ` · ${years}y` : ""}
        </span>
      )}
      {showOrigin && question._origin && (
        <span style={{
          fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
          background: question._origin === "DATA" ? "rgb(var(--primary-rgb) / 0.1)" : "rgb(var(--accent-rgb) / 0.12)",
          color: question._origin === "DATA" ? "var(--primary)" : "var(--accent)",
          border: "1px solid var(--border)",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {question._origin === "DATA" ? "Data" : "AI"}
        </span>
      )}
    </span>
  );
}
