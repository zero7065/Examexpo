import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { isAdmin, logActivity } from "../lib/activityLog";
import { Shield, Users, Activity, BookOpen, Crown, ArrowLeft, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({ users: 0, sessions: 0, mockExams: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user || !isAdmin(user)) { navigate("/dashboard"); return; }
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const [logSnap, userSnap, sesSnap, mockSnap] = await Promise.all([
        getDocs(query(collection(db, "activityLog"), orderBy("timestamp", "desc"), limit(100))),
        getDocs(query(collection(db, "users"), limit(200))),
        getDocs(query(collection(db, "sessions"), limit(200))),
        getDocs(query(collection(db, "mockExams"), limit(200))),
      ]);
      setLogs(logSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUsersList(userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats({
        users: userSnap.size,
        sessions: sesSnap.size,
        mockExams: mockSnap.size,
      });
    } catch (e) {
      console.error("Admin fetch error:", e);
    }
    setLoading(false);
  }

  function formatDate(ts) {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function getActionColor(action) {
    switch (action) {
      case "register": return "#4ADE80";
      case "login": return "#6C3CE9";
      case "logout": return "#FF4D6A";
      case "session_complete": return "#D4A853";
      case "payment": return "#FF9F43";
      default: return "#888";
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #1e1e2a", borderTopColor: "#6C3CE9", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: 24, fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "#1e1e2a", border: "none", color: "#888", padding: "10px 14px", borderRadius: 10, cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <Shield size={28} color="#6C3CE9" />
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Admin Panel</h1>
          </div>
          <button onClick={fetchData} style={{ background: "#1e1e2a", border: "none", color: "#888", padding: "10px 14px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 13 }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Users", value: stats.users, icon: Users, color: "#6C3CE9" },
            { label: "Practice Sessions", value: stats.sessions, icon: BookOpen, color: "#D4A853" },
            { label: "Mock Exams", value: stats.mockExams, icon: Crown, color: "#4ADE80" },
            { label: "Activity Events", value: logs.length, icon: Activity, color: "#FF9F43" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color={color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{value}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { id: "overview", label: "Activity Log" },
            { id: "users", label: `Users (${usersList.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tab.id ? "#6C3CE9" : "#1e1e2a",
              color: activeTab === tab.id ? "#fff" : "#888",
              fontWeight: 600, fontSize: 13, fontFamily: "inherit", transition: "all 0.2s"
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity Log Tab */}
        {activeTab === "overview" && (
          <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid #1e1e2a", fontSize: 14, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>
              Recent Activity
            </div>
            {logs.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#666", fontSize: 14 }}>No activity logged yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e1e2a" }}>
                      {["Action", "User", "Email", "Details", "Time"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} style={{ borderBottom: "1px solid #1e1e2a" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: 6, background: `${getActionColor(log.action)}15`, color: getActionColor(log.action), fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#ccc", fontWeight: 500 }}>{log.userId?.slice(0, 12)}...</td>
                        <td style={{ padding: "12px 16px", color: "#888" }}>{log.email || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "#888", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {log.details ? JSON.stringify(log.details).slice(0, 60) : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#666", whiteSpace: "nowrap" }}>{formatDate(log.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid #1e1e2a", fontSize: 14, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>
              Registered Users
            </div>
            {usersList.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#666", fontSize: 14 }}>No users registered yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e1e2a" }}>
                      {["Name", "Email", "Exam", "Subjects", "Role", "Onboarded", "Joined"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #1e1e2a" }}>
                        <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 600 }}>{u.name || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "#888" }}>{u.email || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(108,60,233,0.15)", color: "#6C3CE9", fontSize: 11, fontWeight: 600 }}>{u.exam || "—"}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#888" }}>{(u.subjects?.length || 0) + " subjects"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, background: u.role === "admin" ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.05)", color: u.role === "admin" ? "#D4A853" : "#888", fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
                            {u.role || "user"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ color: u.onboarded ? "#4ADE80" : "#FF4D6A", fontSize: 12 }}>
                            {u.onboarded ? "Yes" : "No"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#666", whiteSpace: "nowrap" }}>{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
