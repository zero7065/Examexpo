// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ActivityToast from "../components/ActivityToast";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import DashboardCustomizer, { DEFAULT_WIDGETS } from "../components/DashboardCustomizer";
import WelcomeModal from "../components/WelcomeModal";
import ProGate from "../components/ProGate";
import { 
  BookOpen, 
  Zap, 
  History, 
  Target, 
  TrendingUp, 
  Settings, 
  ChevronRight, 
  Sparkles,
  Award,
  Crown
} from "lucide-react";

const Dashboard = () => {
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem("ep-dashboard-widgets");
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  const [counters, setCounters] = useState({ q: 0, s: 0 });

  useEffect(() => {
    const qInterval = setInterval(() => {
      setCounters(prev => ({
        ...prev,
        q: prev.q < (user?.totalQuestionsAnswered || 0) ? prev.q + 1 : prev.q
      }));
    }, 20);
    return () => clearInterval(qInterval);
  }, [user]);

  const avgScore = user?.totalQuestionsAnswered > 0 
    ? Math.round((user?.totalCorrect / user?.totalQuestionsAnswered) * 100) 
    : 0;
    
  const stats = [
    { id: "stats", label: "Questions Answered", value: counters.q, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: "streak", label: "Daily Streak", value: `${user?.streak || 0} Days`, icon: Zap, color: "text-accent", bg: "bg-accent/10" },
    { id: "avg", label: "Average Score", value: `${avgScore}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { id: "sessions", label: "Total Sessions", value: user?.totalSessions || 0, icon: History, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const visibleWidgets = widgets.filter(w => w.enabled).map(w => w.id);
  const proStatus = isPro();

  const handleClaimStreak = () => {
    toast({ 
      message: `🎉 Day ${user?.streak} Streak Claimed! +50 bonus questions added!`, 
      type: "success",
      duration: 8000 
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade">
      <WelcomeModal />
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            Hi, {user?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-text-muted font-medium flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            "Success is the sum of small efforts, repeated day in and day out."
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCustomizing(true)}
            className="p-3 bg-bg-2 border border-border rounded-xl text-text-muted hover:text-primary transition-colors"
          >
            <Settings size={20} />
          </button>
          {user?.plan === "free" && (
            <Link to="/payment" className="bg-accent/10 border border-accent/20 px-6 py-3 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                <Crown size={18} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-accent">Free Limit</div>
                <div className="text-sm font-bold text-text">0 / 30 Questions</div>
              </div>
            </Link>
          )}
        </div>
      </header>

      {visibleWidgets.includes("stats") && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-card p-6 group hover:border-primary/30 transition-all">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <div className="text-3xl font-black text-text mb-1 font-mono">{stat.value}</div>
                <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">{stat.label}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard 
              to="/select"
              title="Practice Mode"
              description="Master specific subjects at your own pace."
              icon={<BookOpen size={24} />}
              color="text-primary"
              bg="bg-primary/5"
              border="border-primary/20"
            />
            <ActionCard 
              to="/select?mode=cbt"
              title="CBT Simulator"
              description="Experience the real JAMB exam environment."
              icon={<Zap size={24} />}
              color="text-accent"
              bg="bg-accent/5"
              border="border-accent/20"
              isPro={proStatus}
            />
            <ActionCard 
              to="/past-questions"
              title="Past Questions"
              description="2014–2024 JAMB & WAEC past questions."
              icon={<History size={24} />}
              color="text-blue-400"
              bg="bg-blue-400/5"
              border="border-blue-400/20"
            />
            <ActionCard 
              to="/past-questions?mode=predictions"
              title="Likely Questions"
              description="AI analysis of likely upcoming exam topics."
              icon={<Sparkles size={24} />}
              color="text-purple-400"
              bg="bg-purple-400/5"
              border="border-purple-400/20"
              isPro={proStatus}
            />
          </div>

          {visibleWidgets.includes("recentSessions") && (
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" />
                  Recent Sessions
                </h3>
                <Link to="/stats" className="text-primary text-xs font-bold hover:underline">View Detailed Stats</Link>
              </div>
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-subtle rounded-full flex items-center justify-center mx-auto text-text-muted">
                  <History size={32} />
                </div>
                <p className="text-text-muted text-sm max-w-xs mx-auto">No recent practice sessions. Your progress will appear here as you study.</p>
                <Link to="/select" className="btn-secondary py-2 px-6 text-xs inline-block">Start Your First Session</Link>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {visibleWidgets.includes("streak") && (
            <div className="glass-card p-8 text-center space-y-6">
              <h3 className="font-black text-xs uppercase tracking-widest text-text-muted">7-Day Streak</h3>
              <div className="flex justify-between items-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const currentStreak = user?.streak || 0;
                  const isActive = i < currentStreak;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                        isActive ? 'bg-primary border-primary text-black' : 'border-border text-text-muted'
                      }`}>
                        {isActive ? '✓' : ''}
                      </div>
                      <span className="text-[10px] font-bold text-text-muted">{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="h-px bg-border"></div>
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {user?.streak > 0 
                    ? <>You're on a <span className="text-primary font-bold">{user.streak} day</span> streak! Keep going! 🔥</>
                    : <>Start your streak today! Complete a session to begin.</>
                  }
                </p>
                {user?.streak >= 3 && (
                  <button 
                    onClick={handleClaimStreak}
                    className="w-full py-3 bg-accent/20 border border-accent/40 text-accent font-bold rounded-xl text-sm hover:bg-accent/30 transition-all"
                  >
                    🎁 Claim Streak Rewards
                  </button>
                )}
              </div>
            </div>
          )}

          {visibleWidgets.includes("predictions") && (
            proStatus ? (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                    <Award size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight">Exam Target: 300+</h3>
                  <p className="text-indigo-100 text-xs leading-relaxed">Your personalized AI study plan and predicted topics for 2025.</p>
                  <button onClick={() => navigate("/study-plan")} className="bg-white text-indigo-900 w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                    View Study Plan
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <ProGate feature="AI Study Plan" />
              </div>
            )
          )}
        </div>
      </div>

      <DashboardCustomizer 
        isOpen={isCustomizing} 
        onClose={() => setIsCustomizing(false)} 
        onUpdate={setWidgets} 
      />

      <ActivityToast />
    </div>
  );
};

const ActionCard = ({ to, title, description, icon, color, bg, border, isPro }) => (
  <Link to={to} className={`glass-card p-6 border-2 border-transparent hover:${border} hover:${bg} transition-all group relative overflow-hidden`}>
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
      {title}
      {isPro && <span className="bg-accent/10 text-accent text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-accent/20">Pro</span>}
    </h3>
    <p className="text-text-muted text-sm leading-relaxed">{description}</p>
  </Link>
);

export default Dashboard;