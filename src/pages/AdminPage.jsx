import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { isAdmin as _isAdmin, logActivity } from "../lib/activityLog";
const isAdmin = typeof _isAdmin === 'function' ? _isAdmin : () => false;
import { Shield, Users, Activity, BookOpen, Crown, ArrowLeft, RefreshCw, UserCheck, UserX, ChevronDown, Search, CrownIcon, Zap } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({ users: 0, sessions: 0, mockExams: 0, proUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [assignModal, setAssignModal] = useState(null);
  const [assignPlan, setAssignPlan] = useState("pro_monthly");
  const [assignDays, setAssignDays] = useState(30);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

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
      const users = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(logSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUsersList(users);
      setStats({
        users: users.length,
        sessions: sesSnap.size,
        mockExams: mockSnap.size,
        proUsers: users.filter(u => {
          const sub = u.subscription;
          if (sub?.status === "active" && sub.endDate) {
            const end = sub.endDate?.toDate ? sub.endDate.toDate() : new Date(sub.endDate);
            return end > new Date();
          }
          return false;
        }).length,
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

  function formatDateShort(ts) {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function getActionColor(action) {
    switch (action) {
      case "register": return "#4ADE80";
      case "login": return "#6C3CE9";
      case "logout": return "#FF4D6A";
      case "session_complete": return "#D4A853";
      case "payment": return "#FF9F43";
      case "admin_pro_grant": return "#D4A853";
      default: return "#888";
    }
  }

  function getUserSubStatus(u) {
    const sub = u.subscription;
    if (sub?.status === "active" && sub.endDate) {
      const end = sub.endDate?.toDate ? sub.endDate.toDate() : new Date(sub.endDate);
      if (end > new Date()) {
        const daysLeft = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
        return { label: "Pro", color: "#4ADE80", daysLeft };
      }
      return { label: "Expired", color: "#FF9F43" };
    }
    return { label: "Free", color: "#888" };
  }

  async function assignPro(targetUser) {
    setAssigning(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + assignDays);

      await updateDoc(doc(db, "users", targetUser.id), {
        subscription: {
          plan: assignPlan,
          status: "active",
          reference: `ADMIN-${user.uid}-${Date.now()}`,
          startDate: serverTimestamp(),
          endDate,
          autoRenew: false,
          grantedBy: user.uid,
          grantedByName: user.displayName || user.email,
        },
        plan: "pro",
        planExpiry: endDate.toISOString(),
      });

      logActivity({
        action: "admin_pro_grant",
        userId: user.uid,
        email: user.email,
        details: {
          targetUserId: targetUser.id,
          targetUserEmail: targetUser.email,
          plan: assignPlan,
          days: assignDays,
          endDate: endDate.toISOString(),
        },
      });

      showToast(`Pro access granted to ${targetUser.email || targetUser.name} for ${assignDays} days`, "success");
      setAssignModal(null);
      fetchData();
    } catch (e) {
      console.error("Assign pro error:", e);
      showToast("Failed to assign pro access", "error");
    }
    setAssigning(false);
  }

  async function revokePro(targetUser) {
    try {
      await updateDoc(doc(db, "users", targetUser.id), {
        subscription: { status: "revoked" },
        plan: null,
        planExpiry: null,
      });

      logActivity({
        action: "admin_pro_revoke",
        userId: user.uid,
        email: user.email,
        details: { targetUserId: targetUser.id, targetUserEmail: targetUser.email },
      });

      showToast(`Pro access revoked for ${targetUser.email || targetUser.name}`, "success");
      fetchData();
    } catch (e) {
      console.error("Revoke pro error:", e);
      showToast("Failed to revoke pro access", "error");
    }
  }

  function showToast(message, type = "info") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const filteredUsers = searchQuery
    ? usersList.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : usersList;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #1e1e2a", borderTopColor: "#6C3CE9", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: 24, fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "#1e1e2a", border: "none", color: "#888", padding: "10px 14px", borderRadius: 10, cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <Shield size={28} color="#6C3CE9" />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Management Console</h1>
              <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Manage users, assign Pro, monitor activity</p>
            </div>
          </div>
          <button onClick={fetchData} style={{ background: "#1e1e2a", border: "none", color: "#888", padding: "10px 14px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 13 }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Users", value: stats.users, icon: Users, color: "#6C3CE9" },
            { label: "Pro Users", value: stats.proUsers, icon: Crown, color: "#D4A853" },
            { label: "Practice Sessions", value: stats.sessions, icon: BookOpen, color: "#4ADE80" },
            { label: "Mock Exams", value: stats.mockExams, icon: Zap, color: "#FF9F43" },
            { label: "Activity Events", value: logs.length, icon: Activity, color: "#FF4D6A" },
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
            { id: "pro", label: `Pro Management (${stats.proUsers})` },
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

        {/* Search Bar */}
        {(activeTab === "users" || activeTab === "pro") && (
          <div style={{ marginBottom: 16, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#666" }} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "12px 16px 12px 40px", borderRadius: 12,
                background: "#121218", border: "1px solid #1e1e2a", color: "#fff",
                fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          </div>
        )}

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
                          {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
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
              Registered Users ({filteredUsers.length})
            </div>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#666", fontSize: 14 }}>No users found.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e1e2a" }}>
                      {["Name", "Email", "Exam", "Role", "Status", "Joined", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const subStatus = getUserSubStatus(u);
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid #1e1e2a" }}>
                          <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 600 }}>{u.name || "—"}</td>
                          <td style={{ padding: "12px 16px", color: "#888" }}>{u.email || "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(108,60,233,0.15)", color: "#6C3CE9", fontSize: 11, fontWeight: 600 }}>{u.exam || "—"}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 4, background: u.role === "admin" ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.05)", color: u.role === "admin" ? "#D4A853" : "#888", fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
                              {u.role || "user"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 4, background: `${subStatus.color}15`, color: subStatus.color, fontSize: 11, fontWeight: 600 }}>
                              {subStatus.label}{subStatus.daysLeft ? ` (${subStatus.daysLeft}d)` : ""}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#666", whiteSpace: "nowrap" }}>{formatDate(u.createdAt)}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <button
                              onClick={() => { setAssignModal(u); setAssignDays(30); setAssignPlan("pro_monthly"); }}
                              style={{
                                padding: "6px 14px", borderRadius: 8, border: "none",
                                background: subStatus.label === "Pro" ? "rgba(212,168,83,0.15)" : "rgba(74,222,128,0.15)",
                                color: subStatus.label === "Pro" ? "#D4A853" : "#4ADE80",
                                fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                transition: "all 0.2s",
                              }}
                            >
                              {subStatus.label === "Pro" ? "Manage" : "Grant Pro"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pro Management Tab */}
        {activeTab === "pro" && (
          <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid #1e1e2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>
                Pro Users ({filteredUsers.filter(u => getUserSubStatus(u).label === "Pro").length})
              </span>
            </div>
            {filteredUsers.filter(u => getUserSubStatus(u).label === "Pro").length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#666", fontSize: 14 }}>No active Pro users.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e1e2a" }}>
                      {["Name", "Email", "Plan", "Days Left", "Granted By", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter(u => getUserSubStatus(u).label === "Pro").map(u => {
                      const sub = u.subscription;
                      const end = sub?.endDate?.toDate ? sub.endDate.toDate() : sub?.endDate ? new Date(sub.endDate) : null;
                      const daysLeft = end ? Math.max(0, Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24))) : 0;
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid #1e1e2a" }}>
                          <td style={{ padding: "12px 16px", color: "#fff", fontWeight: 600 }}>{u.name || "—"}</td>
                          <td style={{ padding: "12px 16px", color: "#888" }}>{u.email || "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(212,168,83,0.15)", color: "#D4A853", fontSize: 11, fontWeight: 600 }}>
                              {sub?.plan || "—"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ color: daysLeft < 3 ? "#FF4D6A" : "#4ADE80", fontWeight: 600, fontSize: 13 }}>
                              {daysLeft}d
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#888", fontSize: 11 }}>
                            {sub?.grantedByName || "Paystack"}
                          </td>
                          <td style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
                            <button
                              onClick={() => { setAssignModal(u); setAssignDays(30); setAssignPlan("pro_monthly"); }}
                              style={{
                                padding: "6px 12px", borderRadius: 6, border: "none",
                                background: "rgba(108,60,233,0.15)", color: "#6C3CE9",
                                fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                              }}
                            >
                              Extend
                            </button>
                            <button
                              onClick={() => revokePro(u)}
                              style={{
                                padding: "6px 12px", borderRadius: 6, border: "none",
                                background: "rgba(255,77,106,0.15)", color: "#FF4D6A",
                                fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                              }}
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Pro Modal */}
      {assignModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease-out",
        }}>
          <div style={{
            background: "#0d0d12", borderRadius: 20, padding: 32, maxWidth: 420, width: "100%",
            border: "1px solid #1e1e2a", boxShadow: "0 24px 80px rgba(108,60,233,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Crown size={22} color="#D4A853" />
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Grant Pro Access</h2>
              </div>
              <button onClick={() => setAssignModal(null)} style={{ background: "#1a1a1f", border: "1px solid #333", color: "#888", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 16 }}>×</span>
              </button>
            </div>

            <div style={{ background: "#121218", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #1e1e2a" }}>
              <div style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>Granting to:</div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{assignModal.name || "Unknown"}</div>
              <div style={{ color: "#888", fontSize: 12 }}>{assignModal.email}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#888", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Plan</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "pro_monthly", label: "Monthly", days: 30 },
                  { id: "pro_yearly", label: "Yearly", days: 365 },
                  { id: "custom", label: "Custom" },
                ].map(p => (
                  <button key={p.id} onClick={() => { setAssignPlan(p.id); if (p.days) setAssignDays(p.days); }} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: assignPlan === p.id ? "#6C3CE9" : "#1a1a1f",
                    color: assignPlan === p.id ? "#fff" : "#888",
                    fontWeight: 600, fontSize: 12, fontFamily: "inherit", transition: "all 0.2s",
                  }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#888", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>Duration (days)</label>
              <input
                type="number"
                value={assignDays}
                onChange={e => setAssignDays(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: "#1a1a1f", border: "1px solid #333", color: "#fff",
                  fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAssignModal(null)} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #333",
                background: "transparent", color: "#888", fontWeight: 600, fontSize: 14,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Cancel
              </button>
              <button onClick={() => assignPro(assignModal)} disabled={assigning} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #6C3CE9, #D4A853)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: assigning ? "not-allowed" : "pointer",
                opacity: assigning ? 0.7 : 1, fontFamily: "inherit",
              }}>
                {assigning ? "Granting..." : `Grant Pro (${assignDays}d)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 10000,
          padding: "14px 20px", borderRadius: 12,
          background: toast.type === "success" ? "rgba(74,222,128,0.15)" : "rgba(255,77,106,0.15)",
          border: `1px solid ${toast.type === "success" ? "rgba(74,222,128,0.3)" : "rgba(255,77,106,0.3)"}`,
          color: toast.type === "success" ? "#4ADE80" : "#FF4D6A",
          fontWeight: 600, fontSize: 13, animation: "fadeIn 0.3s ease-out",
          backdropFilter: "blur(12px)",
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
