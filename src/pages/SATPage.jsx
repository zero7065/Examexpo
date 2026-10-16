// SAT hub: digital SAT format, scoring, admission bands, section tactics,
// cost of failure, and ExamPadi starter practice. Figures: College Board 2026.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Calculator, BookOpen, Sparkles, AlertTriangle, Target, Timer, TrendingUp } from "lucide-react";
import { getQuestionsFromBank } from "../data/questions/compat";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const SECTIONS = [
  { skill: "Reading & Writing", detail: "2 modules · 54 questions · 64 min. Short passages, one question each. Adaptive: module 1 sets your difficulty.", drill: "Read the question stem FIRST, then the line range. Transition words carry heavy weight." },
  { skill: "Math", detail: "2 modules · 44 questions · 70 min. Calculator allowed throughout, including the built-in Desmos.", drill: "No partial credit — show the setup, then back-solve from the answer choices when stuck." },
];

const BANDS = [
  { group: "Top US universities", rows: [
    ["Ivy League / MIT / Stanford", "1500–1580+ (25th–75th percentile)"],
    ["Top 20 research universities", "1450–1520"],
    ["Top 50 universities", "1350–1450"],
    ["State flagships", "1200–1350"],
  ] },
  { group: "Score → percentile (2026)", rows: [
    ["1600", "99th percentile — perfect"],
    ["1500", "98th percentile"],
    ["1400", "94th percentile"],
    ["1200", "85th percentile"],
    ["1000", "58th percentile"],
    ["800", "31st percentile"],
  ] },
  { group: "Nigerian applicant angle", rows: [
    ["Test-optional schools", "Many US schools are test-optional — a strong score still lifts scholarship offers"],
    ["Scholarship leverage", "1400+ commonly unlocks $10k–full-ride merit aid at US universities"],
    ["Registration", "$68 international fee + $43 Nigeria regional fee (2026 guidance)"],
    ["Test centres", "Lagos, Abuja, Port Harcourt — register early, seats fill fast"],
  ] },
];

const TRAPS = [
  { t: "The adaptive trap", b: "Both sections adapt after Module 1. An easy Module 2 means Module 1 went badly — the scoring is module-based, so never coast through Module 1." },
  { t: "The timing trap", b: "Averaging 93 seconds per R&W question and 95 seconds per Math question. Losing 2 minutes early costs 2 questions you never see." },
  { t: "The 'test-optional' trap", b: "Optional for admission ≠ optional for scholarships. Competing with test-submitters for merit aid without a score is fighting one-handed." },
  { t: "The score-send trap", b: "Score Choice lets you send best sections, but some schools require ALL sittings. Know each school's policy before you register twice." },
];

const TACTICS = [
  { step: "1", title: "Before you book", desc: "Take one free Bluebook practice test first. Only book the real date if your target and your practice score are within 100 points." },
  { step: "2", title: "Reading & Writing", desc: "One short passage per question — don't read the whole thing first. Command of Evidence questions point you to exact lines. Transitions: answer from the logic of the two surrounding sentences." },
  { step: "3", title: "Math", desc: "Open with the 8 most-tested formulas (slope, vertex form, circle equation, Pythagorean triples, mean, percent change). Use Desmos for systems and quadratics — it's faster than algebra." },
  { step: "4", title: "Error log", desc: "After every practice set, write down WHY each wrong answer happened: misread, concept gap, or rushed. Fix the biggest category first." },
  { step: "5", title: "Test week", desc: "Two full Bluebook tests at your test time of day. Sleep 8 hours. Bring passport ID and your admission ticket. No new material the last 48 hours." },
  { step: "6", title: "After the test", desc: "Scores release in ~2 weeks. Use Score Choice wisely and superscore across sittings — most US schools take your best section combination." },
];

