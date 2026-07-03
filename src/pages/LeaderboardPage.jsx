import { Link } from "react-router-dom";
import { Trophy, Crown, Medal, Award, Flame, TrendingUp, Target, Zap } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Chioma O.", xp: 2840, streak: 12, subjects: ["Mathematics", "Physics"], initials: "CO" },
  { rank: 2, name: "Emeka O.", xp: 2610, streak: 8, subjects: ["English", "Chemistry"], initials: "EO" },
  { rank: 3, name: "Amara K.", xp: 2450, streak: 5, subjects: ["Mathematics", "Biology"], initials: "AK" },
  { rank: 4, name: "Tega R.", xp: 2180, streak: 5, subjects: ["Mathematics", "English", "Physics"], initials: "TR" },
  { rank: 5, name: "Zainab B.", xp: 1950, streak: 3, subjects: ["English", "Literature"], initials: "ZB" },
  { rank: 6, name: "David A.", xp: 1720, streak: 2, subjects: ["Physics", "Chemistry"], initials: "DA" },
  { rank: 7, name: "Folake S.", xp: 1480, streak: 1, subjects: ["Biology", "Geography"], initials: "FS" },
];

const podiumColors = [
  { bg: "from-amber-400 to-amber-600", shadow: "shadow-amber-500/20", icon: Crown },
  { bg: "from-slate-300 to-slate-500", shadow: "shadow-slate-400/20", icon: Medal },
  { bg: "from-orange-400 to-orange-600", shadow: "shadow-orange-500/20", icon: Award },
];

export default function LeaderboardPage() {
  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <div className="page-content space-y-8">
      <header className="animate-fade">
        <h1 className="text-3xl font-black tracking-tight">Leaderboard</h1>
        <p className="text-text-muted mt-1">Top students ranked by XP this week</p>
      </header>

      <div className="grid grid-cols-3 gap-3 md:gap-4 items-end">
        {[top3[1], top3[0], top3[2]].map((entry, i) => {
          const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const pc = podiumColors[actualRank - 1];
          const podiumH = actualRank === 1 ? "h-36" : actualRank === 2 ? "h-28" : "h-24";
          const Icon = pc.icon;
          return (
            <div
              key={entry.rank}
              className="flex flex-col items-center gap-3 animate-scale-in"
              style={{ animationDelay: `${actualRank * 0.15}s` }}
            >
              <div className="text-center space-y-1">
                <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${pc.bg} flex items-center justify-center text-white font-bold text-lg shadow-lg ${pc.shadow}`}>
                  {entry.initials}
                </div>
                <p className="font-bold text-sm text-text">{entry.name}</p>
                <p className="text-xs font-medium text-text-muted">{entry.xp.toLocaleString()} XP</p>
              </div>
              <div className={`w-full rounded-t-2xl flex items-center justify-center ${podiumH}`}
                style={{ background: actualRank === 1
                  ? "linear-gradient(to top, rgba(245,158,11,0.15), transparent)"
                  : actualRank === 2
                  ? "linear-gradient(to top, rgba(148,163,184,0.15), transparent)"
                  : "linear-gradient(to top, rgba(251,146,60,0.15), transparent)"
                }}>
                <Icon className={`w-8 h-8 ${actualRank === 1 ? "text-amber-500" : actualRank === 2 ? "text-slate-400" : "text-orange-500"}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 stagger-enter">
        {rest.map((entry, idx) => (
          <div key={entry.rank} className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-8 text-center font-bold text-text-muted">#{entry.rank}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                {entry.initials}
              </div>
              <div>
                <p className="font-semibold text-text">{entry.name}</p>
                <div className="flex gap-1.5 mt-0.5 flex-wrap">
                  {entry.subjects.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--bg-3)", color: "var(--text-muted)" }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <Flame size={16} className="text-orange-400" />
                <span className="font-medium" style={{ color: "var(--text)" }}>{entry.streak}</span>
              </div>
              <span className="font-bold" style={{ color: "var(--primary)" }}>{entry.xp.toLocaleString()} XP</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 flex items-center justify-between" style={{ background: "var(--primary-dim)", borderColor: "var(--primary)" }}>
        <div className="flex items-center gap-3">
          <TrendingUp size={20} style={{ color: "var(--primary)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
            You're ranked <strong style={{ color: "var(--primary)" }}>#4</strong> — <span style={{ color: "var(--text-muted)" }}>340 XP away from the podium!</span>
          </p>
        </div>
        <Link to="/select" className="btn-primary text-sm py-2 px-4">Practice Now</Link>
      </div>
    </div>
  );
}
