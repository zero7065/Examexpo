import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useSubscription } from "../hooks/useSubscription";
import { checkQuestionLimit, trackQuestion } from "../lib/usageTracker";
import { explainQuestion } from "../lib/gemini";
import ProUpgradeModal from "../components/ProUpgradeModal";
import { ChevronRight, Sparkles, AlertCircle, CheckCircle2, XCircle, Flag, BookOpen } from "lucide-react";

const MODE_MOCK = "mock";
const MODE_PRACTICE = "practice";

export default function PracticeSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionData = location.state;

  const [showProModal, setShowProModal] = useState(false);
  const [proReason, setProReason] = useState(null);
  const [questions, setQuestions] = useState(sessionData?.questions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [redirected, setRedirected] = useState(false);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [revealed, setRevealed] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [aiExplanations, setAiExplanations] = useState({});
  const [loadingAI, setLoadingAI] = useState(null);
  const [showHint, setShowHint] = useState({});
  const [sessionComplete, setSessionComplete] = useState(false);
  const [limitBlocked, setLimitBlocked] = useState(false);
  const timerRef = useRef(null);

  const mode = sessionData?.mode || MODE_PRACTICE;
  const subject = sessionData?.subject || "Mixed";
  const totalTime = mode === MODE_MOCK ? 1800 : Infinity;
  const current = questions[currentIndex];

  useEffect(() => {
    if (!sessionData?.questions?.length && !redirected) {
      setRedirected(true);
      toast({ message: "Select a subject to start practicing", type: "warning" });
      navigate("/question-bank", { replace: true });
      return;
    }

    async function checkLimit() {
      if (!user || isPro) return;
      const check = await checkQuestionLimit(user.uid);
      if (!check.allowed) {
        setLimitBlocked(true);
        setProReason("questions");
        toast({ message: "Daily question limit reached. Upgrade to Pro!", type: "warning" });
      }
    }
    checkLimit();

    timerRef.current = setInterval(() => {
      setTimeElapsed(t => {
        if (mode === MODE_MOCK && t >= totalTime) {
          clearInterval(timerRef.current);
          finishSession();
          return totalTime;
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = useCallback((secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  function handleSelect(optionKey) {
    if (revealed[current?.id] || sessionComplete) return;
    setAnswers(prev => ({ ...prev, [current.id]: optionKey }));
    setRevealed(prev => ({ ...prev, [current.id]: true }));

    if (user && !isPro) {
      trackQuestion(user.uid);
    }
  }

  async function handleAskAI() {
    if (!isPro) { setProReason("ai"); setShowProModal(true); return; }
    if (loadingAI) return;
    setLoadingAI(current.id);

    const explanation = await explainQuestion({
      question: current.question,
      options: current.options,
      correctAnswer: current.answer,
      userAnswer: answers[current.id],
      subject: current.subject,
      topic: current.topic,
    });

    setAiExplanations(prev => ({ ...prev, [current.id]: explanation }));
    setLoadingAI(null);
  }

  function toggleFlag() {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id); else next.add(current.id);
      return next;
    });
  }

  function goToQuestion(idx) {
    if (idx >= 0 && idx < questions.length) setCurrentIndex(idx);
  }

  function finishSession() {
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = questions.filter(q => answers[q.id] === q.answer).length;
    const wrong = questions.filter(q => answers[q.id] && answers[q.id] !== q.answer).length;
    const unanswered = questions.length - Object.keys(answers).length;
    const pct = Math.round((correct / questions.length) * 100);
    const xp = correct * 5 + Object.keys(answers).length * 2 + (pct >= 80 ? 10 : 0);

    const weakTopics = questions
      .filter(q => answers[q.id] && answers[q.id] !== q.answer)
      .map(q => q.topic);

    setSessionComplete(true);
    navigate("/session-summary", {
      state: {
        subject,
        mode,
        questions,
        answers,
        correct,
        wrong,
        unanswered,
        total: questions.length,
        score: pct,
        timeSeconds: timeElapsed,
        xpEarned: xp,
        weakTopics: [...new Set(weakTopics)],
      }
    });
  }

  function handleConfirmEnd() {
    const unanswered = Object.keys(answers).length;
    if (unanswered < questions.length) {
      toast({ message: `You have ${questions.length - unanswered} unanswered questions. End anyway?`, type: "info" });
    }
    finishSession();
  }

  function getOptionStyle(key) {
    const base = { padding: "14px 16px", borderRadius: 12, border: "1.5px solid #333", background: "#1a1a1f", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.25s ease", textAlign: "left", fontFamily: "inherit" };
    const selected = answers[current?.id] === key;
    const isCorrect = key === current?.answer;

    if (!revealed[current?.id]) {
      if (selected) return { ...base, border: "1.5px solid #6C3CE9", background: "rgba(108,60,233,0.2)" };
      return base;
    }

    if (selected && isCorrect) return { ...base, border: "1.5px solid #4ADE80", background: "rgba(74,222,128,0.15)" };
    if (selected && !isCorrect) return { ...base, border: "1.5px solid #FF4D6A", background: "rgba(255,77,106,0.15)" };
    if (isCorrect) return { ...base, border: "1.5px solid #4ADE80", background: "rgba(74,222,128,0.08)" };
    return { ...base, opacity: 0.5 };
  }

  function getBadgeStyle(key) {
    const selected = answers[current?.id] === key;
    const isCorrect = key === current?.answer;
    if (!revealed[current?.id] && selected) return { background: "#6C3CE9", color: "#fff" };
    if (revealed[current?.id] && isCorrect) return { background: "#4ADE80", color: "#000" };
    if (revealed[current?.id] && selected && !isCorrect) return { background: "#FF4D6A", color: "#fff" };
    return { background: "#333", color: "#888" };
  }

  if (limitBlocked) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <AlertCircle size={48} color="#FF4D6A" />
        <h2 style={{ color: "#fff", fontWeight: 700, fontSize: 22, margin: 0 }}>Daily Limit Reached</h2>
        <p style={{ color: "#888", fontSize: 14 }}>Upgrade to Pro for unlimited questions</p>
        <button onClick={() => setShowProModal(true)} style={{ padding: "12px 28px", borderRadius: 10, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
          Upgrade Now
        </button>
        <ProUpgradeModal open={showProModal} onClose={() => navigate("/dashboard")} reason="questions" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      <div style={{ display: "flex", flexDirection: window.innerWidth > 768 ? "row" : "column", minHeight: "100vh" }}>
        
        {/* Left Panel */}
        <div style={{ flex: 1, padding: "20px 24px", maxWidth: window.innerWidth > 768 ? "calc(100% - 220px)" : "100%" }}>
          {/* Progress + Timer */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 6, background: "#1e1e2a", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${progressPct}%`, height: "100%", background: "#6C3CE9", borderRadius: 3, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 12, color: "#888", fontWeight: 500, whiteSpace: "nowrap" }}>{currentIndex + 1}/{questions.length}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#D4A853", fontFamily: "'JetBrains Mono', monospace", minWidth: 60, textAlign: "right" }}>{formatTime(timeElapsed)}</span>
          </div>

          {current && (
            <>
              {/* Question header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <span style={{ padding: "4px 12px", borderRadius: 8, background: "#6C3CE9", color: "#fff", fontSize: 11, fontWeight: 700 }}>Q{currentIndex + 1}</span>
                <span style={{ color: "#666", fontSize: 12 }}>{current.subject} · {current.topic}</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: current.difficulty === "easy" ? "#4ADE80" : current.difficulty === "medium" ? "#FF9F43" : "#FF4D6A" }} />
                <span style={{ fontSize: 11, color: "#888", textTransform: "capitalize" }}>{current.difficulty}</span>
              </div>

              {/* Question text */}
              <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.6, marginBottom: 24, margin: "0 0 24px", color: "#fff" }}>{current.question}</h2>

              {/* Options */}
              <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 768 ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 24 }}>
                {Object.entries(current.options).map(([key, val]) => (
                  <button key={key} onClick={() => handleSelect(key)} style={getOptionStyle(key)} disabled={!!revealed[current.id]}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, ...getBadgeStyle(key), fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{key}</span>
                    <span style={{ fontSize: 14, flex: 1 }}>{val}</span>
                    {revealed[current.id] && key === current.answer && <CheckCircle2 size={18} color="#4ADE80" />}
                    {revealed[current.id] && answers[current.id] === key && key !== current.answer && <XCircle size={18} color="#FF4D6A" />}
                  </button>
                ))}
              </div>

              {/* After reveal */}
              {revealed[current.id] && (
                <div style={{ marginBottom: 24 }}>
                  {/* Hint */}
                  {current.hint && (
                    <div style={{ marginBottom: 12 }}>
                      <button onClick={() => setShowHint(s => ({ ...s, [current.id]: !s[current.id] }))} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.3)", color: "#D4A853", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                        💡 {showHint[current.id] ? "Hide Hint" : "Show Hint"}
                      </button>
                      {showHint[current.id] && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#D4A853", fontStyle: "italic" }}>{current.hint}</p>}
                    </div>
                  )}

                  {/* AI Explain */}
                  <button onClick={handleAskAI} disabled={loadingAI === current.id} style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", border: "1.5px solid #6C3CE9", color: "#6C3CE9", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                    <Sparkles size={16} /> {loadingAI === current.id ? "Loading..." : "Ask AI to Explain"}
                  </button>

                  {aiExplanations[current.id] && (
                    <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: "#0d0d1a", borderLeft: "3px solid #6C3CE9" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#D4A853", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={14} /> AI Explanation</div>
                      <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, margin: 0 }}>{aiExplanations[current.id]}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Nav buttons */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={toggleFlag} style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${flagged.has(current.id) ? "#D4A853" : "#333"}`, color: flagged.has(current.id) ? "#D4A853" : "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  <Flag size={14} /> {flagged.has(current.id) ? "Flagged" : "Flag Question"}
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  {currentIndex < questions.length - 1 ? (
                    <button onClick={() => goToQuestion(currentIndex + 1)} style={{ padding: "10px 20px", borderRadius: 8, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontFamily: "inherit" }}>
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button onClick={handleConfirmEnd} style={{ padding: "10px 20px", borderRadius: 8, background: "#FF4D6A", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
                      Finish Session
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Navigator */}
        {window.innerWidth > 768 && (
          <div style={{ width: 220, background: "#0d0d12", borderLeft: "1px solid #1e1e2a", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Questions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {questions.map((q, i) => {
                const isCurrent = i === currentIndex;
                const isAnswered = answers[q.id];
                const isFlagged = flagged.has(q.id);
                let bg = "#1a1a1f";
                let border = "1px solid #333";
                if (isCurrent) { bg = "#1a1a1f"; border = "1.5px solid #fff"; }
                if (isAnswered) { bg = "rgba(108,60,233,0.2)"; border = "1px solid #6C3CE9"; }
                if (isFlagged) { bg = "rgba(212,168,83,0.15)"; border = "1px solid #D4A853"; }
                if (isCurrent && isAnswered) { bg = "rgba(108,60,233,0.25)"; border = "1.5px solid #fff"; }

                return (
                  <button key={q.id} onClick={() => goToQuestion(i)} style={{ width: 32, height: 32, borderRadius: 6, background: bg, border, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#666" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(108,60,233,0.2)", border: "1px solid #6C3CE9" }} /> Answered</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#666" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(212,168,83,0.15)", border: "1px solid #D4A853" }} /> Flagged</div>
            </div>
            <button onClick={handleConfirmEnd} style={{ marginTop: "auto", padding: "10px", borderRadius: 8, background: "transparent", border: "1px solid #FF4D6A", color: "#FF4D6A", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              End Session
            </button>
          </div>
        )}
      </div>

      <ProUpgradeModal open={showProModal} onClose={() => { setShowProModal(false); if (limitBlocked) navigate("/dashboard"); }} reason={proReason} dismissible />
    </div>
  );
}