import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../lib/userProfile";
import { useSubscription } from "../hooks/useSubscription";
import { checkQuestionLimit } from "../lib/usageTracker";
import ProUpgradeModal from "../components/ProUpgradeModal";
import {
  LayoutDashboard, BookOpen, GraduationCap, Brain, TrendingUp, Settings,
  LogOut, Target, Calendar, CheckCircle, Zap, Send, ChevronRight, Crown
} from "lucide-react";

const SUBJECT_ICONS = {
  English: "📖", Maths: "🔢", Physics: "⚛️", Chemistry: "🧪", Biology: "🧬",
  Economics: "💰", Government: "🏛️", Literature: "📚", CRS: "✝️", Geography: "🌍",
  Commerce: "📊", Accounting: "🧾", "Further Maths": "📐", "Agricultural Science": "🌾", "Technical Drawing": "📏",
  "Business Management": "💼",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isPro, daysLeft, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState({ used: 0, limit: 15 });

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const data = await getUserProfile(user.uid);
          setProfile(data);
          const ql = await checkQuestionLimit(user.uid);
          setQuestionsLeft(ql);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  function getScoreColor(score) {
    if (score < 200) return "#FF4D6A";
    if (score < 250) return "#FF9F43";
    if (score < 320) return "#00E5A0";
    return "#D4A853";
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        Loading...
      </div>
    );
  }

  const subjects = profile?.subjects || [];
  const exam = profile?.exam || "JAMB";
  const targetScore = profile?.targetScore || 280;
  const streak = profile?.streak || 0;
  const xp = profile?.xp || 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
        }
        @media (min-width: 769px) {
          .sidebar { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar" style={{
        width: 260,
        background: "#0d0d12",
        borderRight: "1px solid #1e1e2a",
        flexDirection: "column",
        padding: "24px 16px",
        position: "fixed",
        height: "100vh",
        display: "flex",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 8px" }}>
          <div style={{
            width: 36, height: 36, background: "linear-gradient(135deg, #6C3CE9, #D4A853)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18
          }}>
            E
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>ExamPadi</span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <NavItem icon={LayoutDashboard} label="Home" path="/dashboard" active={location.pathname === "/dashboard"} onClick={() => navigate("/dashboard")} />
          <NavItem icon={BookOpen} label="Practice" path="/practice" active={location.pathname === "/practice" || location.pathname === "/select"} onClick={() => navigate("/practice")} />
          <NavItem icon={GraduationCap} label="Mock Exam" path="/cbt" active={location.pathname === "/cbt"} onClick={() => navigate("/cbt")} />
          <NavItem icon={Brain} label="AI Tutor" path="/ai-tutor" active={location.pathname === "/ai-tutor"} onClick={() => navigate("/ai-tutor")} />
          <NavItem icon={TrendingUp} label="Progress" path="/stats" active={location.pathname === "/stats"} onClick={() => navigate("/stats")} />
          <NavItem icon={Settings} label="Settings" path="/profile" active={location.pathname === "/profile"} onClick={() => navigate("/profile")} />
        </nav>

          <div style={{ borderTop: "1px solid #1e1e2a", paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "0 8px" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: "#6C3CE9",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600
              }}>
                {user?.displayName?.[0] || "U"}
              </div>
              {isPro && (
                <div style={{
                  position: "absolute", top: -4, right: -4, width: 18, height: 18,
                  borderRadius: "50%", background: "linear-gradient(135deg, #D4A853, #B8933F)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: "#0a0a0f", border: "2px solid #0d0d12",
                }}>
                  P
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.displayName?.split(" ")[0] || "Student"}</div>
              <div style={{ fontSize: 12, color: "#D4A853", background: "rgba(212,168,83,0.1)", padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 2 }}>
                {exam}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              background: "transparent", border: "none", color: "#888", cursor: "pointer", borderRadius: 8, transition: "all 0.2s"
            }}
          >
            <LogOut size={18} /> <span style={{ fontSize: 14 }}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, marginLeft: 260, padding: "24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Pro Banner (free users only) */}
        {!isPro && (
          <div style={{
            background: "linear-gradient(90deg, #1a0a3a, #0d1a3a)", borderRadius: 16,
            padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center",
            justifyContent: "space-between", border: "1px solid #2a1a4a", position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#D4A853" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Crown size={20} color="#D4A853" />
              <div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                  🚀 You're on the Free plan
                </div>
                <div style={{ color: "#888", fontSize: 12 }}>Unlock everything with Pro</div>
              </div>
            </div>
            <button
              onClick={() => setShowProModal(true)}
              style={{
                background: "transparent", border: "1px solid #D4A853", color: "#D4A853",
                padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >
              Upgrade Now →
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
              {getGreeting()}, {user?.displayName?.split(" ")[0] || "Student"} 👋
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "#121218", border: "1px solid #1e1e2a", padding: "8px 16px", borderRadius: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔥</span> <span style={{ fontWeight: 600 }}>{streak} day streak</span>
            </div>
            <div style={{ background: "#121218", border: "1px solid #1e1e2a", padding: "8px 16px", borderRadius: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} color="#D4A853" /> <span style={{ fontWeight: 600 }}>{xp} XP</span>
            </div>
            {!isPro && (
              <div style={{
                background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)",
                padding: "8px 16px", borderRadius: 20, display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              }}
              onClick={() => setShowProModal(true)}>
                <div style={{ fontSize: 13, color: "#FF6B6B", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{questionsLeft.limit - questionsLeft.used} questions left</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
          <StatCard 
            icon={Target} 
            label="Target Score" 
            value={targetScore} 
            subtext={exam === "JAMB" ? "JAMB Score" : "Target Grade"}
            color="#6C3CE9"
          />
          <StatCard 
            icon={Calendar} 
            label="Days to Exam" 
            value="--" 
            subtext="Set exam date"
            color="#00E5A0"
          />
          <StatCard 
            icon={CheckCircle} 
            label="Questions Done" 
            value="0" 
            subtext="Keep going!"
            color="#D4A853"
          />
        </div>

        {/* Subject Cards */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Your Subjects</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
          {subjects.length === 0 ? (
             <p style={{ color: "#666" }}>No subjects selected. Go to settings to update.</p>
          ) : (
            subjects.map((subj) => (
              <div key={subj} style={{
                background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20,
                transition: "all 0.2s", cursor: "pointer",
                borderLeft: "4px solid #6C3CE9"
              }}
              onClick={() => navigate(`/practice?subject=${encodeURIComponent(subj)}`)}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(108,60,233,0.15)";
                e.currentTarget.style.borderColor = "#6C3CE9";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#1e1e2a";
              }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{SUBJECT_ICONS[subj] || "📚"}</span>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{subj}</span>
                  </div>
                </div>
                <div style={{ height: 6, background: "#1e1e2a", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ width: "0%", height: "100%", background: "#6C3CE9", borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#888" }}>
                  <span>0 questions done</span>
                  <button style={{ background: "none", border: "none", color: "#6C3CE9", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    Start <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Daily Challenge */}
        <div
          onClick={() => navigate("/practice")}
          style={{
            background: "linear-gradient(135deg, #1a0a3a 0%, #0d1a3a 100%)",
            borderRadius: 16, padding: 24, marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between",
            border: "1px solid #333", position: "relative", overflow: "hidden", cursor: "pointer"
          }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#D4A853" }} />
          <div>
            <div style={{ color: "#D4A853", fontWeight: 700, fontSize: 14, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} /> DAILY CHALLENGE
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 }}>10 mixed questions</div>
            <div style={{ color: "#888", fontSize: 13 }}>15 mins · 2x XP today</div>
          </div>
          <button style={{
            background: "transparent", border: "1px solid #D4A853", color: "#D4A853", padding: "10px 20px", borderRadius: 10, fontWeight: 600, cursor: "pointer"
          }}>
            Start Challenge →
          </button>
        </div>

        {/* AI Tutor & Recent Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <div
            onClick={() => navigate("/ai-tutor")}
            style={{ background: "#121218", border: "1px solid #6C3CE9", borderRadius: 16, padding: 24, cursor: "pointer" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Ask AI Tutor</h3>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Get instant explanations for any topic or question</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" placeholder="Ask anything... e.g. Explain Newton's 3rd law" readOnly style={{
                flex: 1, background: "#0a0a0f", border: "1px solid #333", borderRadius: 8, padding: "10px 12px", color: "#fff", outline: "none", fontSize: 13
              }} />
              <button style={{ background: "#6C3CE9", border: "none", borderRadius: 8, padding: "0 16px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Send size={16} />
              </button>
            </div>
          </div>

          <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 24, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
             <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
             <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>No activity yet</h3>
             <p style={{ color: "#666", fontSize: 13 }}>Start your first practice session!</p>
          </div>
        </div>

        </div>
      </div>

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal open={showProModal} onClose={() => setShowProModal(false)} dismissible />

      {/* Mobile Nav */}
      <div className="mobile-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d0d12", borderTop: "1px solid #1e1e2a",
        padding: "12px 24px", display: "flex", justifyContent: "space-around", zIndex: 100
      }}>
         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: location.pathname === "/dashboard" ? "#6C3CE9" : "#666" }}>
            <LayoutDashboard size={20} /> <span style={{ fontSize: 10, marginTop: 4 }}>Home</span>
         </div>
         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#666" }} onClick={() => navigate("/practice")}>
            <BookOpen size={20} /> <span style={{ fontSize: 10, marginTop: 4 }}>Practice</span>
         </div>
         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#666" }} onClick={() => navigate("/ai-tutor")}>
            <Brain size={20} /> <span style={{ fontSize: 10, marginTop: 4 }}>AI</span>
         </div>
         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#666" }} onClick={() => navigate("/profile")}>
            <Settings size={20} /> <span style={{ fontSize: 10, marginTop: 4 }}>Settings</span>
         </div>
      </div>

    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      background: active ? "rgba(108,60,233,0.1)" : "transparent",
      border: "none", borderRadius: 12, color: active ? "#fff" : "#888",
      cursor: "pointer", width: "100%", textAlign: "left", transition: "all 0.2s"
    }}>
      <Icon size={20} color={active ? "#6C3CE9" : "#888"} />
      <span style={{ fontWeight: active ? 600 : 500, fontSize: 14 }}>{label}</span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }) {
  return (
    <div style={{
      background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20,
      borderLeft: `4px solid ${color}`, display: "flex", flexDirection: "column", gap: 8
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 13 }}>
        <Icon size={16} color={color} /> {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#666" }}>{subtext}</div>
    </div>
  );
}