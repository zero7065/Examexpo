// src/pages/PastQuestionsPage.jsx
import { useState } from "react";
import { getQuestionsFromBank } from "../data/questionBank";
import { predictLikelyQuestions } from "../groq";
import { useToast } from "../components/Toast";
import { JAMB_SUBJECTS, WAEC_SUBJECTS } from "../data/subjects";
import { Sparkles, BookOpen, History, ChevronRight, HelpCircle, Loader2 } from "lucide-react";
import ProGate from "../components/ProGate";
import { useAuth } from "../context/AuthContext";

const PAST_YEARS = [2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014];

export default function PastQuestionsPage() {
  const { toast } = useToast();
  const [exam, setExam] = useState("JAMB");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState(2024);
  const [questions, setQuestions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [predLoading, setPredLoading] = useState(false);
  const [revealed, setRevealed] = useState({});
  const { isPro } = useAuth();

  const proStatus = isPro();
  
  if (!proStatus) return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <ProGate feature="Full Past Questions Archive & Predictions" />
    </div>
  );

  const subjects = exam === "JAMB" ? JAMB_SUBJECTS : WAEC_SUBJECTS;

  function loadPastQuestions() {
    if (!subject) return toast({ message: "Select a subject first", type: "warning" });
    setLoading(true);
    setQuestions([]);
    try {
      const qs = getQuestionsFromBank({ subject, year, exam, count: 20 });
      setQuestions(qs);
      toast({ message: `${year} ${subject} questions loaded! 🎯`, type: "success" });
    } catch (err) {
      toast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function loadPredictions() {
    if (!subject) return toast({ message: "Select a subject first", type: "warning" });
    setPredLoading(true);
    setPredictions([]);
    try {
      const preds = await predictLikelyQuestions({ subject, exam, count: 6 });
      setPredictions(preds);
      toast({ message: "Exam predictions ready 🔮", type: "success" });
    } catch (err) {
      toast({ message: err.message, type: "error" });
    } finally {
      setPredLoading(false);
    }
  }

  function toggleReveal(id) {
    setRevealed(r => ({ ...r, [id]: !r[id] }));
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10 animate-fade">
      <header>
        <h1 className="text-4xl font-black mb-2 text-text">Past Questions</h1>
        <p className="text-text-muted font-medium">
          10 years of JAMB & WAEC questions (2014–2024) + AI exam predictions
        </p>
      </header>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Exam Type</label>
          <div className="flex bg-bg-3 p-1 rounded-xl border border-border">
            {["JAMB", "WAEC"].map(e => (
              <button key={e} onClick={() => { setExam(e); setSubject(""); }}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${exam === e ? "bg-primary text-black shadow-lg" : "text-text-muted"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field">
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Year</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field">
            {PAST_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <button onClick={loadPastQuestions} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <BookOpen size={18} />}
          Load Questions
        </button>
      </div>

      <div className="flex justify-center">
        <button onClick={loadPredictions} disabled={predLoading} className="btn-secondary w-full sm:w-auto flex items-center gap-2 text-accent border-accent/20 bg-accent/5">
          {predLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Predict Likely Questions
        </button>
      </div>

      {/* Predictions */}
      {predictions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-accent flex items-center gap-2">
            <Sparkles size={24} />
            AI Exam Predictions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {predictions.map((p, i) => (
              <div key={i} className="glass-card p-6 border-accent/20">
                <div className="flex justify-between items-center mb-4">
                  <strong className="text-lg">{p.topic}</strong>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    p.likelihood === "very high" ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
                  }`}>
                    {p.likelihood}
                  </span>
                </div>
                <p className="text-text-muted text-sm mb-4 leading-relaxed">{p.reason}</p>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 italic text-sm text-text-muted">
                  Sample: {p.sampleQuestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="glass-card p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-text-muted">
                Question {i + 1} · {q.topic}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                q.difficulty === "hard" ? "bg-danger/10 text-danger" : q.difficulty === "medium" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
              }`}>
                {q.difficulty}
              </span>
            </div>
            
            <p className="text-lg font-bold leading-relaxed mb-8">{q.question}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {Object.entries(q.options).map(([key, val]) => (
                <div key={key} className={`p-4 rounded-xl border transition-all ${
                  revealed[q.id] && key === q.correctAnswer ? "border-primary bg-primary/5 text-primary" : "border-white/5 bg-bg-3 text-text"
                }`}>
                  <strong className="font-black mr-2">{key})</strong> {val}
                </div>
              ))}
            </div>

            <button onClick={() => toggleReveal(q.id)} className="btn-secondary w-full flex items-center justify-center gap-2">
              <HelpCircle size={18} />
              {revealed[q.id] ? "Hide Explanation" : "Reveal Answer & Explanation"}
            </button>

            {revealed[q.id] && (
              <div className="mt-6 p-6 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="text-primary font-black uppercase tracking-widest text-xs mb-2">Correct Answer</div>
                <div className="text-xl font-bold mb-4">{q.correctAnswer}) {q.options[q.correctAnswer]}</div>
                <div className="h-px bg-primary/10 mb-4"></div>
                <p className="text-text-muted leading-relaxed italic">"{q.explanation}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
