import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useNotifications } from "../hooks/useNotifications";
import { getRandomQuestions } from "../data/questions/index";
import { doc, updateDoc, addDoc, collection, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { updateStreak } from "../lib/userProfile";
import { logActivity } from "../lib/activityLog";
import { ArrowLeft, RotateCcw, Share2, Sparkles, CheckCircle2, XCircle } from "lucide-react";

export default function SessionSummary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  const [displayXP, setDisplayXP] = useState(0);
  const [expandedReview, setExpandedReview] = useState(null);
  const animRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const { sendNotification } = useNotifications();

  useEffect(() => {
    if (!data) { navigate("/dashboard", { replace: true }); return; }

    // XP animation
    const target = data.xpEarned || 0;
    const duration = 1500;
    const steps = 60;
    const incrementVal = target / steps;
    let current = 0;
    let step = 0;

    animRef.current = setInterval(() => {
      step++;
      current = Math.min(Math.round(incrementVal * step), target);
      setDisplayXP(current);
      if (step >= steps) clearInterval(animRef.current);
    }, duration / steps);

    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  // Save to Firestore once
  useEffect(() => {
    if (!data || !user || saved) return;
    async function saveSession() {
      try {
        if (db) {
          await addDoc(collection(db, "sessions"), {
            userId: user.uid,
            subject: data.subject,
            score: data.score,
            correct: data.correct,
            wrong: data.wrong,
            total: data.total,
            timeSeconds: data.timeSeconds,
            xpEarned: data.xpEarned,
            weakTopics: data.weakTopics || [],
            completedAt: serverTimestamp(),
          });

          await updateDoc(doc(db, "users", user.uid), {
            totalQuestionsAnswered: increment(data.total),
            totalSessions: increment(1),
            totalXP: increment(data.xpEarned || 0),
            lastActive: serverTimestamp(),
          });
        }

        await updateStreak(user.uid);
        setSaved(true);

        logActivity({ action: "session_complete", userId: user.uid, email: user.email, details: { subject: data.subject, score: data.score, correct: data.correct, total: data.total, xp: data.xpEarned } });

        // Notify on completion
        sendNotification({
          title: "Session Complete! 🎯",
          body: `${subject}: ${score}% (${correct}/${total} correct)`,
          url: "/dashboard",
          tag: "session-complete",
        });
      } catch (e) {
        console.warn("Failed to save session:", e);
      }
    }
    saveSession();
  }, [data, user, saved]);

  if (!data) return null;

  const { subject, mode, questions, answers, correct, wrong, total, score, timeSeconds, xpEarned, weakTopics } = data;
  const grade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "F";
  const headline = score >= 80 ? "Excellent! 🔥" : score >= 60 ? "Good effort! 💪" : "Keep pushing! 📚";
  const conicColor = score >= 80 ? "#4ADE80" : score >= 60 ? "#D4A853" : score >= 40 ? "#FF9F43" : "#FF4D6A";

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function handlePracticeAgain() {
    const newQs = getRandomQuestions(subject === "Mixed" ? questions?.[0]?.subject || "Biology" : subject, 10);
    navigate("/practice", { state: { questions: newQs, subject, mode } });
  }

  function handleShare() {
    const text = `I scored ${score}% on ${subject} JAMB practice on ExamPadi AI 🔥 Try it free: exampadi.com`;
    if (navigator.share) { navigator.share({ title: "ExamPadi Score", text }).catch(() => {}); }
    else { navigator.clipboard.writeText(text); toast({ message: "Copied! Share with friends 🎉", type: "success" }); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff", padding: "32px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        
        {/* Score ring */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 16px" }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#1e1e2a" strokeWidth="10" />
              <circle cx="80" cy="80" r="70" fill="none" stroke={conicColor} strokeWidth="10" strokeDasharray={`${(score / 100) * 440} 440`} strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: "stroke-dasharray 1s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>{score}%</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: conicColor }}>Grade {grade}</span>
            </div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{headline}</h2>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Correct", value: correct, color: "#4ADE80" },
            { label: "Wrong", value: wrong, color: "#FF4D6A" },
            { label: "Time", value: formatTime(timeSeconds), color: "#6C3CE9" },
            { label: "XP", value: `+${displayXP}`, color: "#D4A853" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 12, padding: "16px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Weak topics */}
        {weakTopics?.length > 0 && (
          <div style={{ background: "rgba(255,77,106,0.05)", border: "1px solid rgba(255,77,106,0.15)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#FF6B6B", margin: "0 0 8px" }}>Topics to Review</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[...new Set(weakTopics)].map(t => (
                <span key={t} style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.2)", color: "#FF6B6B", fontSize: 12, cursor: "pointer" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Question review */}
        {questions && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Question Review</h3>
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.answer;
              const isExpanded = expandedReview === q.id;
              return (
                <div key={q.id} style={{ background: "#121218", border: `1px solid ${isCorrect ? "rgba(74,222,128,0.2)" : "rgba(255,77,106,0.2)"}`, borderRadius: 10, padding: 14, marginBottom: 8, cursor: "pointer" }} onClick={() => setExpandedReview(isExpanded ? null : q.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#888" }}>Q{i + 1} · {q.topic}</span>
                    {isCorrect ? <CheckCircle2 size={16} color="#4ADE80" /> : <XCircle size={16} color="#FF4D6A" />}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: isExpanded ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.question}</p>
                  {isExpanded && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                      {Object.entries(q.options).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, background: k === q.answer ? "rgba(74,222,128,0.08)" : k === userAns && k !== q.answer ? "rgba(255,77,106,0.08)" : "transparent", fontSize: 12, color: k === q.answer ? "#4ADE80" : k === userAns ? "#FF4D6A" : "#aaa" }}>
                          <span style={{ fontWeight: 700 }}>{k}:</span> {v}
                        </div>
                      ))}
                      {q.explanation && (
                        <div style={{ marginTop: 6, padding: 8, borderRadius: 6, background: "rgba(108,60,233,0.1)", borderLeft: "2px solid #6C3CE9", fontSize: 12, color: "#ccc", lineHeight: 1.5 }}>{q.explanation}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handlePracticeAgain} style={{ padding: 14, borderRadius: 12, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
            <RotateCcw size={18} /> Practice Again
          </button>
          <button onClick={() => navigate("/dashboard")} style={{ padding: 14, borderRadius: 12, background: "#121218", border: "1px solid #333", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            <ArrowLeft size={18} style={{ verticalAlign: "middle", marginRight: 8 }} /> Back to Dashboard
          </button>
          <button onClick={handleShare} style={{ padding: 10, borderRadius: 10, background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Share2 size={14} /> Share Score
          </button>
        </div>
      </div>
    </div>
  );
}