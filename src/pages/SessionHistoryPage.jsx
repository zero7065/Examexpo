import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { History, ChevronRight, Calendar, Clock, Target, BookOpen } from "lucide-react";

export default function SessionHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    async function fetchSessions() {
      if (!user) { setLoading(false); return; }
      try {
        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid),
          orderBy("completedAt", "desc"),
          limit(50)
        );
        const snap = await getDocs(q);
        const firestoreSessions = [];
        snap.forEach(d => firestoreSessions.push({ id: d.id, ...d.data() }));

        const savedSessions = localStorage.getItem(`ep-sessions-${user.uid}`);
        if (savedSessions) {
          try {
            const local = JSON.parse(savedSessions);
            const merged = [...firestoreSessions];
            local.forEach(ls => {
              if (!merged.find(m => m.completedAt === ls.completedAt)) {
                merged.push(ls);
              }
            });
            setSessions(merged);
          } catch { setSessions(firestoreSessions); }
        } else {
          setSessions(firestoreSessions);
        }
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
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ color: "#6C3CE9", fontWeight: 700, fontSize: 20 }}>Loading your history...</div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
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
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff", padding: "24px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Your Study History</h1>
        <p style={{ color: "#888", fontWeight: 500, marginBottom: 40 }}>Review all your practice sessions, track your progress over time</p>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>
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
      </div>
    </div>
  );
}
