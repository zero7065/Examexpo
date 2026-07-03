import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useSubscription } from "../hooks/useSubscription";
import { getUserProfile } from "../lib/userProfile";
import { getRandomQuestions } from "../data/questions/index";
import ProUpgradeModal from "../components/ProUpgradeModal";
import { Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const EXAM_CONFIG = {
  "JAMB UTME": { duration: 7200, questionsPerSubject: 45, maxSubjects: 4 },
  "WAEC SSCE": { duration: 10800, questionsPerSubject: 60, maxSubjects: 9 },
  "POST-UTME": { duration: 3600, questionsPerSubject: 100, maxSubjects: 1 },
};

export default function MockExam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [step, setStep] = useState("setup");
  const [examType, setExamType] = useState("JAMB UTME");
  const [selectedSubjects, setSelectedSubjects] = useState(["English"]);
  const [difficulty, setDifficulty] = useState("official");
  const [showProModal, setShowProModal] = useState(false);

  // Exam state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (user) getUserProfile(user.uid).then(p => { setProfile(p); if (p?.subjects?.length) setSelectedSubjects([p.subjects[0]]); }).catch(() => {});
  }, [user]);

  const userSubjects = profile?.subjects || [];
  const config = EXAM_CONFIG[examType];
  const duration = config?.duration || 7200;

  function handleExamType(val) {
    setExamType(val);
    setSelectedSubjects(["English"]);
  }

  function toggleSubject(subj) {
    const max = config?.maxSubjects || 4;
    setSelectedSubjects(prev => {
      if (prev.includes(subj)) return prev.filter(s => s !== subj);
      if (prev.length >= max) return prev;
      return [...prev, subj];
    });
  }

  function isSubjectDisabled(subj) {
    const max = config?.maxSubjects || 4;
    return selectedSubjects.length >= max && !selectedSubjects.includes(subj);
  }

  function beginExam() {
    if (selectedSubjects.length === 0) { toast({ message: "Select at least one subject", type: "warning" }); return; }
    const allQs = [];
    selectedSubjects.forEach(s => {
      const qs = getRandomQuestions(s, config?.questionsPerSubject || 45);
      allQs.push(...qs);
    });
    const shuffled = allQs.sort(() => Math.random() - 0.5);

    setQuestions(shuffled);
    setTimeRemaining(duration);
    setExamStarted(true);
    setStep("exam");
  }

  // Timer
  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; }
        if (prev === 900 && !warningShown) {
          setWarningShown(true);
          toast({ message: "⏰ 15 minutes remaining! Review flagged questions.", type: "info" });
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [examStarted, examSubmitted]);

  function handleAutoSubmit() {
    toast({ message: "Time's up! Submitting your exam...", type: "info" });
    setTimeout(() => submitExam(), 3000);
  }

  function submitExam() {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamSubmitted(true);

    const correct = questions.filter(q => answers[q.id] === q.answer).length;
    const wrong = questions.filter(q => answers[q.id] && answers[q.id] !== q.answer).length;
    const skipped = questions.length - Object.keys(answers).length;
    const pct = Math.round((correct / questions.length) * 100);
    const jambScore = Math.round((correct / questions.length) * 400);
    const xp = correct * 5 + (pct >= 80 ? 50 : pct >= 60 ? 25 : 0);

    const weakTopics = questions.filter(q => answers[q.id] && answers[q.id] !== q.answer).map(q => q.topic);

    const subjectBreakdown = {};
    selectedSubjects.forEach(s => {
      const sq = questions.filter(q => q.subject === s);
      const c = sq.filter(q => answers[q.id] === q.answer).length;
      const w = sq.filter(q => answers[q.id] && answers[q.id] !== q.answer).length;
      subjectBreakdown[s] = { correct: c, wrong: w, skipped: sq.length - c - w, score: Math.round((c / sq.length) * 100) };
    });

    navigate("/mock-summary", {
      state: {
        examType, subjects: selectedSubjects, questions, answers,
        overallScore: pct, jamb400Score: jambScore, correct, wrong, skipped,
        totalQuestions: questions.length, timeUsed: duration - timeRemaining,
        xpEarned: xp, weakTopics: [...new Set(weakTopics)], subjectBreakdown,
        flaggedIds: [...flagged],
      }
    });
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60); const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const timerColor = timeRemaining < 300 ? "#FF4D6A" : timeRemaining < 900 ? "#FF9F43" : "#fff";
  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  if (step === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff", padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 560, width: "100%", background: "#121218", border: "1px solid #1e1e2a", borderRadius: 24, padding: "32px 28px" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", textAlign: "center" }}>Mock CBT Exam</h1>
          <p style={{ color: "#888", fontSize: 14, textAlign: "center", margin: "0 0 24px" }}>Simulate real exam conditions</p>

          {/* Exam type */}
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Exam Type</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {Object.keys(EXAM_CONFIG).map(e => (
              <button key={e} onClick={() => handleExamType(e)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: examType === e ? "2px solid #6C3CE9" : "1px solid #333", background: examType === e ? "rgba(108,60,233,0.15)" : "#1a1a1f", color: examType === e ? "#fff" : "#888", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                {e}
              </button>
            ))}
          </div>

          {/* Subjects */}
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Subjects (max {config?.maxSubjects})</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {userSubjects.map(s => {
              const sel = selectedSubjects.includes(s);
              const disabled = isSubjectDisabled(s);
              return (
                <button key={s} onClick={() => !disabled && toggleSubject(s)} disabled={disabled && !sel} style={{ padding: "8px 14px", borderRadius: 8, border: sel ? "2px solid #6C3CE9" : "1px solid #333", background: sel ? "rgba(108,60,233,0.2)" : disabled ? "#0d0d12" : "#1a1a1f", color: sel ? "#fff" : disabled ? "#444" : "#ccc", fontWeight: sel ? 600 : 400, fontSize: 12, cursor: disabled && !sel ? "not-allowed" : "pointer", opacity: disabled && !sel ? 0.5 : 1 }}>
                  {s}
                </button>
              );
            })}
          </div>

          {/* Info cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "#1a1a1f", borderRadius: 10, padding: 12, textAlign: "center" }}><div style={{ fontSize: 11, color: "#888" }}>Duration</div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{Math.floor(duration / 60)} mins</div></div>
            <div style={{ background: "#1a1a1f", borderRadius: 10, padding: 12, textAlign: "center" }}><div style={{ fontSize: 11, color: "#888" }}>Questions</div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{selectedSubjects.length * (config?.questionsPerSubject || 45)}</div></div>
          </div>

          {/* Difficulty */}
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Difficulty</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[
              { id: "official", label: "Official Mix" },
              { id: "hard", label: "Hard Mode" },
              { id: "easy", label: "Easy Warmup" },
            ].map(d => (
              <button key={d.id} onClick={() => setDifficulty(d.id)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: difficulty === d.id ? "2px solid #6C3CE9" : "1px solid #333", background: difficulty === d.id ? "rgba(108,60,233,0.15)" : "#1a1a1f", color: difficulty === d.id ? "#fff" : "#888", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>
                {d.label}
              </button>
            ))}
          </div>

          {/* Warning */}
          <div style={{ background: "#1a1400", border: "1px solid #D4A853", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={18} color="#D4A853" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: "#D4A853", fontSize: 12, lineHeight: 1.5, margin: 0 }}>Once started, the timer cannot be paused. Answers cannot be changed after submission. This simulates real exam conditions.</p>
          </div>

          {/* CTA */}
          <div style={{ position: "relative" }}>
            <button onClick={beginExam} disabled={selectedSubjects.length === 0} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: selectedSubjects.length > 0 ? "linear-gradient(135deg, #6C3CE9, #9B59B6)" : "#333", color: selectedSubjects.length > 0 ? "#fff" : "#666", fontWeight: 700, fontSize: 16, cursor: selectedSubjects.length > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
              Begin Exam →
            </button>
            {!isPro && <ProUpgradeModal open={showProModal} onClose={() => setShowProModal(false)} reason="mock" dismissible />}
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const unanswered = questions.length - answeredCount;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      {/* Top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#0d0d12", borderBottom: "1px solid #1e1e2a", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #6C3CE9, #D4A853)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>E</div>
            <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 6, background: "rgba(108,60,233,0.15)", color: "#6C3CE9", fontWeight: 600 }}>{examType}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Clock size={16} color={timerColor} style={timeRemaining < 300 ? { animation: "pulse 1s infinite" } : {}} />
            <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: timerColor, letterSpacing: 1 }}>{formatTime(timeRemaining)}</span>
          </div>
          <button onClick={() => setShowSubmitModal(true)} style={{ padding: "8px 18px", borderRadius: 8, background: "transparent", border: "1.5px solid #FF4D6A", color: "#FF4D6A", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Submit Exam
          </button>
        </div>
        {/* Subject tabs */}
        {selectedSubjects.length > 1 && (
          <div style={{ display: "flex", gap: 4, padding: "0 20px 8px", overflowX: "auto" }}>
            {selectedSubjects.map(s => {
              const sq = questions.filter(q => q.subject === s);
              const c = sq.filter(q => answers[q.id]).length;
              const isActive = current.subject === s;
              return (
                <button key={s} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: isActive ? "rgba(108,60,233,0.2)" : "transparent", cursor: "pointer", borderBottom: isActive ? "2px solid #6C3CE9" : "2px solid transparent", color: isActive ? "#fff" : "#888", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "inherit" }}>
                  {s} ({c}/{sq.length})
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>

      {/* Main content */}
      <div style={{ display: "flex", paddingTop: 96, minHeight: "100vh" }}>
        <div style={{ flex: 1, padding: "20px 24px", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 16 }}>Question {currentIndex + 1} of {questions.length}</div>
          <div style={{ background: "#121218", border: `1px solid ${flagged.has(current.id) ? "#D4A853" : "#1e1e2a"}`, borderRadius: 16, padding: 20, position: "relative", transition: "border 0.2s" }}>
            <button onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(current.id) ? n.delete(current.id) : n.add(current.id); return n; })} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 18 }} title="Flag for review">
              <Flag size={18} color={flagged.has(current.id) ? "#D4A853" : "#555"} />
            </button>
            <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6, margin: "0 0 20px", color: "#fff", paddingRight: 40 }}>{current.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(current.options).map(([key, val]) => {
                const sel = answers[current.id] === key;
                return (
                  <button key={key} onClick={() => setAnswers(prev => prev[current.id] === key ? { ...prev, [current.id]: undefined } : { ...prev, [current.id]: key })} style={{ padding: "14px 16px", borderRadius: 12, border: sel ? "2px solid #6C3CE9" : "1.5px solid #333", background: sel ? "rgba(108,60,233,0.2)" : "#1a1a1f", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", fontFamily: "inherit" }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: sel ? "#6C3CE9" : "#333", color: sel ? "#fff" : "#888", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{key}</span>
                    <span style={{ fontSize: 14, color: "#ccc" }}>{val}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i - 1)} style={{ padding: "10px 20px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: currentIndex === 0 ? "#555" : "#fff", cursor: currentIndex === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              <ChevronLeft size={16} /> Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button onClick={() => setCurrentIndex(i => i + 1)} style={{ padding: "10px 20px", borderRadius: 8, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={() => setShowSubmitModal(true)} style={{ padding: "10px 20px", borderRadius: 8, background: "#FF4D6A", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Submit Exam
              </button>
            )}
          </div>
        </div>

        {/* Navigator sidebar */}
        <div style={{ width: 200, background: "#0d0d12", borderLeft: "1px solid #1e1e2a", padding: 20, position: "fixed", right: 0, top: 96, bottom: 0, overflowY: "auto" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Answered: {answeredCount}/{questions.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 12 }}>
            {questions.map((q, i) => {
              const a = answers[q.id]; const f = flagged.has(q.id);
              let bg = "#1a1a1f"; let border = "1px solid #333";
              if (i === currentIndex) border = "1.5px solid #fff";
              if (a) { bg = "#6C3CE9"; border = "1px solid #6C3CE9"; }
              if (f) { bg = "#D4A853"; border = "1px solid #D4A853"; }
              return (
                <button key={q.id} onClick={() => setCurrentIndex(i)} style={{ width: 32, height: 32, borderRadius: 6, background: bg, border, color: a || f ? "#000" : "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "#888" }}>Flagged: {flagged.size}</div>
        </div>
      </div>

      {/* Submit modal */}
      {showSubmitModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 20, padding: "28px 24px", maxWidth: 420, width: "90%", textAlign: "center" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>Submit Exam?</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div><div style={{ fontSize: 24, fontWeight: 800, color: "#4ADE80" }}>{answeredCount}</div><div style={{ fontSize: 11, color: "#888" }}>Answered</div></div>
              <div><div style={{ fontSize: 24, fontWeight: 800, color: "#888" }}>{unanswered}</div><div style={{ fontSize: 11, color: "#888" }}>Unanswered</div></div>
              <div><div style={{ fontSize: 24, fontWeight: 800, color: "#D4A853" }}>{flagged.size}</div><div style={{ fontSize: 11, color: "#888" }}>Flagged</div></div>
            </div>
            <p style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 20 }}>You cannot change answers after submission.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { const idx = questions.findIndex(q => flagged.has(q.id)); if (idx >= 0) setCurrentIndex(idx); setShowSubmitModal(false); }} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", border: "1px solid #D4A853", color: "#D4A853", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Review Flagged
              </button>
              <button onClick={submitExam} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#FF4D6A", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}