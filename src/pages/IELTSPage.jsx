// IELTS hub: format, visa-grouped band requirements, cost-of-failure,
// starter practice, and how ExamPadi connects. Figures: IDP/official 2026 guidance.
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plane, GraduationCap, Briefcase, Home, AlertTriangle, BookOpen, Sparkles, Crown } from "lucide-react";
import { getQuestionsFromBank } from "../data/questions/compat";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import { usePaystack } from "../hooks/usePaystack";

const FORMAT = [
  { skill: "Listening", detail: "4 sections · 40 Qs · ~30 min. Recording plays ONCE.", drill: "Read ahead during pauses; underline keywords." },
  { skill: "Reading", detail: "3 passages · 40 Qs · 60 min. No extra transfer time.", drill: "20 min per passage. TRUE/FALSE/NOT GIVEN: only what the text says." },
  { skill: "Writing", detail: "Task 1 (150+ words, letter/chart) + Task 2 essay (250+ words).", drill: "Task Response is 25% — answer every part of the question." },
  { skill: "Speaking", detail: "11–14 min face-to-face: intro, 2-min long turn, discussion.", drill: "Keep talking naturally. Memorized answers get penalized." },
];

const VISAS = [
  {
    icon: GraduationCap, group: "Study abroad",
    rows: [
      ["UK universities", "6.0–6.5 undergrad · 6.5–7.0 postgrad (IELTS for UKVI)"],
      ["Canada universities", "6.5 undergrad · 6.5–7.0 postgrad"],
      ["Australia universities", "6.0–6.5 (no band below 5.5–6.0)"],
      ["USA universities", "6.5–8.0 depending on school"],
      ["NZ universities", "6.0 undergrad · 6.5 postgrad"],
    ],
  },
  {
    icon: Briefcase, group: "Work visas",
    rows: [
      ["UK Skilled Worker", "B1 ≈ 4.0+ each skill (IELTS for UKVI, approved centre)"],
      ["UK Health & Care Worker", "B1 ≈ 4.0–5.0"],
      ["Australia 482 Skills in Demand", "5.0 overall, 5.0 each skill"],
      ["Australia 485 Graduate", "6.5 overall"],
    ],
  },
  {
    icon: Home, group: "Migration & PR",
    rows: [
      ["Canada Express Entry", "CLB 7 minimum = 6.0 in EVERY skill (General Training)"],
      ["Canada strong CRS", "CLB 9 = Listening 8.0, others 7.0 — set by your weakest skill"],
      ["Australia PR (189/190/491)", "Competent 6.0 · Proficient 7.0 (+10 pts) · Superior 8.0 (+20 pts)"],
      ["NZ Skilled Migrant", "6.5 overall"],
    ],
  },
];

const TRAPS = [
  { t: "Academic vs General trap", b: "Immigration (Canada/UK) usually wants General Training. Universities want Academic. Booking the wrong one wastes ~$200 and weeks." },
  { t: "The UKVI trap", b: "UK visas need IELTS for UKVI at an approved SELT centre — a normal IELTS result is rejected for visa use." },
  { t: "The weakest-skill rule", b: "Canada sets your CLB by your LOWEST skill. One 5.5 in Writing sinks an otherwise perfect profile. Drill your weakest skill first." },
  { t: "The 2-year expiry", b: "Scores expire after 2 years. Time your test to your application window — retaking because yours lapsed is the most expensive mistake." },
];

