// src/pages/StatsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useStudy } from "../context/StudyContext";
import { getStudyTip } from "../groq";
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
  ArrowUpRight
} from "lucide-react";

const StatsPage = () => {
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const { history } = useStudy();
  const navigate = useNavigate();
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [advice, setAdvice] = useState([]);

  const proStatus = isPro();
  
  // Free users get basic analytics
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
          <h3 className="text-xl font-bold mb-4">Unlock Full Analytics</h3>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            Get detailed subject breakdown, AI-powered weak topic analysis, and personalized study tips with Pro.
          </p>
          <button onClick={() => navigate("/payment")} className="btn-primary px-8">
            Upgrade to Pro - ₦3,000/mo
          </button>
        </div>
      </div>
    );
  }

  const performance = [
    { subject: "English", score: 78, trend: "+5%", color: "text-primary", bg: "bg-primary/10" },
    { subject: "Mathematics", score: 62, trend: "-2%", color: "text-accent", bg: "bg-accent/10" },
    { subject: "Physics", score: 85, trend: "+12%", color: "text-primary", bg: "bg-primary/10" },
    { subject: "Chemistry", score: 45, trend: "0%", color: "text-danger", bg: "bg-danger/10" },
  ];

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const resp = await getStudyTip(
        "General",
        ["Quadratic Equations", "Organic Chemistry", "Concord in English"]
      );
      // Safely wrap string response into the expected array format to prevent crashes
      const formattedAdvice = typeof resp === 'string' ? [{ topic: "Study Advice", tips: [resp] }] : resp;
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

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Subject Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-black text-text flex items-center gap-3">
            <BarChart3 className="text-primary" size={24} />
            Subject Mastery
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="p-8 space-y-8">
              {performance.map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-lg">{item.subject}</h4>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                        Trend: {item.trend}
                      </span>
                    </div>
                    <div className="text-2xl font-black font-mono">{item.score}%</div>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.bg.replace('/10', '')} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.3)]`} 
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
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
          
          <div className="glass-card p-8 border-primary/20 bg-primary-dim space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles className="text-primary" size={48} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-text">Identify Your Blocker</h3>
              <p className="text-text-muted text-sm leading-relaxed">Let AI analyze your last 100 answers to find exactly where you're losing marks.</p>
            </div>

            <button 
              onClick={fetchAdvice}
              disabled={loadingAdvice}
              className="btn-primary w-full shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              {loadingAdvice ? <Loader2 className="animate-spin" size={24} /> : (
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

  // Calculate scores as percentages
  const scores = sessions.map(s => ({
    score: s.totalQuestions > 0 ? Math.round((s.correctAnswers / s.totalQuestions) * 100) : 0,
    date: new Date(s.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    subject: s.subjects?.[0] || "Mixed"
  }));

  const maxScore = 100;
  const width = 100;
  const height = 60;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Create SVG path for the line
  const points = scores.map((s, i) => {
    const x = padding + (i / Math.max(scores.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - (s.score / maxScore) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  // Create area fill path
  const areaPath = `M ${padding},${padding + chartHeight} ${points} L ${padding + chartWidth},${padding + chartHeight} Z`;

  return (
    <div className="space-y-6">
      <div className="relative h-48 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={padding + chartWidth} y2={padding} stroke="#333" strokeWidth="0.2" strokeDasharray="2" />
          <line x1={padding} y1={padding + chartHeight/2} x2={padding + chartWidth} y2={padding + chartHeight/2} stroke="#333" strokeWidth="0.2" strokeDasharray="2" />
          <line x1={padding} y1={padding + chartHeight} x2={padding + chartWidth} y2={padding + chartHeight} stroke="#333" strokeWidth="0.2" strokeDasharray="2" />
          
          {/* Area fill */}
          <path d={areaPath} fill="url(#scoreGradient)" opacity="0.3" />
          
          {/* Line */}
          <polyline 
            points={points} 
            fill="none" 
            stroke="#00E5A0" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Data points */}
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
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E5A0" />
              <stop offset="100%" stopColor="#00E5A0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Legend */}
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
