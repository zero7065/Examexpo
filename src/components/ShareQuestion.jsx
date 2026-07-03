// src/components/ShareQuestion.jsx
import { useToast } from "./Toast";

export default function ShareQuestion({ question, options, correctAnswer, explanation, subject }) {
  const { toast } = useToast();

  function buildShareText() {
    return `🎓 *ExamPadi AI — ${subject} Question*\n\n` +
      `📝 ${question}\n\n` +
      `A) ${options.A}\nB) ${options.B}\nC) ${options.C}\nD) ${options.D}\n\n` +
      `✅ Answer: ${correctAnswer}\n` +
      `💡 ${explanation}\n\n` +
      `Practice more at exampadi.com`;
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast({ message: "Opening WhatsApp...", type: "success" });
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(buildShareText()).then(() => {
      toast({ message: "Question copied to clipboard!", type: "success" });
    });
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: "ExamPadi AI Question", text: buildShareText() })
        .catch(() => copyToClipboard());
    } else {
      copyToClipboard();
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
      <button onClick={shareWhatsApp} style={btnStyle("#25D366")}>
        📱 WhatsApp
      </button>
      <button onClick={copyToClipboard} style={btnStyle("var(--primary)")}>
        📋 Copy
      </button>
      <button onClick={shareNative} style={btnStyle("var(--accent)")}>
        🔗 Share
      </button>
    </div>
  );
}

const btnStyle = (color) => ({
  padding: "8px 14px",
  background: `${color}22`,
  border: `1px solid ${color}`,
  borderRadius: 8,
  color: color,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
});
