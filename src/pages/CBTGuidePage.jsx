// CBT & JAMB computer-exam guide: illustrated steps + interactive demo
// for students who have never operated a CBT computer.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Monitor, MousePointerClick, LogIn, BookOpenCheck, ListChecks,
  Flag, Timer, Send, ArrowLeft, ArrowRight, Sparkles, RotateCcw,
} from "lucide-react";

function ComputerArt() {
  return (
    <svg viewBox="0 0 220 150" width="200" style={{ maxWidth: "100%", height: "auto" }}>
      <rect x="30" y="15" width="160" height="100" rx="10" fill="var(--bg-2)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="42" y="27" width="136" height="66" rx="5" fill="var(--primary)" opacity="0.18" />
      <circle cx="70" cy="48" r="5" fill="var(--primary)" />
      <rect x="82" y="44" width="70" height="8" rx="4" fill="var(--primary)" opacity="0.6" />
      <rect x="60" y="60" width="100" height="6" rx="3" fill="var(--text-muted)" opacity="0.5" />
      <rect x="60" y="72" width="80" height="6" rx="3" fill="var(--text-muted)" opacity="0.35" />
      <rect x="95" y="115" width="30" height="14" fill="var(--border)" />
      <rect x="60" y="129" width="100" height="8" rx="4" fill="var(--border)" />
      <ellipse cx="188" cy="122" rx="12" ry="16" fill="var(--bg-2)" stroke="var(--accent)" strokeWidth="3" />
      <line x1="188" y1="114" x2="188" y2="122" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  );
}

function LoginArt() {
  return (
    <svg viewBox="0 0 220 150" width="200" style={{ maxWidth: "100%", height: "auto" }}>
      <rect x="40" y="20" width="140" height="110" rx="12" fill="var(--bg-2)" stroke="var(--primary)" strokeWidth="3" />
      <circle cx="110" cy="55" r="14" fill="none" stroke="var(--primary)" strokeWidth="3" />
      <path d="M92 100 Q110 84 128 100" stroke="var(--primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="60" y="108" width="100" height="10" rx="5" fill="var(--accent)" opacity="0.7" />
      <rect x="185" y="60" width="22" height="30" rx="11" fill="var(--success)" opacity="0.85" />
      <path d="M190 75 l4 4 7-8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PaletteArt() {
  return (
    <svg viewBox="0 0 220 150" width="200" style={{ maxWidth: "100%", height: "auto" }}>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => {
          const done = r * 5 + c < 11;
          const cur = r * 5 + c === 11;
          return (
            <rect key={`${r}-${c}`} x={30 + c * 34} y={25 + r * 28} width={26} height={20} rx={6}
              fill={cur ? "var(--primary)" : done ? "var(--success)" : "var(--bg-3)"}
              opacity={cur || done ? 1 : 0.8}
              stroke={cur ? "var(--primary)" : "var(--border)"} strokeWidth="2" />
          );
        })
      )}
      <text x="30" y="140" fontSize="11" fill="var(--text-muted)" fontFamily="inherit">Green = answered · Tap any box to jump</text>
    </svg>
  );
}

