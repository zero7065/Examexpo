// Post-exam review nudge: once per session, rating + text → AI moderation.
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { submitReview } from "../lib/community";
import { Star, X } from "lucide-react";

export default function ReviewPrompt({ sessionId, context = "", delayMs = 2500, onDone }) {  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), Math.max(0, delayMs));
    return () => clearTimeout(t);
  }, [delayMs]);

  if (!open) return null;

  function dismiss() {
    try { localStorage.setItem(`review-asked-${sessionId || "once"}`, "1"); } catch { /* private mode */ }
    setOpen(false);
    onDone && onDone(false);
  }

  async function submit() {
    if (!user) return;
    setSending(true);
    try {
      await submitReview({
        uid: user.uid,
        name: user.displayName || "Student",
        rating, text: text.trim(), context,
      });
      try { localStorage.setItem(`review-asked-${sessionId || "once"}`, "1"); } catch { /* private mode */ }
      toast({ message: "Thanks! Your review is checked and goes live soon ⭐", type: "success" });
      setOpen(false);
      onDone && onDone(true);
    } catch (e) {
      try {
        const localReviews = JSON.parse(localStorage.getItem("localReviews") || "[]");
        localReviews.push({ uid: user.uid, name: user.displayName || "Student", rating, text: text.trim(), context, createdAt: Date.now(), status: "pending_sync" });
        localStorage.setItem("localReviews", JSON.stringify(localReviews.slice(-100)));
      } catch { /* storage full */ }
      toast({ message: "Review saved locally — will sync when online", type: "success" });
      setOpen(false);
      onDone && onDone(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div className="glass-card" style={{ position: "relative", width: "100%", maxWidth: 440, padding: 24 }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-text text-lg">How was that session?</h3>
          <button onClick={dismiss} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <p className="text-sm text-text-muted mb-4">One tap — your rating helps other students trust ExamPadi.</p>
        <div className="flex gap-1 mb-4 justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} title={`${n} star${n > 1 ? "s" : ""}`}>
              <Star size={30} fill={n <= rating ? "var(--accent)" : "none"} color={n <= rating ? "var(--accent)" : "var(--border)"} />
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500}
          placeholder="What did you think? (optional, shows with your name)" className="input-field" style={{ resize: "vertical", marginBottom: 12 }} />
        <div className="flex gap-2">
          <button onClick={submit} disabled={sending} className="btn-primary flex-1 disabled:opacity-60">
            {sending ? "Sending…" : "Submit review"}
          </button>
          <button onClick={dismiss} className="btn-secondary px-5">Skip</button>
        </div>
      </div>
    </div>
  );
}
