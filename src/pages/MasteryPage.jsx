import { Link } from "react-router-dom";
import { Hash, BookText, Atom, Sparkles, TrendingUp, Target, Clock } from "lucide-react";

const subjectMastery = [
  {
    name: "Mathematics",
    icon: Hash,
    mastery: 72,
    topics: [
      { name: "Algebra", progress: 85 },
      { name: "Calculus", progress: 42 },
      { name: "Geometry", progress: 68 },
      { name: "Statistics", progress: 91 },
    ],
  },
  {
    name: "English Language",
    icon: BookText,
    mastery: 68,
    topics: [
      { name: "Grammar", progress: 75 },
      { name: "Comprehension", progress: 82 },
      { name: "Essay Writing", progress: 55 },
      { name: "Concord", progress: 60 },
    ],
  },
  {
    name: "Physics",
    icon: Atom,
    mastery: 58,
    topics: [
      { name: "Mechanics", progress: 65 },
      { name: "Waves & Optics", progress: 50 },
      { name: "Electromagnetism", progress: 45 },
      { name: "Thermodynamics", progress: 70 },
    ],
  },
];

const statusConfig = (progress) => {
  if (progress >= 80) return { color: "var(--success)", label: "Mastered" };
  if (progress >= 50) return { color: "#d4a040", label: "Proficient" };
  return { color: "var(--danger)", label: "Needs Work" };
};

export default function MasteryPage() {
  return (
    <div className="page-content space-y-8">
      <header className="animate-fade">
        <h1 className="text-3xl font-black tracking-tight">Topic Mastery</h1>
        <p className="text-text-muted mt-1">Your progress across all subjects</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjectMastery.map((s, si) => {
          const OverallIcon = s.mastery >= 70 ? Sparkles : s.mastery >= 50 ? TrendingUp : Target;
          return (
            <div
              key={s.name}
              className="glass-card p-5 space-y-4 animate-slide-up"
              style={{ animationDelay: `${si * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--primary-dim)" }}>
                    <s.icon size={20} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "var(--text)" }}>{s.name}</h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.topics.length} topics</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <OverallIcon size={16} style={{ color: "var(--primary)" }} />
                  <span className="font-black text-lg" style={{ color: "var(--primary)" }}>{s.mastery}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {s.topics.map((topic) => {
                  const status = statusConfig(topic.progress);
                  return (
                    <div key={topic.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium" style={{ color: "var(--text)" }}>{topic.name}</span>
                        <span className="text-xs font-semibold" style={{ color: status.color }}>{status.label}</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-3)" }}>
                        <div
                          className="h-full rounded-full animate-scale-in"
                          style={{
                            width: `${topic.progress}%`,
                            background: status.color,
                            animationDelay: `${0.3 + si * 0.1}s`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Clock size={14} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Last studied 2 days ago</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6 text-center space-y-4" style={{
        background: "linear-gradient(135deg, var(--primary), #047857)",
        border: "none"
      }}>
        <Sparkles size={32} className="mx-auto text-white" />
        <h2 className="text-xl font-bold text-white">AI-Powered Study Recommendations</h2>
        <p className="text-sm max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
          Based on your weakest topics, we recommend focusing on <strong className="text-white">Calculus</strong>, <strong className="text-white">Electromagnetism</strong>, and <strong className="text-white">Essay Writing</strong> this week.
        </p>
        <Link to="/study-plan" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-all active:scale-95 shadow-lg">
          View Study Plan
        </Link>
      </div>
    </div>
  );
}