const STEPS = [
  {
    icon: Monitor, title: "1. Meet the computer",
    body: "A CBT computer is just a screen, a mouse and a keyboard. The MOUSE moves the arrow (cursor). LEFT-CLICK (press the left button once) selects things. You will mostly click — typing is rarely needed.",
    art: <ComputerArt />,
  },
  {
    icon: LogIn, title: "2. Log in with your JAMB reg number",
    body: "Type your registration number carefully, then click LOGIN or press Enter. If it fails, re-check each digit — most login problems are typos, not faults. Raise your hand only after trying twice.",
    art: <LoginArt />,
  },
  {
    icon: BookOpenCheck, title: "3. Read the instruction screen",
    body: "Never rush past instructions. Note the number of questions, total time, and whether you can move between subjects freely. In JAMB CBT you can answer in any order.",
    art: null,
  },
  {
    icon: MousePointerClick, title: "4. Answer by clicking an option",
    body: "Click the circle or letter (A–D) to pick it — it lights up. Click a different option to change your mind. Your answer saves automatically; nothing else to press.",
    art: null,
  },
  {
    icon: ListChecks, title: "5. Move with Next, Previous & the palette",
    body: "NEXT moves forward, PREVIOUS goes back. The question palette (numbered boxes) lets you jump anywhere: green = answered, blank = skipped. Answer easy ones first, then return to hard ones.",
    art: <PaletteArt />,
  },
  {
    icon: Flag, title: "6. Flag and review",
    body: "Stuck? Flag the question and move on — flagged items stay visible for review. With 10 minutes left, stop solving new hard questions and review flagged ones instead.",
    art: null,
  },
  {
    icon: Timer, title: "7. Watch the timer, not the clock",
    body: "The countdown is always on screen. Plan roughly: total minutes ÷ questions = seconds per question. When it hits zero the exam submits itself — so submit yourself 2 minutes early after a final check.",
    art: null,
  },
  {
    icon: Send, title: "8. Submit confidently",
    body: "Click SUBMIT, confirm YES, and wait for the success screen. Do NOT close the browser or stand up until the invigilator confirms. Your result slip comes later — leaving calmly is part of the exam.",
    art: null,
  },
];

const DEMO_QS = [
  { q: "What is 7 × 8?", options: ["54", "56", "63", "48"], answer: 1 },
  { q: "Which is a noun?", options: ["Quickly", "Happiness", "Run", "Blue"], answer: 1 },
  { q: "H₂O is commonly known as:", options: ["Salt", "Water", "Oxygen", "Sugar"], answer: 1 },
];

