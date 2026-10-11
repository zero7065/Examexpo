// Landing hero — headline, CTAs, trust chips, phone shot with mockup fallback.
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, WifiOff, Gift } from "lucide-react";
import LandingMedia from "./LandingMedia";

function PhoneMockup() {
  return (
    <div className="lp-phone lp-animate-in lp-delay-3">
      <div className="lp-phone-notch" />
      <div style={{ background: "var(--landing-gradient)", borderRadius: 14, padding: 14, color: "#fff", marginBottom: 12 }}>
        <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600 }}>PHYSICS · Q7/40</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, lineHeight: 1.5 }}>
          A body of mass 5kg has momentum 20kg·m/s. Its velocity is…
        </div>
      </div>
      {["2 m/s", "4 m/s ✓", "10 m/s", "100 m/s"].map((o, i) => (
        <div key={o} style={{
          borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 600, marginBottom: 8,
          background: i === 1 ? "rgb(var(--success-rgb) / 0.15)" : "var(--bg-2)",
          border: i === 1 ? "1px solid var(--success)" : "1px solid var(--border)",
          color: "var(--text)",
        }}>{o}</div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--primary)" }} />
        <div style={{ flex: 3, height: 8, borderRadius: 4, background: "var(--border)" }} />
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}>AI explanation available</div>
    </div>
  );
}

const CHIPS = [
  { icon: CheckCircle2, label: "800+ exam questions" },
  { icon: WifiOff, label: "Works offline" },
  { icon: Gift, label: "Free to start" },
];

export default function LandingHero({ user }) {
  return (
    <section style={{
      padding: "160px 0 80px",
      background: "linear-gradient(180deg, rgb(var(--primary-rgb) / 0.08) 0%, var(--bg) 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -100, right: -100, width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgb(var(--primary-rgb) / 0.14) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60, width: 300, height: 300,
        borderRadius: "50%", background: "radial-gradient(circle, rgb(var(--accent-rgb) / 0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div className="lp-container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center" }} className="lp-hero-grid">
          <div style={{ textAlign: "left" }}>
            <div className="lp-animate-in" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 16px 6px 6px", borderRadius: 100,
              background: "rgb(var(--primary-rgb) / 0.1)", border: "1px solid rgb(var(--primary-rgb) / 0.25)",
              marginBottom: 24, fontSize: 13, fontWeight: 600, color: "var(--primary)",
            }}>
              <span style={{ background: "var(--landing-gradient)", color: "#fff", padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>NEW</span>
              AI-Powered Exam Prep for West African Students
            </div>
            <h1 className="lp-animate-in lp-delay-1" style={{ fontSize: "clamp(2rem, 6vw, 3.25rem)", fontWeight: 900, lineHeight: 1.08, margin: "0 0 20px", letterSpacing: "-0.03em" }}>
              Ace Your Exams with <span className="lp-gradient-text">AI-Powered</span> Precision
            </h1>
            <p className="lp-animate-in lp-delay-2" style={{ fontSize: 18, lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 520, margin: "0 0 36px" }}>
              Practice real JAMB, WAEC &amp; NABTEB past questions, get AI-driven explanations,
              simulate CBT exams, and track your progress — all in one platform.
            </p>
            <div className="lp-animate-in lp-delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              <Link to={user ? "/dashboard" : "/auth"} className="lp-btn-primary">
                {user ? "Go to Dashboard" : "Start Free"} <ArrowRight size={18} />
              </Link>
              <a href="#features" className="lp-btn-ghost">Learn More</a>
            </div>
            <div className="lp-animate-in lp-delay-4" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {CHIPS.map((c) => (
                <span key={c.label} className="lp-glass" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                  color: "var(--text)",
                }}>
                  <c.icon size={15} color="var(--primary)" /> {c.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <LandingMedia slot="hero" alt="ExamPadi practice screen" mockup={<PhoneMockup />} />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