export default function IELTSPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [practicing, setPracticing] = useState(false);
  const [buying, setBuying] = useState(false);
  const { initializePayment } = usePaystack();

  async function handleIeltsBuy() {
    if (!user) {
      toast({ message: "Sign in first — your plan is linked to your account.", type: "info" });
      navigate("/auth");
      return;
    }
    setBuying(true);
    try {
      const paidRef = await initializePayment({
        plan: "ielts",
        userEmail: user.email,
        userId: user.uid,
        userName: user.displayName || "Student",
        currency: "NGN",
        onPaid: async (response) => {
          navigate("/payment/success", { state: { reference: response.reference, plan: "ielts" } });
        },
      });
      if (!paidRef) setBuying(false);
    } catch (e) {
      console.error("IELTS purchase failed:", e);
      setBuying(false);
    }
  }

  function startPractice() {
    const qs = getQuestionsFromBank({ subject: "Reading", exam: "IELTS", count: 12 });
    const all = qs.length > 0 ? qs : getQuestionsFromBank({ subject: "Grammar", exam: "IELTS", count: 12 });
    if (all.length === 0) {
      toast({ message: "IELTS starter set is loading — try the AI Tutor meanwhile", type: "info" });
      navigate("/ai-tutor");
      return;
    }
    setPracticing(true);
    navigate("/practice", { state: { questions: all, subject: "IELTS Practice", mode: "practice" } });
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
          <Plane size={13} /> JAPA PATHWAY · STUDY · WORK · MIGRATE
        </div>
        <h1 className="type-h1">IELTS: one band can decide <span className="fx-glow-text">your visa</span></h1>
        <p className="lead" style={{ maxWidth: 620, margin: "0 auto" }}>
          Every year, Nigerians lose admissions and visa windows to a 0.5 band shortfall.
          A failed attempt costs ~$200, weeks of waiting, and sometimes the entire application season.
          Here's the full map — and how to prepare inside ExamPadi.
        </p>
      </header>

      {/* IELTS plan purchase */}
      <section className="glass-card p-6" style={{ border: "1px solid rgb(var(--accent-rgb) / 0.35)" }}>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div style={{ flex: "1 1 320px" }}>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-accent" />
              <h2 className="font-black text-text text-lg m-0">IELTS Preparation Plan — full year</h2>
            </div>
            <p className="text-sm text-text-muted mb-2">
              Everything in Pro Yearly plus the complete IELTS bank, band calculator, AI writing feedback,
              speaking drills and the visa requirement guide. One payment, 12 months.
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-text">₦80,000</span>
              <span className="text-text-muted font-bold text-sm">/ year</span>
            </div>
          </div>
          <div className="flex flex-col gap-2" style={{ minWidth: 220 }}>
            <button
              onClick={handleIeltsBuy}
              disabled={buying}
              className="btn-primary h-14 text-base"
            >
              {buying ? "Opening Paystack…" : "Get IELTS Plan ₦80,000/yr"}
            </button>
            <button onClick={() => navigate("/payment")} className="btn-secondary h-12 text-sm">
              See all plans
            </button>
          </div>
        </div>
      </section>

      {/* Format */}
      <section>
        <h2 className="font-black text-text mb-3">The test, in 60 seconds</h2>
        <div className="grid-auto">
          {FORMAT.map((f) => (
            <div key={f.skill} className="glass-card p-4">
              <div className="font-black text-text mb-1">{f.skill}</div>
              <div className="text-sm text-text-muted mb-2">{f.detail}</div>
              <div className="text-sm" style={{ color: "var(--primary)", fontWeight: 600 }}>🎯 {f.drill}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-3">Bands run 0–9 in 0.5 steps. Academic = university route. General Training = migration/work route.</p>
      </section>

      {/* Visa tables */}
      {VISAS.map((v) => (
        <section key={v.group} className="glass-card p-5">
          <h2 className="font-black text-text mb-3 flex items-center gap-2"><v.icon size={18} className="text-primary" /> {v.group}</h2>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {v.rows.map(([a, b]) => (
                  <tr key={a} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text)", verticalAlign: "top", whiteSpace: "nowrap" }}>{a}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-muted)", lineHeight: 1.6 }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <p className="text-xs text-text-muted">Figures summarize IDP/official 2026 guidance — always confirm with your school, employer, or immigration body before booking.</p>

      {/* Cost of failure */}
      <section className="glass-card p-5" style={{ borderColor: "rgba(255,77,106,0.35)" }}>
        <h2 className="font-black text-text mb-3 flex items-center gap-2"><AlertTriangle size={18} color="#FF4D6A" /> What failing costs you</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 2, color: "var(--text-muted)" }}>
          <li><strong className="text-text">~$200+ per attempt</strong> — gone, every retake.</li>
          <li><strong className="text-text">Lost admission cycles</strong> — schools won't wait for your next sitting.</li>
          <li><strong className="text-text">Expired scores</strong> — results die after 2 years; mistimed tests = paying twice.</li>
          <li><strong className="text-text">Wrong test type</strong> — normal IELTS instead of UKVI, or Academic instead of General, means starting over.</li>
        </ul>
      </section>

      {/* Traps */}
      <section>
        <h2 className="font-black text-text mb-3">Traps that kill applications</h2>
        <div className="grid-auto">
          {TRAPS.map((t) => (
            <div key={t.t} className="glass-card p-4">
              <div className="font-bold text-text text-sm mb-1">🪤 {t.t}</div>
              <div className="text-sm text-text-muted" style={{ lineHeight: 1.6 }}>{t.b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Write & Perform */}
      <section className="glass-card p-5">
        <h2 className="font-black text-text mb-3">How to Write & Perform in IELTS</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            { step: "1", title: "Before the test", desc: "Sleep well 2 nights before. Eat light. Arrive 30 min early. Bring ID. Do not cram new vocabulary on test day." },
            { step: "2", title: "Listening strategy", desc: "Read all questions BEFORE the recording starts. Underline keywords. Write answers as you hear them — spelling counts." },
            { step: "3", title: "Reading strategy", desc: "Skim each passage in 2 min first. Then read questions and scan for answers. Spend max 20 min per passage. TRUE/FALSE/NOT GIVEN: only what the text says." },
            { step: "4", title: "Writing strategy", desc: "Task 1: 150+ words, describe trends, no opinion. Task 2: 250+ words, clear position, 4 paragraphs. Spend 20 min on Task 1, 40 min on Task 2." },
            { step: "5", title: "Speaking strategy", desc: "Part 1: answer naturally. Part 2: use the full 2 minutes — structure with First… Then… Finally. Part 3: give extended answers with examples." },
            { step: "6", title: "After the test", desc: "Results come in 13 days (paper) or 3-5 days (computer). Scores are valid for 2 years. Plan retakes early if needed." },
          ].map((s) => (
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
          Full IELTS question bank, AI explanations for every answer, writing feedback, and a tutor that drills your weakest skill first.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={startPractice} className="btn-primary" disabled={practicing}>
            <BookOpen size={16} /> {practicing ? "Loading…" : "Start IELTS practice"}
          </button>
          <Link to="/ai-tutor" className="btn-secondary"><Sparkles size={16} /> Ask the AI Tutor</Link>
        </div>
        {!user && <p className="text-xs text-text-muted mt-3">Free account needed to save progress.</p>}
      </section>
    </div>
  );
}
