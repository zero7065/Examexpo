import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Circle, Award, Brain, BarChart3, BookOpen, GraduationCap, Zap, Users, Star, TrendingUp, Trophy } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Real Past Questions 2014–2026",
    description: "Practice with thousands of actual JAMB, WAEC & NABTEB past questions. Every question comes with detailed AI-powered explanations.",
    icon: BookOpen,
    color: "#6C3CE9",
    bg: "linear-gradient(135deg, #1a0a3a, #2a1a5a)",
  },
  {
    id: 2,
    title: "AI Tutor — Your 24/7 Study Buddy",
    description: "Stuck on a topic? Ask the AI Tutor for instant, step-by-step explanations. It's like having a personal teacher in your pocket.",
    icon: Brain,
    color: "#00E5A0",
    bg: "linear-gradient(135deg, #0a2a1a, #0a3a2a)",
  },
  {
    id: 3,
    title: "CBT Simulator — Real Exam Feel",
    description: "Experience the actual Computer-Based Test environment. Timed sessions, real JAMB/WAEC interfaces, and instant scoring.",
    icon: GraduationCap,
    color: "#D4A853",
    bg: "linear-gradient(135deg, #2a1a0a, #3a2a0a)",
  },
  {
    id: 4,
    title: "Smart Progress Tracking",
    description: "Track your improvement with detailed analytics. Know your strengths, weaknesses, and exactly what to study next.",
    icon: TrendingUp,
    color: "#FF9F43",
    bg: "linear-gradient(135deg, #2a1a0a, #3a2a1a)",
  },
  {
    id: 5,
    title: "Compete & Earn Badges",
    description: "Stay motivated with daily streaks, XP points, leaderboards, and achievement badges. Turn studying into a game!",
    icon: Trophy,
    color: "#FF4D6A",
    bg: "linear-gradient(135deg, #2a0a1a, #3a1a2a)",
  },
  {
    id: 6,
    title: "Pro Features — Unlock Your Potential",
    description: "Go Pro for unlimited AI questions, mock exams, advanced analytics, study plans, and priority support.",
    icon: Star,
    color: "#D4A853",
    bg: "linear-gradient(135deg, #1a1a2a, #2a2a3a)",
  },
];

export default function ImageCarousel({ autoPlay = true, interval = 4000 }) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next]);

  const slide = slides[current];
  const IconComponent = slide.icon;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 900,
      margin: "0 auto",
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    }}>
      <div style={{
        background: slide.bg,
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 32px",
        textAlign: "center",
        position: "relative",
        transition: "background 0.6s ease",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.1,
          background: `radial-gradient(circle at 50% 50%, ${slide.color}44 0%, transparent 70%)`,
        }} />
        <div style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          background: `${slide.color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          border: `2px solid ${slide.color}44`,
          position: "relative",
        }}>
          <IconComponent size={48} color={slide.color} />
        </div>
        <h3 style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 16px",
          maxWidth: 500,
          lineHeight: 1.2,
        }}>{slide.title}</h3>
        <p style={{
          fontSize: 16,
          color: "#aaa",
          maxWidth: 550,
          lineHeight: 1.7,
          margin: 0,
        }}>{slide.description}</p>
        <div style={{
          display: "flex",
          gap: 12,
          marginTop: 32,
        }}>
          {["JAMB", "WAEC", "NABTEB", "POST-UTME"].map((exam) => (
            <span key={exam} style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: `${slide.color}22`,
              border: `1px solid ${slide.color}44`,
              color: slide.color,
              fontSize: 12,
              fontWeight: 600,
            }}>{exam}</span>
          ))}
        </div>
      </div>

      <button
        onClick={prev}
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          zIndex: 10,
          transition: "all 0.2s",
        }}
        onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)" }}
        onMouseOut={e => { e.currentTarget.style.background = "rgba(0,0,0,0.5)" }}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          zIndex: 10,
          transition: "all 0.2s",
        }}
        onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)" }}
        onMouseOut={e => { e.currentTarget.style.background = "rgba(0,0,0,0.5)" }}
      >
        <ChevronRight size={20} />
      </button>

      <div style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        zIndex: 10,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              background: i === current ? slide.color : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
