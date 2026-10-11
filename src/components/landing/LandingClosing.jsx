// FAQ (8 items) + final CTA + 5-column footer.
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";

const FAQS = [
  { q: "Is ExamPadi AI free?", a: "Yes! The free tier gives you 15 practice questions and 3 AI tutor messages every day, forever. Upgrade to Pro for unlimited access." },
  { q: "Which exams do you cover?", a: "JAMB (UTME), WAEC (SSCE & GCE), NECO and NABTEB, with questions from 2017 to 2026. Coverage is deepest for JAMB and grows every week." },
  { q: "How does the AI Tutor work?", a: "Ask any question in your subjects and get instant step-by-step explanations trained on the West African curriculum. You can even snap a photo of a question (Pro)." },
  { q: "What do I get with Pro?", a: "Unlimited questions and AI chat, all subjects unlocked, full CBT mock exams, detailed analytics, offline mode and priority support — ₦3,000/month or ₦10,000/year." },
  { q: "Does it work offline or on a weak network?", a: "Yes. Questions, progress and the app shell keep working offline, and anything you do syncs automatically when you're back. If your network blocks Google services, the app tells you and keeps working from cache." },
  { q: "Which subjects are available?", a: "English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Geography, Agricultural Science, Literature, Commerce, CRS, Further Mathematics — and more on the way." },
  { q: "Can schools use ExamPadi?", a: "Yes — contact us on WhatsApp for bulk Pro seats, teacher oversight and onboarding support for your school or tutorial centre." },
  { q: "How do I pay?", a: "Securely with Paystack — bank transfer, USSD, cards and mobile money. Yearly plans can be cancelled anytime." },
];

export function LandingFaq() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section id="faq" className="lp-section" style={{ background: "var(--bg-2)" }}>
      <div className="lp-container" style={{ maxWidth: 720 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 className="lp-h2">Frequently Asked <span className="lp-gradient-text">Questions</span></h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="lp-bento-card" style={{ padding: "20px 24px", cursor: "pointer" }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{faq.q}</h4>
                <ChevronDown size={18} style={{
                  color: "var(--text-muted)",
                  transform: openFaq === i ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s ease", flexShrink: 0,
                }} />
              </div>
              {openFaq === i && (
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: "12px 0 0" }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingCta({ user }) {
  return (
    <section className="lp-section" style={{ background: "var(--landing-gradient)", textAlign: "center", color: "#fff" }}>
      <div className="lp-container">
        <h2 className="lp-animate-in" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
          Ready to Ace Your Exams?
        </h2>
        <p className="lp-animate-in lp-delay-1" style={{ fontSize: 16, opacity: 0.85, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Join thousands of students already preparing smarter with ExamPadi AI.
          Start free, upgrade when you're ready.
        </p>
        <div className="lp-animate-in lp-delay-2">
          <Link to={user ? "/dashboard" : "/auth"} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "16px 40px", borderRadius: 14, fontSize: 16, fontWeight: 700,
            background: "#fff", color: "var(--primary)", textDecoration: "none",
          }}>
            {user ? "Go to Dashboard" : "Start Free Today"} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

const FOOT_COLS = [
  {
    title: "Exams",
    links: [
      { label: "JAMB (UTME)", href: "/auth" },
      { label: "WAEC", href: "/auth" },
      { label: "NECO", href: "/auth" },
      { label: "NABTEB", href: "/auth" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "Past Questions", href: "#features" },
      { label: "AI Tutor", href: "#features" },
      { label: "CBT Simulator", href: "#features" },
      { label: "Study Plans", href: "#features" },
    ],
  },
  {
    title: "Subjects",
    links: [
      { label: "English & Maths", href: "/question-bank" },
      { label: "Sciences", href: "/question-bank" },
      { label: "Arts & Commercial", href: "/question-bank" },
      { label: "All Subjects", href: "/question-bank" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why Us", href: "#why-us" },
      { label: "About", href: "#about" },
      { label: "Pricing", href: "#pricing" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "WhatsApp", href: "https://wa.me/2348127636057", external: true },
      { label: "Email Us", href: "mailto:jadai7065@gmail.com", external: true },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

function FootLink({ label, href, external }) {
  const style = { color: "#94a3b8", textDecoration: "none", fontSize: 13, transition: "color 0.2s" };
  const hover = {
    onMouseOver: (e) => { e.currentTarget.style.color = "#fff"; },
    onMouseOut: (e) => { e.currentTarget.style.color = "#94a3b8"; },
  };
  if (external || href.startsWith("#")) {
    return <a href={href} style={style} {...hover} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a>;
  }
  return <Link to={href} style={style} {...hover}>{label}</Link>;
}

export function LandingFooter() {
  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "48px 0 24px" }}>
      <div className="lp-container">
        <div className="lp-foot-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(5, 1fr)", gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--landing-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff" }}>E</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
                ExamPadi <span style={{ color: "#a78bfa" }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
              The smartest way for West African students to prepare for JAMB, WAEC, NECO, NABTEB &amp; POST-UTME exams.
            </p>
          </div>
          {FOOT_COLS.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#fff", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <FootLink key={l.label} {...l} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 20, textAlign: "center", fontSize: 12 }}>
          <div style={{ marginBottom: 12 }}>
            <span className="jadai-brand-full" style={{ fontWeight: 800, fontSize: 13, letterSpacing: "0.02em" }}>
              Developed by Jadai Studios
            </span>
          </div>
          &copy; {new Date().getFullYear()} ExamPadi AI. All rights reserved.
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .lp-foot-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </footer>
  );
}
