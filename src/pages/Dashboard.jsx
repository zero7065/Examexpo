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
  Crown,
  Calendar
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
        <>
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
          
          {/* Empty State for New Users */}
          {(!user?.totalSessions || user.totalSessions === 0) && (
            <div className="glass-card p-8 text-center border-primary/20 bg-primary/5">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">Ready to Start Your Journey?</h3>
              <p className="text-text-muted mb-6 max-w-md mx-auto">
                Complete your first practice session to see your stats here. Choose a subject and begin practicing now!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/select" 
                  className="bg-primary text-bg px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  Start Practice
                </Link>
                <Link 
                  to="/past-questions" 
                  className="glass-card px-8 py-3 rounded-xl font-bold text-text hover:border-primary/30 transition-colors"
                >
                  Browse Questions
                </Link>
              </div>
            </div>
          )}
          
          {/* Exam Countdown */}
          {user?.examDate && (
            <div className="glass-card p-6 border-accent/20 bg-accent/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <Calendar size={28} className="text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-text-muted font-black uppercase tracking-widest mb-1">Exam Countdown</div>
                  <div className="text-2xl font-black text-text">
                    {(() => {
                      const examDate = new Date(user.examDate);
                      const today = new Date();
                      const diffTime = examDate - today;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      if (diffDays < 0) return "Exam passed";
                      if (diffDays === 0) return "Exam today!";
                      if (diffDays === 1) return "1 day to go";
                      return `${diffDays} days to go`;
                    })()}
                  </div>
                </div>
                <Link 
                  to="/study-plan" 
                  className="text-accent hover:underline text-sm font-bold"
                >
                  View Plan →
                </Link>
              </div>
            </div>
          )}
          
          {/* Community & Referral */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* WhatsApp Group */}
            <a 
              href="https://chat.whatsapp.com/example" 
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 border-green-500/20 bg-green-500/5 hover:border-green-500/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Join Study Group</h3>
                  <p className="text-xs text-text-muted">Connect with fellow students</p>
                </div>
              </div>
            </a>

            {/* Referral */}
            <button 
              onClick={() => {
                const referralCode = user?.id?.slice(-6) || "EXAMPADI";
                const shareText = `🎓 Join me on ExamPadi AI - the best JAMB & WAEC prep app! Use my link: https://exampadi.jadai.dev?ref=${referralCode}`;
                if (navigator.share) {
                  navigator.share({ text: shareText });
                } else {
                  navigator.clipboard.writeText(shareText);
                  toast({ message: "Referral link copied! Share with friends", type: "success" });
                }
              }}
              className="glass-card p-6 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Invite Friends</h3>
                  <p className="text-xs text-text-muted">Get 3 days Pro free</p>
                </div>
              </div>
            </button>
          </div>
        </>
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