function MiniDemo() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [secs, setSecs] = useState(5 * 60);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSecs((s) => {
      if (s <= 1) { clearInterval(t); setDone(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [done ]);

  const q = DEMO_QS[idx];
  const score = DEMO_QS.filter((d, i) => answers[i] === d.answer).length;

  function reset() {
    setIdx(0); setAnswers({}); setFlagged({}); setSecs(5 * 60); setDone(false);
  }

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="glass-card p-5" style={{ borderColor: "rgb(var(--primary-rgb) / 0.4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <strong>Try it: mini CBT demo</strong>
        <span style={{
          marginLeft: "auto", fontVariantNumeric: "tabular-nums", fontWeight: 800, fontSize: 14,
          color: secs < 60 ? "var(--danger)" : "var(--text)",
          background: "var(--bg-3)", padding: "6px 14px", borderRadius: 10, border: "1px solid var(--border)",
        }}>⏱ {mm}:{ss}</span>
      </div>

      {!done ? (
        <>
          {/* palette */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {DEMO_QS.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: 40, height: 40, borderRadius: 10, fontWeight: 800, cursor: "pointer",
                background: i === idx ? "var(--primary)" : answers[i] !== undefined ? "var(--success)" : "var(--bg-3)",
                color: i === idx || answers[i] !== undefined ? "#fff" : "var(--text-muted)",
                border: flagged[i] ? "2px dashed var(--accent)" : "1px solid var(--border)",
                fontFamily: "inherit",
              }}>{i + 1}</button>
            ))}
            <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>← tap to jump. Dashed = flagged.</span>
          </div>

          <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>{idx + 1}. {q.q}</p>
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            {q.options.map((o, i) => {
              const letter = "ABCD"[i];
              const sel = answers[idx] === i;
              return (
                <button key={letter} onClick={() => setAnswers((a) => ({ ...a, [idx]: i }))} style={{
                  textAlign: "left", padding: "12px 14px", borderRadius: 12, cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                  background: sel ? "rgb(var(--primary-rgb) / 0.16)" : "var(--bg-3)",
                  border: sel ? "2px solid var(--primary)" : "1px solid var(--border)",
                  color: "var(--text)", fontWeight: sel ? 700 : 400,
                }}>
                  <strong style={{ marginRight: 10 }}>{letter}</strong> {o}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setIdx((v) => Math.max(0, v - 1))} disabled={idx === 0} className="btn-secondary" style={{ padding: "10px 16px", fontSize: 13 }}>
              <ArrowLeft size={14} /> Prev
            </button>
            <button onClick={() => setIdx((v) => Math.min(DEMO_QS.length - 1, v + 1))} disabled={idx === DEMO_QS.length - 1} className="btn-secondary" style={{ padding: "10px 16px", fontSize: 13 }}>
              Next <ArrowRight size={14} />
            </button>
            <button onClick={() => setFlagged((f) => ({ ...f, [idx]: !f[idx] }))} className="btn-secondary" style={{ padding: "10px 16px", fontSize: 13 }}>
              <Flag size={14} /> {flagged[idx] ? "Unflag" : "Flag"}
            </button>
            <button onClick={() => setDone(true)} className="btn-primary" style={{ padding: "10px 20px", fontSize: 13, marginLeft: "auto" }}>
              Submit <Send size={14} />
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: score >= 2 ? "var(--success)" : "var(--accent)" }}>{score}/{DEMO_QS.length}</div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0 16px" }}>
            {score === 3 ? "Perfect! You just operated a CBT exactly like JAMB. 🎉" : "Good try — notice how clicking, jumping and flagging all work. Practice again!"}
          </p>
          <button onClick={reset} className="btn-secondary" style={{ padding: "10px 20px", fontSize: 13 }}>
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default function CBTGuidePage() {
  return (
    <div className="page-content max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 100,
          background: "rgb(var(--primary-rgb) / 0.1)", border: "1px solid rgb(var(--primary-rgb) / 0.25)",
          fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 16,
        }}>
          <Sparkles size={13} /> FIRST TIME WITH A COMPUTER? START HERE
        </div>
        <h1 className="h-1">How JAMB CBT <span className="fx-glow-text">actually works</span></h1>
        <p className="lead" style={{ maxWidth: 600, margin: "0 auto" }}>
          A picture-by-picture walkthrough of the computer exam — then a safe demo
          where you can press every button before the real day.
        </p>
      </header>

      <div className="grid-auto" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}>
        {STEPS.map((s) => (
          <div key={s.title} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={19} className="text-primary" />
              <h3 className="font-black text-text" style={{ fontSize: 16 }}>{s.title}</h3>
            </div>
            {s.art && <div style={{ marginBottom: 12 }}>{s.art}</div>}
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-muted)", margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="h-2" style={{ marginBottom: 12 }}>Interactive demo <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>— press everything, nothing breaks</span></h2>
        <MiniDemo />
      </div>

      <div className="glass-card p-6" style={{ borderColor: "rgb(var(--accent-rgb) / 0.35)" }}>
        <h2 className="font-black text-text mb-3">Exam-day checklist</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 2, color: "var(--text-muted)" }}>
          <li>Arrive early with your slip + valid ID; biometric verification comes first.</li>
          <li>Sit, breathe, log in slowly — typos are the #1 login failure.</li>
          <li>Answer easy questions first across all subjects, then return to flagged ones.</li>
          <li>Never leave questions blank — there is no penalty for wrong answers.</li>
          <li>Submit yourself 2 minutes early. Then try a full <Link to="/mock-exam" style={{ color: "var(--primary)", fontWeight: 700 }}>timed mock exam</Link>.</li>
        </ul>
        <div className="flex gap-2 flex-wrap mt-4">
          <Link to="/mock-exam" className="btn-primary">Take a mock exam</Link>
          <Link to="/ai-tutor" className="btn-secondary">Ask the AI Tutor</Link>
        </div>
      </div>
    </div>
  );
}
