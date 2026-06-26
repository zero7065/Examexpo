import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getRandomQuestions } from "../data/questions/index";
import { doc, updateDoc, addDoc, collection, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { updateStreak } from "../lib/userProfile";
import { logActivity } from "../lib/activityLog";
import { ArrowLeft, RotateCcw, Share2, ChevronDown, ChevronUp, Target, Zap, Clock, CheckCircle2, XCircle } from "lucide-react";

const SCORE_COLORS = { low: "#FF4D6A", mid: "#FF9F43", good: "#00E5A0", elite: "#D4A853" };

function getScoreColor(score) {
  if (score < 200) return SCORE_COLORS.low;
  if (score < 250) return SCORE_COLORS.mid;
  if (score < 320) return SCORE_COLORS.good;
  return SCORE_COLORS.elite;
}

function getGrade(percentage) {
  if (percentage >= 75) return { letter: "A1", color: "#4ADE80" };
  if (percentage >= 70) return { letter: "B2", color: "#4ADE80" };
  if (percentage >= 65) return { letter: "B3", color: "#A8E6A0" };
  if (percentage >= 60) return { letter: "C4", color: "#FF9F43" };
  if (percentage >= 55) return { letter: "C5", color: "#FF9F43" };
  if (percentage >= 50) return { letter: "C6", color: "#FF9F43" };
  if (percentage >= 45) return { letter: "D7", color: "#FF6B6B" };
  if (percentage >= 40) return { letter: "E8", color: "#FF6B6B" };
  return { letter: "F9", color: "#FF4D6A" };
}

export default function MockSummary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  const [expandedReview, setExpandedReview] = useState(null);
  const [displayXP, setDisplayXP] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data) { navigate("/dashboard", { replace: true }); return; }
    const target = data.xpEarned || 0;
    let cur = 0, step = 0;
    const int = setInterval(() => { step++; cur = Math.min(Math.ceil((target / 60) * step), target); setDisplayXP(cur); if (step >= 60) clearInterval(int); }, 25);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (!data || !user || saved) return;
    async function save() {
      try {
        if (db) {
          await addDoc(collection(db, "mockExams"), { userId: user.uid, examType: data.examType, subjects: data.subjects, overallScore: data.overallScore, jamb400Score: data.jamb400Score, subjectBreakdown: data.subjectBreakdown, totalQuestions: data.totalQuestions, timeUsed: data.timeUsed, xpEarned: data.xpEarned, weakTopics: data.weakTopics, completedAt: serverTimestamp() });
          await updateDoc(doc(db, "users", user.uid), { mockExamsCompleted: increment(1), totalXP: increment(data.xpEarned || 0), totalQuestionsAnswered: increment(data.totalQuestions), lastActive: serverTimestamp() });
        }
        logActivity({ action: "mock_exam_complete", userId: user.uid, email: user.email, details: { examType: data.examType, overallScore: data.overallScore, jamb400Score: data.jamb400Score, correct: data.correct, total: data.totalQuestions } });
        await updateStreak(user.uid);
        setSaved(true);
      } catch (e) { console.warn("Save mock error:", e); }
    }
    save();
  }, [data, user, saved]);

  if (!data) return null;

  const { examType, subjects, questions, answers, overallScore, jamb400Score, correct, wrong, skipped, totalQuestions, timeUsed, xpEarned, weakTopics, subjectBreakdown } = data;
  const color = getScoreColor(jamb400Score);
  const grade = getGrade(overallScore);
  const strongSubject = subjects?.length ? subjects.reduce((a, b) => (subjectBreakdown?.[a]?.score || 0) > (subjectBreakdown?.[b]?.score || 0) ? a : b) : "";
  const weakSubject = subjects?.length ? subjects.reduce((a, b) => (subjectBreakdown?.[a]?.score || 100) < (subjectBreakdown?.[b]?.score || 100) ? a : b) : "";

  function formatTime(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`; }

  function handleRetake() { const allQs = []; subjects.forEach(s => { const qs = getRandomQuestions(s, 45); allQs.push(...qs); }); navigate("/practice", { state: { questions: allQs.sort(() => Math.random() - 0.5), subject: subjects.join(", "), mode: "practice" } }); }

  function handleShare() {
    const text = `I scored ${jamb400Score}/400 on a ${examType} Mock Exam on ExamPadi AI 🎯 Try it free: exampadi.com`;
    if (navigator.share) navigator.share({ title: "ExamPadi Score", text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast({ message: "Copied! Share with friends 🎉", type: "success" }); }
  }

  const avgSeconds = Math.round(timeUsed / totalQuestions);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff", padding: "32px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Score ring */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 16px" }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="78" fill="none" stroke="#1e1e2a" strokeWidth="10" />
              <circle cx="90" cy="90" r="78" fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${(overallScore / 100) * 490} 490`} strokeLinecap="round" transform="rotate(-90 90 90)" style={{ transition: "stroke-dasharray 1s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{overallScore}%</span>
              <span style={{ fontSize: 13, fontWeight: 600, color }}>{grade.letter}</span>
            </div>
          </div>
          {examType === "JAMB UTME" && (
            <div style={{ fontSize: 22, fontWeight: 800, color }}>JAMB Score: {jamb400Score}/400</div>
          )}
          <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{correct} correct · {wrong} wrong · {skipped} skipped</div>
        </div>

        {/* Subject breakdown table */}
        {subjects?.length > 0 && (
          <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e1e2a", fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Subject Breakdown</div>
            {subjects.map((s, i) => {
              const sb = subjectBreakdown?.[s] || { correct: 0, wrong: 0, skipped: 0, score: 0 };
              const g = getGrade(sb.score);
              return (
                <div key={s} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 60px", gap: 8, padding: "12px 16px", background: i % 2 === 0 ? "#121218" : "#0d0d12", alignItems: "center", fontSize: 13 }}>
                  <div style={{ fontWeight: 600, color: "#fff" }}>{s}</div>
                  <div style={{ color: "#4ADE80" }}>{sb.correct}</div>
                  <div style={{ color: "#FF4D6A" }}>{sb.wrong}</div>
                  <div style={{ color: "#888" }}>{sb.skipped}</div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>{sb.score}%</div>
                  <div style={{ padding: "2px 8px", borderRadius: 6, background: `${g.color}22`, color: g.color, fontWeight: 700, fontSize: 12, textAlign: "center" }}>{g.letter}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Performance analysis */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { icon: <Target size={16} />, label: "Strongest Subject", value: strongSubject, badge: "green" },
            { icon: <Zap size={16} />, label: "Needs Work", value: weakSubject, badge: "red" },
            { icon: <Clock size={16} />, label: "Avg Time/Question", value: `${avgSeconds}s`, badge: null },
            { icon: <CheckCircle2 size={16} />, label: "XP Earned", value: `+${displayXP}`, badge: "gold" },
          ].map((item, i) => (
            <div key={i} style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#888", marginBottom: 6 }}>{item.icon} {item.label}</div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Weak topics */}
        {weakTopics?.length > 0 && (
          <div style={{ background: "rgba(255,77,106,0.05)", border: "1px solid rgba(255,77,106,0.15)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#FF6B6B", margin: "0 0 8px" }}>Topics to Review</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[...new Set(weakTopics)].map(t => (
                <button key={t} onClick={() => navigate("/practice", { state: { questions: getRandomQuestions(subjects?.[0] || "Biology", 10), subject: subjects?.[0] || "Biology", mode: "practice" } })} style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.2)", color: "#FF6B6B", fontSize: 12, cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Review toggle */}
        {questions && (
          <>
            <button onClick={() => setReviewMode(!reviewMode)} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#121218", border: "1px solid #1e1e2a", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16, fontFamily: "inherit" }}>
              {reviewMode ? <ChevronUp size={18} /> : <ChevronDown size={18} />} {reviewMode ? "Hide" : "Review All Answers"}
            </button>
            {reviewMode && (
              <div style={{ marginBottom: 24 }}>
                {questions.map((q, i) => {
                  const ua = answers?.[q.id];
                  const isCorrect = ua === q.answer;
                  return (
                    <div key={q.id} style={{ background: "#121218", border: `1px solid ${isCorrect ? "rgba(74,222,128,0.2)" : "rgba(255,77,106,0.2)"}`, borderRadius: 10, padding: 14, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "#888" }}>Q{i + 1} · {q.subject} · {q.topic}</span>
                        {isCorrect ? <CheckCircle2 size={16} color="#4ADE80" /> : <XCircle size={16} color="#FF4D6A" />}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 8px", lineHeight: 1.4 }}>{q.question}</p>
                      <div style={{ display: "grid", gap: 3 }}>
                        {Object.entries(q.options).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 4, background: k === q.answer ? "rgba(74,222,128,0.1)" : k === ua && k !== q.answer ? "rgba(255,77,106,0.1)" : "transparent", fontSize: 12, color: k === q.answer ? "#4ADE80" : k === ua ? "#FF4D6A" : "#aaa" }}>
                            <span style={{ fontWeight: 700 }}>{k}:</span> {v}
                            {k === q.answer && <CheckCircle2 size={12} color="#4ADE80" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleRetake} style={{ padding: 14, borderRadius: 12, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}><RotateCcw size={18} style={{ verticalAlign: "middle", marginRight: 8 }} /> Retake Exam</button>
          {weakTopics?.length > 0 && <button onClick={() => navigate("/practice", { state: { questions: getRandomQuestions(subjects?.[0] || "Biology", 10), subject: subjects?.[0] || "Biology", mode: "practice" } })} style={{ padding: 14, borderRadius: 12, background: "#121218", border: "1px solid #333", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Practice Weak Topics</button>}
          <button onClick={() => navigate("/dashboard")} style={{ padding: 14, borderRadius: 12, background: "#121218", border: "1px solid #333", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}><ArrowLeft size={18} style={{ verticalAlign: "middle", marginRight: 8 }} /> Back to Dashboard</button>
          <button onClick={handleShare} style={{ padding: 10, borderRadius: 10, background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Share2 size={14} /> Share Result</button>
        </div>
      </div>
    </div>
  );
}