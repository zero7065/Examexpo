import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ImageCarousel from "../components/ImageCarousel";
import {
  BookOpen, Brain, GraduationCap, BarChart3, Trophy, Star, Zap, Users,
  Shield, ChevronRight, Menu, X, Check, ArrowRight, Sparkles, Target,
  Award, Clock, TrendingUp, MessageSquare, ChevronDown, Infinity
} from "lucide-react";

const features = [
  { icon: BookOpen, title: "Real Past Questions", description: "Thousands of JAMB, WAEC & NABTEB questions from 2014–2026 with detailed AI explanations.", color: "#5a7a5a" },
  { icon: Brain, title: "AI Tutor", description: "Get instant step-by-step explanations. Ask anything, anytime.", color: "#5a8a5a" },
  { icon: GraduationCap, title: "CBT Simulator", description: "Real exam environment with timed sessions and instant scoring.", color: "#8a7a5a" },
  { icon: TrendingUp, title: "Smart Analytics", description: "Track your strengths, weaknesses, and improvement over time.", color: "#7a8a5a" },
  { icon: Trophy, title: "Gamified Learning", description: "Earn XP, badges, and compete on leaderboards. Stay motivated.", color: "#9a6a5a" },
  { icon: Target, title: "Study Plans", description: "Personalized study schedules tailored to your exam date.", color: "#5a7a7a" },
];

const stats = [
  { value: "50K+", label: "Active Students" },
  { value: "15K+", label: "Practice Questions" },
  { value: "95%", label: "Pass Rate" },
  { value: "4.8★", label: "App Rating" },
];

const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    popular: false,
    features: ["15 questions/day", "Past questions (limited)", "Basic stats", "Community access"],
    cta: "Get Started",
    href: "/auth",
  },
  {
    name: "Pro Monthly",
    price: "₦2,500",
    period: "/month",
    popular: true,
    features: ["Unlimited questions", "All past questions", "AI Tutor access", "Mock exams", "Advanced analytics", "Study plans", "Priority support"],
    cta: "Go Pro",
    href: "/payment",
  },
  {
    name: "Pro Yearly",
    price: "₦15,000",
    period: "/year",
    popular: false,
    features: ["Everything in Pro Monthly", "2 months free", "Early feature access", "Premium badge"],
    cta: "Best Value",
    href: "/payment",
  },
];

const testimonials = [
  { name: "Chidera O.", text: "ExamPadi AI helped me score 320 in JAMB! The AI Tutor is a game-changer.", exam: "JAMB 2025", rating: 5 },
  { name: "Aisha B.", text: "I passed WAEC with 8 A's thanks to the CBT simulator. Felt like the real exam!", exam: "WAEC 2025", rating: 5 },
  { name: "Emeka N.", text: "The gamification keeps me studying daily. 150-day streak and counting!", exam: "NABTEB 2025", rating: 5 },
];

const faqs = [
  { q: "Is ExamPadi AI free?", a: "Yes! We have a generous free tier with 15 questions daily. Upgrade to Pro for unlimited access." },
  { q: "Which exams do you cover?", a: "JAMB, WAEC (SSCE & GCE), NABTEB, and POST-UTME with questions from 2014 to 2026." },
  { q: "How does the AI Tutor work?", a: "Our AI is trained on West African curriculum. Ask any question and get instant, accurate explanations." },
];

