// Public schools landing: hero, problem stat, features, pricing, pilot CTA, FAQ.
import { useState } from "react";
import { Link } from "react-router-dom";
import LandingStyles from "../../components/landing/LandingStyles";
import LandingNav from "../../components/landing/LandingNav";
import { LandingFooter } from "../../components/landing/LandingClosing";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { createPilotRequest } from "../../lib/schools";
import {
  LayoutDashboard, FileText, Users, WifiOff, BadgeCheck, GraduationCap,
  ChevronDown, ArrowRight, Send,
} from "lucide-react";

const FEATURES = [
  { icon: LayoutDashboard, title: "Teacher Dashboard", desc: "Class heatmaps, weekly leaderboards and weak-topic cards — see exactly who needs help." },
  { icon: FileText, title: "Exam Generator", desc: "Build printable exams with answer keys from 400+ curriculum questions in minutes." },
  { icon: Users, title: "Parent Reports", desc: "One-page weekly reports per student: hours, accuracy, strengths, teacher notes." },
  { icon: WifiOff, title: "Offline Mode", desc: "Works on weak school WiFi and offline. Data syncs when connected." },
  { icon: BadgeCheck, title: "Bulk Licensing", desc: "One invoice, every student on Pro. Simple per-term pricing by school size." },
  { icon: GraduationCap, title: "On-site Training", desc: "We onboard your teachers and set up the first classes with you." },
];

const TIERS = [
  { name: "Starter", price: "₦150,000", per: "/term", students: "Up to 200 students", features: ["Teacher dashboard (3 classes)", "Exam generator", "Parent reports", "Email support"] },
  { name: "Standard", price: "₦300,000", per: "/term", students: "Up to 500 students", popular: true, features: ["Everything in Starter", "Unlimited classes", "Bulk Pro for all students", "On-site training", "Priority WhatsApp support"] },
  { name: "Premium", price: "₦500,000", per: "/term", students: "Up to 1,000 students", features: ["Everything in Standard", "Multi-campus support", "Custom exams & branding", "Termly performance review"] },
  { name: "Unlimited", price: "Custom", per: "", students: "1,000+ students / government", features: ["Everything in Premium", "Dedicated manager", "NDPR compliance pack", "Custom integrations"] },
];

const FAQS = [
  { q: "Does it work without internet?", a: "Yes. Questions, progress and core features work offline and sync when the connection returns — built for real school networks." },
  { q: "Can teachers set exams?", a: "Yes. The exam generator builds printable PDFs with answer keys from curriculum-tagged questions, saved per school for reuse." },
  { q: "Is student data safe?", a: "Data lives in Firebase (EU region) under NDPR-aligned policies. Teachers see only their own classes; students can export or delete their data anytime." },
  { q: "How does the free pilot work?", a: "Six weeks, one class, full features. We onboard your teachers and measure the results with you before you pay anything." },
  { q: "What devices work?", a: "Any Android phone, laptop or classroom computer with a browser. Classroom mode projects beautifully on any screen." },
  { q: "How do we pay?", a: "One invoice per term via bank transfer or Paystack. Receipts and compliance documentation included." },
];

