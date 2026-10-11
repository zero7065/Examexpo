// Why Us, About, How-it-works, Testimonials sections.
import { Link } from "react-router-dom";
import { Star, Users, BookOpen, Zap, MessageSquare } from "lucide-react";

const WHY_US = [
  { emoji: "🎯", title: "Built for Nigerian Exams", body: "Not generic edtech. Every question, explanation and plan targets JAMB, WAEC, NECO & NABTEB syllabi." },
  { emoji: "🤖", title: "AI That Explains, Not Just Answers", body: "Every answer comes with step-by-step reasoning, so you learn the method — not just the option." },
  { emoji: "📴", title: "Works Offline", body: "Questions, progress and the app shell keep working with poor or no network. Your data syncs when you're back." },
  { emoji: "🆓", title: "Free to Start, Fair to Upgrade", body: "15 questions + 3 AI messages daily, free forever. Pro is priced for Nigerian students and schools." },
  { emoji: "📊", title: "Knows Your Weak Spots", body: "Mastery tracking, weak-topic detection and adaptive assignments focus you where marks are lost." },
  { emoji: "👥", title: "Learn Together", body: "Study partners, shared tests and leaderboards keep you accountable and motivated daily." },
];

export function LandingWhyUs() {
  return (
    <section id="why-us" className="lp-section" style={{ background: "var(--bg-2)" }}>
      <div className="lp-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 className="lp-h2">Why <span className="lp-gradient-text">ExamPadi</span>?</h2>
          <p className="lp-sub">Six reasons students and schools choose us over generic study apps.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="lp-why-grid">
          {WHY_US.map((w, i) => (
            <div key={w.title} className={`lp-bento-card lp-animate-in lp-delay-${(i % 5) + 1}`}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{w.emoji}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{w.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{w.body}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .lp-why-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

import StudentsIllustration from "./StudentsIllustration";

export function LandingAbout() {
  return (
    <section id="about" className="lp-section" style={{ background: "var(--bg)" }}>
      <div className="lp-container" style={{ maxWidth: 960 }}>
        <div className="lp-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div style={{ textAlign: "left" }}>
            <h2 className="lp-h2">Built by Students of the <span className="lp-gradient-text">System</span></h2>
            <p className="lp-sub" style={{ marginBottom: 20 }}>
              ExamPadi was built by Jadai Studios to solve a simple problem: brilliant Nigerian students
              fail exams they could pass — not for lack of effort, but for lack of the right practice tools.
            </p>
            <p className="lp-sub" style={{ marginBottom: 32 }}>
              So we combined real past questions, an AI tutor that explains like a patient teacher,
              and exam-day simulation — and made it work on the cheapest phones and the weakest networks.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="https://wa.me/2348127636057"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-btn-primary"
                style={{ padding: "12px 28px", fontSize: 15 }}
              >
                <MessageSquare size={17} /> Chat on WhatsApp
              </a>
              <a href="mailto:jadai7065@gmail.com" className="lp-btn-ghost" style={{ padding: "12px 28px", fontSize: 15 }}>
                jadai7065@gmail.com
              </a>
            </div>
          </div>
          <div className="lp-animate-in">
            <StudentsIllustration />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .lp-about-grid { grid-template-columns: 1fr !important; }
          .lp-about-grid > div:first-child { text-align: center; }
          .lp-about-grid > div:first-child div:last-child { justify-content: center; }
        }
      `}</style>
    </section>
  );
}

const STEPS = [
  { step: "01", title: "Create Account", desc: "Sign up free in 30 seconds. No credit card needed.", icon: Users },
  { step: "02", title: "Choose Your Exam", desc: "Select JAMB, WAEC, or NABTEB and pick your subjects.", icon: BookOpen },
  { step: "03", title: "Start Practicing", desc: "Answer questions, review AI explanations, and track your progress.", icon: Zap },
];

export function LandingHow() {
  return (
    <section className="lp-section" style={{ background: "var(--bg-2)" }}>
      <div className="lp-container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 className="lp-h2">How It <span className="lp-gradient-text">Works</span></h2>
          <p className="lp-sub">Start improving your grades in three simple steps.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="lp-how-grid">
          {STEPS.map((item, i) => (
            <div key={item.step} className={`lp-bento-card lp-animate-in lp-delay-${i + 1}`} style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--landing-gradient)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 900, margin: "0 auto 20px",
                boxShadow: "0 8px 24px rgb(var(--primary-rgb) / 0.3)",
              }}>{item.step}</div>
              <item.icon size={28} color="var(--primary)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .lp-how-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

const TESTIMONIALS = [
  { name: "Chidera O.", text: "ExamPadi AI helped me score 320 in JAMB! The AI Tutor is a game-changer.", exam: "JAMB 2025", rating: 5 },
  { name: "Aisha B.", text: "I passed WAEC with 8 A's thanks to the CBT simulator. Felt like the real exam!", exam: "WAEC 2025", rating: 5 },
  { name: "Emeka N.", text: "The gamification keeps me studying daily. 150-day streak and counting!", exam: "NABTEB 2025", rating: 5 },
];

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function LandingTestimonials() {
  return (
    <section className="lp-section" style={{ background: "var(--bg)" }}>
      <div className="lp-container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="lp-h2">Loved by <span className="lp-gradient-text">Students</span></h2>
          <p className="lp-sub">Hear from students who aced their exams with ExamPadi AI.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="lp-test-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`lp-bento-card lp-animate-in lp-delay-${i + 1}`}>
              <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
                {Array.from({ length: 5 }, (_, s) => (
                  <Star key={s} size={14} fill={s < t.rating ? "var(--accent)" : "none"} color={s < t.rating ? "var(--accent)" : "var(--border)"} />
                ))}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-muted)", margin: "12px 0" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: "var(--landing-gradient)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 14,
                }}>{initials(t.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>{t.exam}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/auth" className="lp-btn-ghost" style={{ padding: "12px 28px", fontSize: 14 }}>
            Join them — start free
          </Link>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .lp-test-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
