import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useStudy } from "../context/StudyContext";
import { getStudyTip } from "../groq";
import { getAdaptiveQuestions, getRecommendation } from "../lib/adaptiveEngine";
import { getXpProfile, getHighscore, getDailyXp } from "../lib/xpSystem";
import { getAssignmentHistory } from "../lib/assignmentSystem";
import {
  BarChart3,
  TrendingUp,
  Target,
  Brain,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Trophy,
  Flame,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  Medal,
  Crown,
} from "lucide-react";
import { WhatsAppShareButton } from "../components/WhatsAppShare";

const SUBJECTS = ["English", "Mathematics", "Physics", "Chemistry"];

const DIFFICULTY_META = {
  easy: { label: "Beginner", color: "text-green-400", bg: "bg-green-400/10", icon: "🟢" },
  medium: { label: "Intermediate", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: "🟡" },
  hard: { label: "Advanced", color: "text-red-400", bg: "bg-red-400/10", icon: "🔴" },
};

const LEVEL_NAMES = [
  "Newcomer",
  "Learner",
  "Scholar",
  "Expert",
  "Master",
];

const StatsPage = () => {
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const { history } = useStudy();
  const navigate = useNavigate();
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [advice, setAdvice] = useState([]);

  const proStatus = isPro();

  const xpProfile = proStatus ? useMemo(() => getXpProfile(user?.uid || user?.id || "guest"), [user]) : null;
  const highscore = proStatus ? useMemo(() => getHighscore(user?.uid || user?.id || "guest"), [user]) : null;
  const dailyXp = proStatus ? useMemo(() => getDailyXp(user?.uid || user?.id || "guest"), [user]) : null;
  const recommendation = proStatus ? useMemo(() => getRecommendation(user?.uid || user?.id || "guest"), [user]) : null;
  const assignments = proStatus ? useMemo(() => getAssignmentHistory(user?.uid || user?.id || "guest"), [user]) : null;

  const levelProgress = useMemo(() => {
    if (!xpProfile) return 0;
    const thresholds = [
      { min: 0, max: 99 },
      { min: 100, max: 299 },
      { min: 300, max: 599 },
      { min: 600, max: 999 },
      { min: 1000, max: Infinity },
    ];
    const t = thresholds[xpProfile.level - 1] || thresholds[0];
    const range = t.max === Infinity ? 200 : t.max - t.min;
    const progress = xpProfile.totalXp - t.min;
    return Math.min(100, Math.round((progress / range) * 100));
  }, [xpProfile]);

  const subjectDifficulties = useMemo(() => {
    if (!user?.uid) return [];
    const uid = user.uid || user.id || "guest";
    return SUBJECTS.map((subject) => {
      const data = localStorage.getItem(`ep_adaptive_${uid}`);
      const all = data ? JSON.parse(data) : {};
      const perf = all[subject] || { difficulty: "easy", correctRate: 0, totalAttempts: 0 };
      return { subject, ...perf };
    });
  }, [user]);

  const overdueAssignments = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter(
      (a) =>
        (a.status === "pending" || a.status === "active") &&
        Date.now() > a.deadline
    );
  }, [assignments]);

  const completedAssignments = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter(
      (a) => a.status === "passed" || a.status === "failed"
    );
  }, [assignments]);

  if (!proStatus) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 animate-fade">
        <header>
          <h1 className="text-4xl font-black mb-2 text-text">Your Performance</h1>
          <p className="text-text-muted font-medium">Track your progress as you prepare for exams.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <StatsCard
            label="Total Questions"
            value={user?.totalQuestionsAnswered || 0}
            description="Questions answered so far"
            icon={<BookOpen className="text-primary" size={24} />}
          />
          <StatsCard
            label="Average Score"
            value={user?.totalQuestionsAnswered > 0 ? Math.round((user?.totalCorrect / user?.totalQuestionsAnswered) * 100) + "%" : "0%"}
            description="Your average performance"
            icon={<Target className="text-accent" size={24} />}
          />
          <StatsCard
            label="Study Streak"
            value={user?.streak || 0}
            description="Days in a row"
            icon={<TrendingUp className="text-accent" size={24} />}
          />
        </div>

        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Crown className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-black mb-2">Unlock Full Analytics</h3>
          <p className="text-text-muted mb-6 max-w-md mx-auto text-sm leading-relaxed">
            Get XP tracking, adaptive learning insights, brain maps, assignment history, and AI-powered analysis with Pro.
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs max-w-sm mx-auto mb-6">
              <div className="flex items-center gap-2 text-text-muted">
                <Zap size={14} className="text-yellow-400" /> XP & Leveling
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Brain size={14} className="text-primary" /> Brain Map
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <TrendingUp size={14} className="text-green-400" /> Score Trends
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <BarChart3 size={14} className="text-blue-400" /> Subject Mastery
              </div>
            </div>
            <button onClick={() => navigate("/payment")} className="btn-primary px-8">
              Upgrade to Pro — ₦3,000/mo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const performance = SUBJECTS.map((subject) => {
    const perf = subjectDifficulties.find((s) => s.subject === subject) || { correctRate: 0, difficulty: "easy" };
    const score = Math.round(perf.correctRate * 100);
    let trend = "0%";
    const historySessions = (history || []).filter((h) => h.subjects?.includes(subject));
    if (historySessions.length >= 2) {
      const recent = historySessions.slice(-2);
      const prev = recent[0].totalQuestions > 0 ? Math.round((recent[0].correctAnswers / recent[0].totalQuestions) * 100) : 0;
      const curr = recent[1].totalQuestions > 0 ? Math.round((recent[1].correctAnswers / recent[1].totalQuestions) * 100) : 0;
      const diff = curr - prev;
      trend = diff >= 0 ? `+${diff}%` : `${diff}%`;
    }
    return { subject, score, trend, difficulty: perf.difficulty, attempts: perf.totalAttempts };
  });

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const weakTopics = subjectDifficulties
        .filter((s) => s.correctRate < 0.6)
        .map((s) => s.subject);
      const resp = await getStudyTip(
        recommendation?.subject || "General",
        weakTopics.length > 0 ? weakTopics : ["Quadratic Equations", "Organic Chemistry", "Concord in English"]
      );
      const formattedAdvice = typeof resp === "string" ? [{ topic: "Study Advice", tips: [resp] }] : resp;
      setAdvice(formattedAdvice);
      toast({ message: "AI Study Advice Generated! 🧠", type: "success" });
    } catch (err) {
      toast({ message: "Could not generate AI advice.", type: "error" });
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12 animate-fade">
      <header>
        <h1 className="text-4xl font-black mb-2 text-text">Performance Analytics</h1>
        <p className="text-text-muted font-medium">Deep insights into your learning journey and subject mastery.</p>
      </header>

      {/* Overdue Alert */}
      {overdueAssignments.length > 0 && (
        <div className="glass-card p-4 border-danger/30 bg-danger/5 flex items-center gap-4">
          <AlertTriangle className="text-danger shrink-0" size={24} />
          <div>
            <p className="font-black text-sm text-danger">Overdue Assignment{overdueAssignments.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-text-muted">{overdueAssignments.length} assignment{overdueAssignments.length > 1 ? "s have" : " has"} passed the deadline.</p>
          </div>
        </div>
      )}

      {/* Top Overview Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatsCard
          label="Overall Accuracy"
          value={user?.totalQuestionsAnswered > 0 ? Math.round((user?.totalCorrect / user?.totalQuestionsAnswered) * 100) + "%" : "0%"}
          description="Based on all questions answered"
          icon={<Target className="text-primary" size={24} />}
        />
        <StatsCard
          label="Syllabus Coverage"
          value="42%"
          description="Focused practice on 12 key topics remaining."
          icon={<BookOpen className="text-accent" size={24} />}
        />
        <StatsCard
          label="Predicted JAMB Score"
          value={user?.totalQuestionsAnswered > 0 ? Math.min(400, Math.round((user?.totalCorrect / user?.totalQuestionsAnswered) * 400)) : "0"}
          description="Based on your current performance trends."
          icon={<TrendingUp className="text-blue-400" size={24} />}
        />
      </div>

      {/* XP Profile Card */}
      <div className="glass-card p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-text flex items-center gap-3">
            <Zap className="text-yellow-400" size={24} />
            XP Profile
          </h2>
          <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Level {xpProfile?.level || 1} — {LEVEL_NAMES[(xpProfile?.level || 1) - 1]}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">Total XP</p>
            <p className="text-3xl font-black font-mono text-yellow-400">{xpProfile?.totalXp || 0}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Trophy size={12} /> Highscore
            </p>
            <p className="text-3xl font-black font-mono text-accent">{highscore || 0}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Flame size={12} /> Today's XP
            </p>
            <p className="text-3xl font-black font-mono text-orange-400">{dailyXp || 0}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-black">
            <span className="text-text-muted">Level {xpProfile?.level || 1}</span>
            <span className="text-text-muted">Level {(xpProfile?.level || 1) + 1}</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.3)]"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-text-muted text-right">{levelProgress}% to next level</p>
        </div>
      </div>

      {/* Score History Chart */}
      {history && history.length > 0 && (
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-text flex items-center gap-3">
              <TrendingUp className="text-accent" size={24} />
              Score Trend (Last 10 Sessions)
            </h2>
          </div>
          <ScoreChart sessions={history.slice(-10)} />
        </div>
      )}

      {/* Share Progress */}
      <div className="glass-card p-8 text-center">
        <h2 className="text-xl font-black text-text mb-4">Share Your Progress</h2>
        <p className="text-text-muted text-sm mb-6">Let your friends know how you're doing!</p>
        <WhatsAppShareButton
          result={{
            streak: user?.streak,
            xp: user?.totalXP || user?.xp || xpProfile?.totalXp || 0,
            totalQuestionsAnswered: user?.totalQuestionsAnswered,
          }}
          type="progress"
          style={{ margin: "0 auto" }}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Subject Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-black text-text flex items-center gap-3">
            <BarChart3 className="text-primary" size={24} />
            Subject Mastery
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="p-8 space-y-8">
              {performance.map((item, i) => {
                const diffMeta = DIFFICULTY_META[item.difficulty] || DIFFICULTY_META.easy;
                return (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-bold text-lg">{item.subject}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.trend.startsWith("+") ? "text-success" : "text-danger"}`}>
                            Trend: {item.trend}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${diffMeta.color} ${diffMeta.bg} px-2 py-0.5 rounded-full`}>
                            {diffMeta.icon} {diffMeta.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono">{item.score}%</div>
                        <div className="text-[10px] text-text-muted">{item.attempts} attempts</div>
                      </div>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.score >= 70 ? "bg-primary" : item.score >= 40 ? "bg-yellow-400" : "bg-danger"} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white/5 p-6 text-center">
              <button className="text-primary text-sm font-black uppercase tracking-widest hover:underline">View All Subjects</button>
            </div>
          </div>
        </div>

        {/* AI Brain Area */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-text flex items-center gap-3">
            <Brain className="text-primary" size={24} />
            AI Weak Topic Lab
          </h2>

          <div className="glass-card p-8 border-primary/20 bg-primary-dim space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles className="text-primary" size={48} />
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <h3 className="text-xl font-black text-text">Smart Recommendation</h3>
              {recommendation?.subject ? (
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-bold text-primary">{recommendation.subject}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{recommendation.reason}</p>
                  <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${DIFFICULTY_META[recommendation.difficulty]?.color || "text-text-muted"} ${DIFFICULTY_META[recommendation.difficulty]?.bg || "bg-white/5"}`}>
                    {DIFFICULTY_META[recommendation.difficulty]?.label || recommendation.difficulty}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-text-muted">Complete some practice to get recommendations.</p>
              )}
            </div>

            {/* Brain Map */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-text uppercase tracking-widest">Your Brain Map</h3>
              <div className="space-y-2">
                {subjectDifficulties.map((s) => {
                  const rate = Math.round(s.correctRate * 100);
                  const isStrong = rate >= 70;
                  const isWeak = rate < 40;
                  return (
                    <div key={s.subject} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <span className={isStrong ? "text-green-400" : isWeak ? "text-red-400" : "text-yellow-400"}>
                        {isStrong ? <CheckCircle2 size={16} /> : isWeak ? <XCircle size={16} /> : <Target size={16} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold truncate">{s.subject}</span>
                          <span className={`text-[10px] font-black ${isStrong ? "text-green-400" : isWeak ? "text-red-400" : "text-yellow-400"}`}>
                            {rate}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isStrong ? "bg-green-400" : isWeak ? "bg-red-400" : "bg-yellow-400"}`}
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={fetchAdvice}
              disabled={loadingAdvice}
              className="btn-primary w-full shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              {loadingAdvice ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Sparkles size={20} />
                  Analyze My Weakness
                </>
              )}
            </button>

            {advice.length > 0 && (
              <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                {advice.map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2 text-danger font-black text-xs uppercase tracking-widest">
                      <AlertCircle size={14} /> {item.topic}
                    </div>
                    <ul className="space-y-2">
                      {item.tips.map((tip, ti) => (
                        <li key={ti} className="text-xs text-text-muted flex items-start gap-2 italic">
                          <ChevronRight size={12} className="text-primary shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment History */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black text-text flex items-center gap-3">
          <Medal className="text-primary" size={24} />
          Assignment History
        </h2>

        {completedAssignments.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Clock className="text-text-muted mx-auto mb-4" size={32} />
            <p className="text-text-muted font-medium">No assignments completed yet.</p>
            <p className="text-text-muted text-xs mt-2">Complete assignments to track your progress here.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Subject</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Score</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completedAssignments.slice().reverse().map((a) => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-sm">{a.subject}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-black font-mono text-lg">{a.score}%</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${a.status === "passed" ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                          {a.status === "passed" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {a.status === "passed" ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-text-muted">
                        {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {overdueAssignments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-danger flex items-center gap-2">
              <AlertTriangle size={14} /> Overdue
            </h3>
            {overdueAssignments.map((a) => (
              <div key={a.id} className="glass-card p-4 border-danger/20 bg-danger/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{a.subject}</p>
                  <p className="text-[10px] text-text-muted">Deadline passed</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                  Overdue
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ScoreChart = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        Complete some practice sessions to see your score trend!
      </div>
    );
  }

  const scores = sessions.map((s) => ({
    score: s.totalQuestions > 0 ? Math.round((s.correctAnswers / s.totalQuestions) * 100) : 0,
    date: new Date(s.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    subject: s.subjects?.[0] || "Mixed",
  }));

  const maxScore = 100;
  const width = 100;
  const height = 60;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = scores
    .map((s, i) => {
      const x = padding + (i / Math.max(scores.length - 1, 1)) * chartWidth;
      const y = padding + chartHeight - (s.score / maxScore) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `M ${padding},${padding + chartHeight} ${points} L ${padding + chartWidth},${padding + chartHeight} Z`;

  return (
    <div className="space-y-6">
      <div className="relative h-48 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <line x1={padding} y1={padding} x2={padding + chartWidth} y2={padding} stroke="#333" strokeWidth="0.2" strokeDasharray="2" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={padding + chartWidth} y2={padding + chartHeight / 2} stroke="#333" strokeWidth="0.2" strokeDasharray="2" />
          <line x1={padding} y1={padding + chartHeight} x2={padding + chartWidth} y2={padding + chartHeight} stroke="#333" strokeWidth="0.2" strokeDasharray="2" />

          <path d={areaPath} fill="url(#scoreGradient)" opacity="0.3" />

          <polyline
            points={points}
            fill="none"
            stroke="#00E5A0"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {scores.map((s, i) => {
            const x = padding + (i / Math.max(scores.length - 1, 1)) * chartWidth;
            const y = padding + chartHeight - (s.score / maxScore) * chartHeight;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="2" fill="#00E5A0" />
                <title>{`${s.subject}: ${s.score}%`}</title>
              </g>
            );
          })}

          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E5A0" />
              <stop offset="100%" stopColor="#00E5A0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {scores.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-xs text-text-muted">{s.date}</div>
            <div className="text-lg font-black text-text">{s.score}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, description, icon }) => (
  <div className="glass-card p-8 group hover:border-primary/30 transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-4xl font-black font-mono text-text">{value}</div>
    </div>
    <div className="space-y-1">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</h4>
      <p className="text-xs text-text-muted font-medium">{description}</p>
    </div>
  </div>
);

export default StatsPage;