export default function SchoolsLanding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState(null);
  const [pilot, setPilot] = useState({ school: "", contact: "", phone: "", students: "" });
  const [sending, setSending] = useState(false);

  async function submitPilot(e) {
    e.preventDefault();
    if (!pilot.school.trim() || !pilot.contact.trim() || !pilot.phone.trim()) {
      toast({ message: "Please fill school, contact name and phone", type: "warning" });
      return;
    }
    setSending(true);
    try {
      await createPilotRequest({ ...pilot, requestedBy: user?.uid || null, requestedEmail: user?.email || null });
      toast({ message: "Pilot request received! We'll reach out within 48 hours.", type: "success" });
      setPilot({ school: "", contact: "", phone: "", students: "" });
    } catch (err) {
      toast({ message: `Could not send request: ${err.message}`, type: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="landing-page">
      <LandingStyles />
      <LandingNav user={user} />

      {/* Hero */}
      <section style={{ padding: "160px 0 80px", background: "linear-gradient(180deg, rgb(var(--primary-rgb) / 0.08) 0%, var(--bg) 100%)", textAlign: "center" }}>
        <div className="lp-container">
          <h1 className="lp-animate-in" style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Bring ExamPadi to <span className="lp-gradient-text">Your School</span>
          </h1>
          <p className="lp-animate-in lp-delay-1 lp-sub" style={{ fontSize: 18 }}>
            70% of JAMB candidates score below 200. Give your teachers X-ray vision
            into every student's weak topics — and the tools to fix them.
          </p>
          <div className="lp-animate-in lp-delay-2" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
            <a href="#pilot" className="lp-btn-primary">Request a 6-Week Free Pilot <ArrowRight size={17} /></a>
            <Link to="/schools/signup" className="lp-btn-ghost">Register School</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-section" style={{ background: "var(--bg)" }}>
        <div className="lp-container">
          <h2 className="lp-h2" style={{ textAlign: "center", marginBottom: 48 }}>Everything a modern school <span className="lp-gradient-text">needs</span></h2>
          <div className="lp-bento-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`lp-bento-card lp-delay-${(i % 5) + 1}`}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgb(var(--primary-rgb) / 0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon size={26} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="lp-section" style={{ background: "var(--bg-2)" }}>
        <div className="lp-container">
          <h2 className="lp-h2" style={{ textAlign: "center", marginBottom: 8 }}>School <span className="lp-gradient-text">pricing</span></h2>
          <p className="lp-sub" style={{ textAlign: "center", marginBottom: 48 }}>One invoice per term. Every student on Pro.</p>
          <div className="lp-price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, alignItems: "stretch" }}>
            {TIERS.map((t) => (
              <div key={t.name} className="lp-bento-card" style={{
                borderColor: t.popular ? "rgb(var(--primary-rgb) / 0.6)" : undefined,
                display: "flex", flexDirection: "column",
              }}>
                {t.popular && <div style={{ fontSize: 10, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.08em", marginBottom: 6 }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{t.name}</h3>
                <div style={{ margin: "10px 0 2px" }}><span style={{ fontSize: 30, fontWeight: 900 }}>{t.price}</span><span style={{ fontSize: 13, color: "var(--text-muted)" }}>{t.per}</span></div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>{t.students}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  {t.features.map((f) => <li key={f} style={{ fontSize: 13, color: "var(--text)" }}>✓ {f}</li>)}
                </ul>
                <a href="#pilot" className={t.popular ? "lp-btn-primary" : "lp-btn-ghost"} style={{ padding: "12px", fontSize: 14, justifyContent: "center" }}>Start pilot</a>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 1000px) { .lp-price-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 640px) { .lp-price-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* Pilot form */}
      <section id="pilot" className="lp-section" style={{ background: "var(--bg)" }}>
        <div className="lp-container" style={{ maxWidth: 620 }}>
          <h2 className="lp-h2" style={{ textAlign: "center", marginBottom: 8 }}>Request a <span className="lp-gradient-text">free pilot</span></h2>
          <p className="lp-sub" style={{ textAlign: "center", marginBottom: 32 }}>Six weeks, one class, full features. We respond within 48 hours.</p>
          <form onSubmit={submitPilot} className="lp-glass" style={{ borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={pilot.school} onChange={(e) => setPilot({ ...pilot, school: e.target.value })} placeholder="School name" className="input-field" />
            <input value={pilot.contact} onChange={(e) => setPilot({ ...pilot, contact: e.target.value })} placeholder="Contact person (name)" className="input-field" />
            <input value={pilot.phone} onChange={(e) => setPilot({ ...pilot, phone: e.target.value })} placeholder="Phone / WhatsApp" className="input-field" />
            <input value={pilot.students} onChange={(e) => setPilot({ ...pilot, students: e.target.value })} placeholder="Approx. number of students (optional)" className="input-field" />
            <button type="submit" disabled={sending} className="lp-btn-primary" style={{ justifyContent: "center", border: "none", cursor: "pointer", opacity: sending ? 0.7 : 1 }}>
              {sending ? "Sending…" : <><Send size={16} /> Request pilot</>}
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section" style={{ background: "var(--bg-2)" }}>
        <div className="lp-container" style={{ maxWidth: 720 }}>
          <h2 className="lp-h2" style={{ textAlign: "center", marginBottom: 36 }}>School <span className="lp-gradient-text">questions</span></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((f, i) => (
              <div key={i} className={`lp-bento-card fold${openFaq === i ? " fold-open" : ""}`} style={{ padding: 0, cursor: "pointer" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="fold-header" style={{ padding: "20px 24px" }} role="button" tabIndex={0}
                  aria-expanded={openFaq === i}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenFaq(openFaq === i ? null : i); } }}
                >
                  <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{f.q}</h4>
                  <ChevronDown size={18} className="fold-chevron" />
                </div>
                <div className="fold-body">
                  <div>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 24px 20px" }}>{f.a}</p>
          </div>

          {/* Partner Plan — schools earn while they refer */}
          <div style={{ marginTop: 40, background: "linear-gradient(135deg, rgb(var(--primary-rgb) / 0.12), rgb(var(--accent-rgb) / 0.08))", border: "1px solid rgb(var(--primary-rgb) / 0.3)", borderRadius: 18, padding: "28px 32px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.08em", marginBottom: 6 }}>PARTNER PLAN — FREE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>Your school earns 20% on every student you refer</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, maxWidth: 520 }}>
                Share your school's referral link — when referred students buy Pro, IELTS, Classroom plans or AI credit packs, your school earns commission automatically. Rate rises to 25% after 100 paying referrals. The school itself pays ₦0 to join.
              </p>
            </div>
            <Link to={user ? "/schools/partner" : "/auth"} className="lp-btn-primary" style={{ padding: "14px 28px", fontSize: 15, whiteSpace: "nowrap" }}>
              {user ? "Open Partner Dashboard →" : "Register & start earning →"}
            </Link>
          </div>
        </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