export default function SATPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [practicing, setPracticing] = useState(false);

  function startPractice() {
    const rw = getQuestionsFromBank({ subject: "Reading", exam: "SAT", count: 6 });
    const wr = getQuestionsFromBank({ subject: "Writing", exam: "SAT", count: 4 });
    const all = [...rw, ...wr].slice(0, 10);
    const fallback = all.length >= 5 ? all : getQuestionsFromBank({ subject: "Math", exam: "SAT", count: 10 });
    if (!fallback || fallback.length === 0) {
      toast({ message: "SAT starter set is loading — ask the AI Tutor meanwhile", type: "info" });
      navigate("/ai-tutor");
      return;
    }
    setPracticing(true);
    navigate("/practice", { state: { questions: fallback, subject: "SAT Practice", mode: "practice" } });
  }

  return (
    <div className="page-content max-w-4xl mx-auto space-y-8">
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Home
      </Link>

      <header className="text-center">
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 100,
          background: "rgb(var(--primary-rgb) / 0.1)", border: "1px solid rgb(var(--primary-rgb) / 0.25)",
          fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 16,
        }}>
          <GraduationCap size={13} /> US & INTERNATIONAL ADMISSIONS
        </div>
        <h1 className="h-1">SAT: your score is <span className="fx-glow-text">scholarship money</span></h1>
        <p className="lead" style={{ maxWidth: 620, margin: "0 auto" }}>
          Every point above 1400 can unlock thousands of dollars in merit aid at US universities.
          The digital SAT is shorter, adaptive, and won on strategy — here's the full map,
          and how to drill it inside ExamPadi.
        </p>
      </header>

      {/* Format */}
      <section>
        <h2 className="font-black text-text mb-3">The test, in 60 seconds</h2>
        <div className="grid-auto">
          {SECTIONS.map((f) => (
            <div key={f.skill} className="glass-card p-4">
              <div className="font-black text-text mb-1">{f.skill}</div>
              <div className="text-sm text-text-muted mb-2">{f.detail}</div>
              <div className="text-sm" style={{ color: "var(--primary)", fontWeight: 600 }}>🎯 {f.drill}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-3">Total: 134 questions · 132 minutes · 1600 scale (two 200–800 section scores). Digital format delivered in Bluebook at approved centres.</p>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Timer, label: "Duration", value: "2h 14m" },
          { icon: Target, label: "Score range", value: "400–1600" },
          { icon: Calculator, label: "Calculator", value: "All Math" },
          { icon: TrendingUp, label: "Retakes", value: "Score Choice" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <s.icon size={18} className="text-primary mx-auto mb-1" />
            <div className="text-lg font-black text-text font-mono">{s.value}</div>
            <div className="text-xs text-text-muted font-bold">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Score bands */}
      {BANDS.map((b) => (
        <section key={b.group} className="glass-card p-5">
          <h2 className="font-black text-text mb-3">{b.group}</h2>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {b.rows.map(([a, c]) => (
                  <tr key={a} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text)", verticalAlign: "top", whiteSpace: "nowrap" }}>{a}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-muted)", lineHeight: 1.6 }}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <p className="text-xs text-text-muted">Figures summarize College Board / official 2026 guidance — always confirm with each university's admissions office before booking.</p>

      {/* Cost of failure */}
      <section className="glass-card p-5" style={{ borderColor: "rgba(255,77,106,0.35)" }}>
        <h2 className="font-black text-text mb-3 flex items-center gap-2"><AlertTriangle size={18} color="#FF4D6A" /> What a weak score costs you</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 2, color: "var(--text-muted)" }}>
          <li><strong className="text-text">~$110+ per attempt</strong> (international fees) — gone with every retake.</li>
          <li><strong className="text-text">Lost scholarship money</strong> — the gap between 1300 and 1450 is often $10k+/year.</li>
          <li><strong className="text-text">Missed registration windows</strong> — Nigerian centres fill weeks ahead; late registration costs extra.</li>
          <li><strong className="text-text">One-shot pressure</strong> — arriving without a practice-test baseline turns test day into an experiment.</li>
        </ul>
      </section>

      {/* Traps */}
      <section>
        <h2 className="font-black text-text mb-3">Traps that sink scores</h2>
        <div className="grid-auto">
          {TRAPS.map((t) => (
            <div key={t.t} className="glass-card p-4">
              <div className="font-bold text-text text-sm mb-1">🪤 {t.t}</div>
              <div className="text-sm text-text-muted" style={{ lineHeight: 1.6 }}>{t.b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tactics */}
      <section className="glass-card p-5">
        <h2 className="font-black text-text mb-3">How to Prepare & Perform</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {TACTICS.map((s) => (
            <div key={s.step} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{s.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-card p-6 text-center" style={{ borderColor: "rgb(var(--primary-rgb) / 0.4)" }}>
        <h2 className="font-black text-text mb-2">Prepare inside ExamPadi</h2>
        <p className="text-sm text-text-muted mb-4" style={{ maxWidth: 520, margin: "0 auto 16px" }}>
          SAT question bank with AI explanations for every answer, section tactics, and a tutor that drills your weakest skill first.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={startPractice} className="btn-primary" disabled={practicing}>
            <BookOpen size={16} /> {practicing ? "Loading…" : "Start SAT practice"}
          </button>
          <Link to="/ai-tutor" className="btn-secondary"><Sparkles size={16} /> Ask the AI Tutor</Link>
        </div>
        {!user && <p className="text-xs text-text-muted mt-3">Free account needed to save progress.</p>}
      </section>
    </div>
  );
}
