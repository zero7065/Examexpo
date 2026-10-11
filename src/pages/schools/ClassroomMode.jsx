// Classroom mode — full-screen presenter for phone-free classrooms.
// Big text, tap-to-reveal answers, works on projectors and laptops.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../lib/userProfile";
import { getQuestionsFromBank } from "../../data/questionBank";
import { JAMB_SUBJECTS } from "../../data/subjects";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function ClassroomMode() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("Physics");
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    if (user) getUserProfile(user.uid).catch(() => {});
  }, [user]);

  function load() {
    const qs = getQuestionsFromBank({ subject, count: 30 });
    setQuestions(qs);
    setIdx(0);
    setRevealed(false);
    setPicked(null);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [subject]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = questions[idx];

  function choose(letter) {
    setPicked(letter);
    setRevealed(true);
  }

  function next() {
    setIdx((i) => (i + 1) % Math.max(questions.length, 1));
    setRevealed(false);
    setPicked(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "24px clamp(16px, 5vw, 80px)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <Link to="/teacher" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#888", fontSize: 15, fontWeight: 600 }}>
          <ArrowLeft size={18} /> Exit
        </Link>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}
          style={{ background: "#1a1a1f", border: "1px solid #333", borderRadius: 10, color: "#fff", padding: "10px 16px", fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit" }}>
          {JAMB_SUBJECTS.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <span style={{ marginLeft: "auto", color: "#888", fontSize: 15, fontWeight: 700 }}>
          {questions.length > 0 ? `Question ${idx + 1} / ${questions.length}` : "Loading…"}
        </span>
      </div>

      {!q ? (
        <p style={{ color: "#888", fontSize: 18 }}>No questions for this subject yet.</p>
      ) : (
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 800, lineHeight: 1.5, marginBottom: 8 }}>
            {q.question}
          </div>
          <div style={{ color: "#6C3CE9", fontSize: 15, fontWeight: 700, marginBottom: 28 }}>{q.topic} · {q.exam} {q.year}</div>

          <div style={{ display: "grid", gap: 14 }}>
            {Object.entries(q.options || {}).map(([letter, text]) => {
              const isAnswer = letter === (q.correctAnswer || q.answer);
              const isPicked = picked === letter;
              let bg = "#141419";
              let border = "2px solid #2a2a35";
              if (revealed && isAnswer) { bg = "rgba(34,197,94,0.18)"; border = "2px solid #22c55e"; }
              else if (revealed && isPicked && !isAnswer) { bg = "rgba(239,68,68,0.15)"; border = "2px solid #ef4444"; }
              else if (isPicked) { bg = "rgba(108,60,233,0.2)"; border = "2px solid #6C3CE9"; }
              return (
                <button key={letter} onClick={() => choose(letter)}
                  style={{
                    display: "flex", alignItems: "center", gap: 18, textAlign: "left",
                    background: bg, border, borderRadius: 16, padding: "20px 24px",
                    color: "#fff", cursor: "pointer", fontFamily: "inherit",
                    fontSize: "clamp(17px, 2.4vw, 24px)", fontWeight: 600, lineHeight: 1.5,
                  }}>
                  <span style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: revealed && isAnswer ? "#22c55e" : "#6C3CE9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 24,
                  }}>{letter}</span>
                  {text}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div style={{ marginTop: 24, padding: 24, borderRadius: 16, background: "rgba(108,60,233,0.12)", borderLeft: "4px solid #6C3CE9", fontSize: "clamp(15px, 2vw, 19px)", lineHeight: 1.7 }}>
              <strong>Explanation: </strong>{q.explanation || "Review this topic in your textbook."}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <button onClick={() => { setRevealed((r) => !r); }}
              style={{ padding: "14px 28px", borderRadius: 12, background: "transparent", border: "2px solid #6C3CE9", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
              {revealed ? <><EyeOff size={18} /> Hide answer</> : <><Eye size={18} /> Reveal answer</>}
            </button>
            <button onClick={next}
              style={{ padding: "14px 28px", borderRadius: 12, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
              Next question <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
