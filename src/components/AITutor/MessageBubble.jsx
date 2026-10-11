// MessageBubble — user right-aligned (primary-soft), AI left-aligned (card).
// AI messages get copy-to-clipboard; user image messages show a thumbnail.
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  }

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, marginRight: 8, flexShrink: 0, color: "#fff" }}>E</div>
      )}
      <div style={{
        maxWidth: "78%",
        padding: "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "var(--primary)" : "var(--bg-2)",
        border: isUser ? "none" : "1px solid var(--border)",
      }}>
        {message.image && (
          <img
            src={message.image}
            alt="Uploaded question"
            style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 10, marginBottom: 8, display: "block" }}
          />
        )}
        <div style={{ fontSize: 14, color: isUser ? "#fff" : "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {message.content}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          {!isUser && (
            <button
              onClick={copy}
              title="Copy answer"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: 2 }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          )}
          <span style={{ fontSize: 10, color: isUser ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}>
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