function CountUp({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * parseInt(end.replace(/[^0-9]/g, ""))));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} fill={i < rating ? "var(--lp-accent)" : "none"} color={i < rating ? "var(--lp-accent)" : "#d4d4d0"} />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          --lp-bg: #f4f4f0;
          --lp-surface: #ffffff;
          --lp-text: #1a1a1a;
          --lp-text-secondary: #6b6b6b;
          --lp-primary: #5a7a5a;
          --lp-primary-light: #7a9a6a;
          --lp-accent: #8a7a5a;
          --lp-border: #d4d4d0;
          --lp-gradient-1: linear-gradient(135deg, #5a7a5a, #7a9a6a);
          --lp-gradient-2: linear-gradient(135deg, #8a7a5a, #a0906a);
          --lp-gradient-3: linear-gradient(135deg, #5a8a5a, #7aaa7a);
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--lp-bg);
          color: var(--lp-text);
          overflow-x: hidden;
        }
        .landing-page * { box-sizing: border-box; }
        .lp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        @keyframes lpFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lpFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes lpPulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(90,122,90,0.3); }
          50% { box-shadow: 0 0 40px rgba(90,122,90,0.6); }
        }
        @keyframes lpShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .lp-animate-in { animation: lpFadeUp 0.6s ease forwards; opacity: 0; }
        .lp-delay-1 { animation-delay: 0.1s; }
        .lp-delay-2 { animation-delay: 0.2s; }
        .lp-delay-3 { animation-delay: 0.3s; }
        .lp-delay-4 { animation-delay: 0.4s; }
        .lp-delay-5 { animation-delay: 0.5s; }

        .lp-glass {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.3);
        }

        .lp-bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .lp-bento-wide { grid-column: span 2; }

        .lp-bento-card {
          background: var(--lp-surface);
          border: 1px solid var(--lp-border);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .lp-bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }

        .lp-gradient-text {
          background: var(--lp-gradient-1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-section { padding: 80px 0; }

        @media (max-width: 768px) {
          .lp-bento-grid { grid-template-columns: 1fr; }
          .lp-bento-wide { grid-column: span 1; }
          .lp-section { padding: 48px 0; }
          .lp-container { padding: 0 16px; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div className="lp-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--lp-gradient-1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#fff" }}>E</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--lp-text)" }}>
              ExamPadi <span style={{ color: "var(--lp-primary)" }}>AI</span>
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {["Features", "Pricing", "FAQ"].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  color: "var(--lp-text-secondary)", textDecoration: "none",
                  transition: "all 0.2s",
                }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(90,122,90,0.08)"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >{item}</a>
              ))}
            </div>
            {user ? (
              <Link to="/dashboard" className="lp-primary-btn" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 24px", borderRadius: 12,
                background: "var(--lp-gradient-1)", color: "#fff", fontWeight: 700, fontSize: 14,
                textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseOver={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
              >
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/auth" className="lp-primary-btn" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 24px", borderRadius: 12,
                background: "var(--lp-gradient-1)", color: "#fff", fontWeight: 700, fontSize: 14,
                textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseOver={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
              >
                Sign In <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        padding: "160px 0 80px",
        background: "linear-gradient(180deg, #eef4ea 0%, var(--lp-bg) 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -100, right: -100, width: 400, height: 400,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(90,122,90,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60, width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(138,122,90,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="lp-container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="lp-animate-in" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 16px 6px 6px", borderRadius: 100,
              background: "rgba(90,122,90,0.1)", border: "1px solid rgba(90,122,90,0.2)",
              marginBottom: 24, fontSize: 13, fontWeight: 600, color: "var(--lp-primary)",
            }}>
              <span style={{
                background: "var(--lp-gradient-1)", color: "#fff", padding: "2px 10px",
                borderRadius: 100, fontSize: 11, fontWeight: 700,
              }}>NEW</span>
              AI-Powered Exam Prep for West African Students
            </div>
            <h1 className="lp-animate-in lp-delay-1" style={{
              fontSize: 52, fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px",
              letterSpacing: "-0.03em",
            }}>
              Ace Your Exams with{" "}
              <span className="lp-gradient-text">AI-Powered</span> Precision
            </h1>
            <p className="lp-animate-in lp-delay-2" style={{
              fontSize: 18, lineHeight: 1.7, color: "var(--lp-text-secondary)", maxWidth: 560,
              margin: "0 auto 36px",
            }}>
              Practice real JAMB, WAEC & NABTEB past questions, get AI-driven explanations, 
              simulate CBT exams, and track your progress — all in one platform.
            </p>
            <div className="lp-animate-in lp-delay-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {user ? (
                <Link to="/dashboard" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "16px 32px", borderRadius: 14, fontSize: 16, fontWeight: 700,
                  background: "var(--lp-gradient-1)", color: "#fff", textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(90,122,90,0.3)",
                  transition: "all 0.2s",
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(90,122,90,0.4)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(90,122,90,0.3)"; }}
                >
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/auth" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "16px 32px", borderRadius: 14, fontSize: 16, fontWeight: 700,
                    background: "var(--lp-gradient-1)", color: "#fff", textDecoration: "none",
                    boxShadow: "0 8px 32px rgba(90,122,90,0.3)",
                    transition: "all 0.2s",
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(90,122,90,0.4)"; }}
                    onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(90,122,90,0.3)"; }}
                  >
                    Start Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/auth" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "16px 32px", borderRadius: 14, fontSize: 16, fontWeight: 700,
                    background: "var(--lp-surface)", color: "var(--lp-text)", textDecoration: "none",
                    border: "1px solid var(--lp-border)",
                    transition: "all 0.2s",
                  }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = "var(--lp-primary)"; e.currentTarget.style.background = "rgba(90,122,90,0.04)"; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = "var(--lp-border)"; e.currentTarget.style.background = "var(--lp-surface)"; }}
                  >
                    Learn More
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section style={{ padding: "40px 0", background: "var(--lp-surface)", borderBottom: "1px solid var(--lp-border)" }}>
        <div className="lp-container">
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
            textAlign: "center",
          }}>
            {stats.map((stat, i) => (
              <div key={stat.label} className={`lp-animate-in ${`lp-delay-${i + 1}`}`}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "var(--lp-primary)", marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 14, color: "var(--lp-text-secondary)", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES BENTO ─── */}
      <section id="features" className="lp-section" style={{ background: "var(--lp-bg)" }}>
        <div className="lp-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="lp-animate-in" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Everything You Need to <span className="lp-gradient-text">Excel</span>
            </h2>
            <p className="lp-animate-in lp-delay-1" style={{ fontSize: 16, color: "var(--lp-text-secondary)", maxWidth: 520, margin: "0 auto" }}>
              From past questions to AI tutoring — we've built the complete exam prep toolkit.
            </p>
          </div>
          <div className="lp-bento-grid">
            {features.slice(0, 2).map((f, i) => (
              <div key={f.title} className={`lp-bento-card lp-animate-in ${`lp-delay-${i + 1}`}`}
                onMouseOver={e => { e.currentTarget.style.borderColor = f.color + "44"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "var(--lp-border)"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.color + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon size={26} color={f.color} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--lp-text-secondary)", lineHeight: 1.6, margin: 0 }}>{f.description}</p>
              </div>
            ))}
            <div className="lp-bento-wide lp-animate-in lp-delay-3" style={{
              background: "var(--lp-gradient-1)", borderRadius: 20,
              padding: 32, color: "#fff", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>AI-Powered Learning at Your Fingertips</h3>
                <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 500, margin: "0 0 20px", lineHeight: 1.6 }}>
                  Our AI understands the West African curriculum. Ask questions, get explanations, 
                  and receive personalized study recommendations.
                </p>
                <Link to="/auth" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.2)",
                  color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none",
                  backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)",
                  transition: "all 0.2s",
                }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                >
                  Try AI Tutor <ArrowRight size={14} />
                </Link>
              </div>
              <div style={{
                position: "absolute", right: -20, top: -20, width: 200, height: 200,
                borderRadius: "50%", background: "rgba(255,255,255,0.08)",
                pointerEvents: "none",
              }} />
            </div>
            {features.slice(2).map((f, i) => (
              <div key={f.title} className={`lp-bento-card lp-animate-in ${`lp-delay-${i + 4}`}`}
                onMouseOver={e => { e.currentTarget.style.borderColor = f.color + "44"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "var(--lp-border)"; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.color + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon size={26} color={f.color} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--lp-text-secondary)", lineHeight: 1.6, margin: 0 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CAROUSEL SECTION ─── */}
      <section className="lp-section" style={{
        background: "linear-gradient(180deg, var(--lp-bg), #f0eaff, var(--lp-bg))",
      }}>
        <div className="lp-container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 className="lp-animate-in" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              See What's <span className="lp-gradient-text">Inside</span>
            </h2>
            <p className="lp-animate-in lp-delay-1" style={{ fontSize: 16, color: "var(--lp-text-secondary)", maxWidth: 500, margin: "0 auto" }}>
              Explore the features that help thousands of students pass their exams.
            </p>
          </div>
          <div className="lp-animate-in lp-delay-2">
            <ImageCarousel autoPlay={true} interval={4000} />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="lp-section" style={{ background: "var(--lp-surface)" }}>
        <div className="lp-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              How It <span className="lp-gradient-text">Works</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--lp-text-secondary)", maxWidth: 480, margin: "0 auto" }}>
              Start improving your grades in three simple steps.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { step: "01", title: "Create Account", desc: "Sign up free in 30 seconds. No credit card needed.", icon: Users },
              { step: "02", title: "Choose Your Exam", desc: "Select JAMB, WAEC, or NABTEB and pick your subjects.", icon: BookOpen },
              { step: "03", title: "Start Practicing", desc: "Answer questions, review AI explanations, and track your progress.", icon: Zap },
            ].map((item, i) => (
              <div key={item.step} className={`lp-bento-card lp-animate-in ${`lp-delay-${i + 1}`}`} style={{ textAlign: "center" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "var(--lp-gradient-1)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 900, margin: "0 auto 20px",
                  boxShadow: "0 8px 24px rgba(90,122,90,0.25)",
                }}>{item.step}</div>
                <item.icon size={28} color="var(--lp-primary)" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--lp-text-secondary)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="lp-section" style={{ background: "var(--lp-bg)" }}>
        <div className="lp-container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Loved by <span className="lp-gradient-text">Students</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--lp-text-secondary)" }}>
              Hear from students who aced their exams with ExamPadi AI.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={t.name} className={`lp-bento-card lp-animate-in ${`lp-delay-${i + 1}`}`}>
                <StarRating rating={t.rating} />
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--lp-text-secondary)", margin: "12px 0" }}>
                  "{t.text}"
                </p>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "var(--lp-primary)", fontWeight: 600 }}>{t.exam}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="lp-section" style={{ background: "linear-gradient(180deg, var(--lp-bg), #f0eaff)" }}>
        <div className="lp-container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Simple <span className="lp-gradient-text">Pricing</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--lp-text-secondary)" }}>
              Start free, upgrade when you need more power.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 960, margin: "0 auto" }}>
            {plans.map((plan, i) => (
              <div key={plan.name} className={`lp-animate-in ${`lp-delay-${i + 1}`}`} style={{
                background: plan.popular ? "var(--lp-gradient-1)" : "var(--lp-surface)",
                borderRadius: 20, padding: 32,
                border: plan.popular ? "none" : "1px solid var(--lp-border)",
                position: "relative", overflow: "hidden",
                transform: plan.popular ? "scale(1.05)" : "none",
                color: plan.popular ? "#fff" : "var(--lp-text)",
              }}>
                {plan.popular && (
                  <div style={{
                    position: "absolute", top: 16, right: -32,
                    background: "rgba(255,255,255,0.2)", color: "#fff",
                    padding: "4px 40px", fontSize: 11, fontWeight: 700,
                    transform: "rotate(45deg)",
                    backdropFilter: "blur(8px)",
                  }}>
                    POPULAR
                  </div>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>{plan.name}</h3>
                <div style={{ margin: "16px 0" }}>
                  <span style={{ fontSize: 36, fontWeight: 900 }}>{plan.price}</span>
                  <span style={{ fontSize: 14, opacity: 0.7 }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: 1.4 }}>
                      <Check size={16} style={{ flexShrink: 0, color: plan.popular ? "rgba(255,255,255,0.8)" : "var(--lp-primary)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} style={{
                  display: "block", textAlign: "center", padding: "14px", borderRadius: 12,
                  fontWeight: 700, fontSize: 14, textDecoration: "none",
                  background: plan.popular ? "rgba(255,255,255,0.2)" : "var(--lp-gradient-1)",
                  color: plan.popular ? "#fff" : "#fff",
                  border: plan.popular ? "1px solid rgba(255,255,255,0.15)" : "none",
                  transition: "all 0.2s",
                }}
                  onMouseOver={e => { e.currentTarget.style.opacity = "0.9"; }}
                  onMouseOut={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="lp-section" style={{ background: "var(--lp-surface)" }}>
        <div className="lp-container" style={{ maxWidth: 700 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Frequently Asked <span className="lp-gradient-text">Questions</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => (
              <div key={i} className={`lp-bento-card lp-animate-in ${`lp-delay-${i + 1}`}`} style={{ padding: "20px 24px", cursor: "pointer" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{faq.q}</h4>
                  <ChevronDown size={18} style={{
                    color: "var(--lp-text-secondary)",
                    transform: openFaq === i ? "rotate(180deg)" : "none",
                    transition: "transform 0.3s ease",
                    flexShrink: 0,
                  }} />
                </div>
                {openFaq === i && (
                  <p style={{ fontSize: 14, color: "var(--lp-text-secondary)", lineHeight: 1.7, margin: "12px 0 0" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="lp-section" style={{
        background: "var(--lp-gradient-1)",
        textAlign: "center", color: "#fff",
      }}>
        <div className="lp-container">
          <h2 className="lp-animate-in" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Ready to Ace Your Exams?
          </h2>
          <p className="lp-animate-in lp-delay-1" style={{ fontSize: 16, opacity: 0.85, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Join 50,000+ students already preparing smarter with ExamPadi AI. 
            Start free, upgrade when you're ready.
          </p>
          <div className="lp-animate-in lp-delay-2">
            {user ? (
              <Link to="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "16px 40px", borderRadius: 14, fontSize: 16, fontWeight: 700,
                background: "#fff", color: "var(--lp-primary)", textDecoration: "none",
                transition: "all 0.2s",
              }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/auth" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "16px 40px", borderRadius: 14, fontSize: 16, fontWeight: 700,
                background: "#fff", color: "var(--lp-primary)", textDecoration: "none",
                transition: "all 0.2s",
              }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Start Free Today <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        background: "#0f172a", color: "#94a3b8", padding: "48px 0 24px",
      }}>
        <div className="lp-container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--lp-gradient-1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#fff" }}>E</div>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
                  ExamPadi <span style={{ color: "#a78bfa" }}>AI</span>
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>
                The smartest way for West African students to prepare for JAMB, WAEC, NABTEB & POST-UTME exams.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Features", "Pricing", "FAQ"].map(item => (
                  <a key={item} href={`#${item.toLowerCase()}`} style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.color = "#fff"}
                    onMouseOut={e => e.currentTarget.style.color = "#94a3b8"}
                  >{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Support</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Help Center", "Contact", "Privacy", "Terms"].map(item => (
                  <Link key={item} to={`/${item.toLowerCase().replace(" ", "-")}`} style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.color = "#fff"}
                    onMouseOut={e => e.currentTarget.style.color = "#94a3b8"}
                  >{item}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Exams</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["JAMB", "WAEC", "NABTEB", "POST-UTME"].map(item => (
                  <span key={item} style={{ fontSize: 13 }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 20, textAlign: "center", fontSize: 12 }}>
            &copy; {new Date().getFullYear()} ExamPadi AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
