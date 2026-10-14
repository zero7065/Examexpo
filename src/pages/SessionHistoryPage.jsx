import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { History, ChevronRight, Calendar, Clock, Target, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { getAISessions } from "../lib/aiSessions";

export default function SessionHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [aiSessions, setAiSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [view, setView] = useState("sessions");

  useEffect(() => {
    async function fetchSessions() {
      if (!user) { setLoading(false); return; }
      try {
        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid),
          limit(50)
        );
        const snap = await getDocs(q);
        const firestoreSessions = [];
        snap.forEach(d => firestoreSessions.push({ id: d.id, ...d.data() }));
        firestoreSessions.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
        setSessions(firestoreSessions);
        getAISessions(user.uid).then(setAiSessions).catch(() => {});
      } catch { setSessions([]); }
      setLoading(false);
    }
    fetchSessions();
  }, [user]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#4ADE80";
    if (score >= 60) return "#6C3CE9";
    if (score >= 50) return "#D4A853";
    return "#FF4D6A";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ color: "#6C3CE9", fontWeight: 700, fontSize: 20 }}>Loading your history...</div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Inter', system-ui, sans-serif", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 500 }}>
          <div style={{ width: 80, height: 80, background: "rgba(255,255,255,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <History size={40} color="#888" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 16px" }}>No Sessions Yet</h2>
          <p style={{ color: "#888", marginBottom: 32, lineHeight: 1.5 }}>You haven't completed any practice sessions yet. Start your first session to build your history.</p>
          <button onClick={() => navigate("/select")} style={{ padding: "14px 32px", borderRadius: 12, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>
            Start Practicing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Inter', system-ui, sans-serif", color: "var(--text)" }} className="page-content">
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 800, marginBottom: 8 }}>Your Study History</h1>
        <p style={{ color: "#888", fontWeight: 500, marginBottom: 40 }}>Review all your practice sessions, track your progress over time</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { id: "sessions", label: "Practice Sessions", icon: BookOpen },
            { id: "ai", label: "AI Conversations", icon: MessageSquare },
            { id: "timeline", label: "Timeline", icon: TrendingUp },
          ].map((v) => {
            const Icon = v.icon;
            return (
              <button key={v.id} onClick={() => setView(v.id)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: view === v.id ? "#6C3CE9" : "#1e1e2a", color: view === v.id ? "#fff" : "#888", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={14} /> {v.label}
              </button>
            );
          })}
        </div>

        {view === "sessions" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
          {/* Sessions List */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <BookOpen size={24} color="#6C3CE9" />
              Past Sessions ({sessions.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sessions.map((session, i) => (
                <div key={i} onClick={() => setSelectedSession(session)}
                  style={{
                    background: "#121218", border: selectedSession === session ? "1px solid #6C3CE9" : "1px solid #1e1e2a",
                    borderRadius: 16, padding: 24, cursor: "pointer", transition: "border 0.2s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{session.exam || "Practice"} - {session.mode || "practice"}</div>
                      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#888" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={14} /> {formatDate(session.completedAt?.toDate?.() || session.completedAt || new Date().toISOString())}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={14} /> {formatTime(session.timeSpentSeconds || session.timeSeconds || 0)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 30, fontWeight: 800, color: getScoreColor(session.percentageScore || session.score || 0) }}>
                        {Math.round(session.percentageScore || session.score || 0)}%
                      </div>
                      <div style={{ fontSize: 11, color: "#888", fontWeight: 700 }}>
                        {session.correctAnswers || session.correct || 0}/{session.totalQuestions || session.total || 0} correct
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(session.subjects || []).slice(0, 3).map((s, j) => (
                        <span key={j} style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: "#888", fontSize: 11 }}>
                          {typeof s === "object" ? s.name || s.id : s}
                        </span>
                      ))}
                    </div>
                    <ChevronRight size={20} color="#888" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Details */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Session Details</h3>
            {selectedSession ? (
              <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 24 }}>
                <div style={{ textAlign: "center", borderBottom: "1px solid #1e1e2a", paddingBottom: 24, marginBottom: 24 }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: "#6C3CE9", marginBottom: 8 }}>
                    {Math.round(selectedSession.percentageScore || selectedSession.score || 0)}%
                  </div>
                  <div style={{ color: "#888", fontSize: 14 }}>
                    Score: {selectedSession.score || 0} / 400
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Questions", value: selectedSession.totalQuestions || selectedSession.total || 0 },
                    { label: "Correct", value: selectedSession.correctAnswers || selectedSession.correct || 0, color: "#4ADE80" },
                    { label: "Wrong", value: (selectedSession.totalQuestions || selectedSession.total || 0) - (selectedSession.correctAnswers || selectedSession.correct || 0), color: "#FF4D6A" },
                    { label: "Time Spent", value: formatTime(selectedSession.timeSpentSeconds || selectedSession.timeSeconds || 0) },
                  ].map((item, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                      <span style={{ color: "#888", fontSize: 13 }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.color || "#fff", fontSize: 13 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/result", { state: { result: selectedSession } })}
                  style={{ width: "100%", marginTop: 20, padding: "12px", borderRadius: 12, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
                  View Full Review
                </button>
              </div>
            ) : (
              <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 32, textAlign: "center" }}>
                <Target size={40} color="#888" style={{ opacity: 0.5, marginBottom: 16 }} />
                <p style={{ color: "#888", fontSize: 14 }}>Click on a session to see details</p>
              </div>
            )}
          </div>
        </div>
        )}

        {view === "ai" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <MessageSquare size={24} color="#6C3CE9" />
              AI Conversations ({aiSessions.length})
            </h2>
            {aiSessions.length === 0 ? (
              <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 32, textAlign: "center" }}>
                <MessageSquare size={40} color="#888" style={{ opacity: 0.5, marginBottom: 16 }} />
                <p style={{ color: "#888", fontSize: 14 }}>No AI conversations yet. Start chatting with the AI Tutor to build your history.</p>
                <button onClick={() => navigate("/ai-tutor")} style={{ marginTop: 16, padding: "12px 24px", borderRadius: 10, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
                  Open AI Tutor
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {aiSessions.map((s) => (
                  <div key={s.id} onClick={() => navigate("/ai-tutor", { state: { resumeSessionId: s.id } })}
                    style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 16, cursor: "pointer", transition: "border 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.border = "1px solid #6C3CE9"}
                    onMouseLeave={(e) => e.currentTarget.style.border = "1px solid #1e1e2a"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{s.title || s.subject || "AI Chat"}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>{s.messages?.length || 0} messages · {s.subject}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>{s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "timeline" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <TrendingUp size={24} color="#6C3CE9" />
              Learning Timeline
            </h2>
            {sessions.length === 0 ? (
              <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 32, textAlign: "center" }}>
                <p style={{ color: "#888", fontSize: 14 }}>Complete practice sessions to see your learning timeline.</p>
              </div>
            ) : (
              <div style={{ position: "relative", paddingLeft: 24 }}>
                <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: "#333" }} />
                {sessions.slice(0, 20).map((s, i) => {
                  const date = s.completedAt?.toDate?.() || (s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000) : new Date());
                  const score = Math.round(s.percentageScore || s.score || 0);
                  return (
                    <div key={i} style={{ position: "relative", marginBottom: 16, paddingLeft: 24 }}>
                      <div style={{ position: "absolute", left: -20, top: 4, width: 12, height: 12, borderRadius: "50%", background: score >= 80 ? "#4ADE80" : score >= 60 ? "#6C3CE9" : score >= 50 ? "#D4A853" : "#FF4D6A" }} />
                      <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 12, padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{s.exam || "Practice"} · {s.mode || "practice"}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(score) }}>{score}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
