import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getUserProfile } from "../lib/userProfile";
import { useSubscription } from "../hooks/useSubscription";
import { checkQuestionLimit } from "../lib/usageTracker";
import { getQuestionsFromBank } from "../data/questionBank";
import { useNotifications } from "../hooks/useNotifications";
import { isAdmin } from "../lib/activityLog";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import ProUpgradeModal from "../components/ProUpgradeModal";
import ResumeBanner from "../components/ResumeBanner";
import NotificationPrompt from "../components/NotificationPrompt";
import {
  Target, Calendar, CheckCircle, Zap, Send, ChevronRight, Crown
} from "lucide-react";

const SUBJECT_ICONS = {
  English: "📖", Maths: "🔢", Physics: "⚛️", Chemistry: "🧪", Biology: "🧬",
  Economics: "💰", Government: "🏛️", Literature: "📚", CRS: "✝️", Geography: "🌍",
  Commerce: "📊", Accounting: "🧾", "Further Maths": "📐", "Agricultural Science": "🌾", "Technical Drawing": "📏",
  "Business Management": "💼",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isPro, daysLeft, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState({ used: 0, limit: 15 });
  const [subjectStats, setSubjectStats] = useState({});

  // Auto-redirect admin to admin panel
  useEffect(() => {
    if (user && isAdmin(user)) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const data = await getUserProfile(user.uid);
          setProfile(data);
          const ql = await checkQuestionLimit(user.uid);
          setQuestionsLeft(ql);

          const sessionsRef = collection(db, "sessions");
          const q = query(sessionsRef, where("userId", "==", user.uid));
          const snap = await getDocs(q);
          const stats = {};
          snap.docs.forEach(d => {
            const s = d.data();
            const subj = s.subject;
            if (subj) {
              if (!stats[subj]) stats[subj] = { done: 0, correct: 0 };
              stats[subj].done += s.total || 0;
              stats[subj].correct += s.correct || 0;
            }
          });
          setSubjectStats(stats);
        } catch (e) {
          console.error(e);
          toast({ message: "Failed to load profile data. Please refresh.", type: "error" });
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

  async function handleLogout() {
    try {
      await logout();
      navigate("/auth");
    } catch (e) {
      console.error("Logout failed:", e);
      toast({ message: "Failed to sign out. Please try again.", type: "error" });
    }
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
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px" }}>
        <ResumeBanner />
        <NotificationPrompt />

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
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
              onClick={() => {
  const qs = getQuestionsFromBank({ subject: subj, count: 10, exam: profile?.exam || "JAMB" });
  navigate("/practice", { state: { questions: qs, subject: subj, mode: "practice" } });
}}
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
                  <div style={{
                    width: subjectStats[subj] ? `${Math.min(100, Math.round((subjectStats[subj].correct / Math.max(subjectStats[subj].done, 1)) * 100))}%` : "0%",
                    height: "100%", background: "#6C3CE9", borderRadius: 3
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#888" }}>
                  <span>{subjectStats[subj]?.done || 0} questions done</span>
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
          onClick={() => navigate("/practice-select")}
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

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal open={showProModal} onClose={() => setShowProModal(false)} dismissible />

    </div>
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