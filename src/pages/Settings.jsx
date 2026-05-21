import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import { getUserProfile, updateUserProfile } from "../lib/userProfile";
import { useToast } from "../components/Toast";
import { doc, updateDoc, collection, getDocs, writeBatch, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { updateProfile } from "firebase/auth";
import ProUpgradeModal from "../components/ProUpgradeModal";
import { User, BookOpen, CreditCard, Bell, Sliders, AlertTriangle, LogOut, ChevronRight, Check, Pencil } from "lucide-react";

const SUBJECT_OPTIONS = ["English", "Maths", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature", "CRS", "Geography", "Commerce", "Accounting", "Further Maths", "Agricultural Science", "Technical Drawing", "Business Management"];
const EXAM_OPTIONS = ["JAMB", "WAEC", "NABTEB", "POST-UTME"];

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", padding: 2,
      background: value ? "#6C3CE9" : "#333", transition: "background 0.2s", position: "relative",
    }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "transform 0.2s", transform: value ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { isPro, daysLeft, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [preferences, setPreferences] = useState({ sessionLength: 10, questionOrder: "random", showHints: false, autoAdvance: false, dailyReminder: true, streakAlerts: true, newQuestions: true });
  const [showExamModal, setShowExamModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => { document.title = "Settings — ExamPadi AI"; }, []);

  useEffect(() => {
    if (user) getUserProfile(user.uid).then(p => {
      setProfile(p);
      setSelectedSubjects(p?.subjects || []);
      setNameInput(user.displayName || "");
      setTargetInput(String(p?.targetScore || 280));
      if (p?.preferences) setPreferences(p.preferences);
    }).catch(() => {});
  }, [user]);

  async function updateFirestore(data) {
    if (!user) return;
    try { await updateUserProfile(user.uid, data); } catch (e) { console.warn("Settings save error:", e); toast({ message: "Failed to save — check your connection", type: "error" }); }
  }

  function handleNameSave() {
    if (nameInput.trim() && user) { updateProfile(user, { displayName: nameInput.trim() }).then(() => updateFirestore({ name: nameInput.trim() })); }
    setEditingName(false);
  }

  function handleTargetSave(val) {
    const n = parseInt(val);
    setTargetInput(val);
    if (n < 150 || n > 400 || isNaN(n)) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateFirestore({ targetScore: n }), 800);
  }

  function handleSubjectToggle(subj) {
    const next = selectedSubjects.includes(subj) ? selectedSubjects.filter(s => s !== subj) : [...selectedSubjects, subj];
    setSelectedSubjects(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateFirestore({ subjects: next }), 1000);
  }

  function handlePref(key, val) {
    const next = { ...preferences, [key]: val };
    setPreferences(next);
    updateFirestore({ preferences: next });
  }

  async function handleResetProgress() {
    if (resetInput !== "RESET" || !user) return;
    try {
      const batch = writeBatch(db);
      const sesSnap = await getDocs(query(collection(db, "sessions"), where("userId", "==", user.uid)));
      sesSnap.forEach(d => batch.delete(d.ref));
      const mockSnap = await getDocs(query(collection(db, "mockExams"), where("userId", "==", user.uid)));
      mockSnap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await updateDoc(doc(db, "users", user.uid), { totalQuestionsAnswered: 0, totalXP: 0, totalSessions: 0, mockExamsCompleted: 0 });
      setShowResetConfirm(false);
      setResetInput("");
      window.location.reload();
    } catch (e) { console.warn("Reset error:", e); }
  }

  function handleLogout() { logout(); navigate("/auth"); }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff", padding: "24px 32px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 24px" }}>Settings</h1>

        {/* Profile */}
        <Section title="Profile">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#6C3CE9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
              onClick={() => alert("Profile photo coming soon")}>
              {user?.displayName?.[0] || "U"}
            </div>
            <div style={{ flex: 1 }}>
              {editingName ? (
                <input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)} onBlur={handleNameSave} onKeyDown={e => e.key === "Enter" && handleNameSave()} style={{ background: "#1a1a1f", border: "1px solid #333", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 16, fontWeight: 700, width: "100%", outline: "none", fontFamily: "inherit" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{user?.displayName || "Student"}</span>
                  <button onClick={() => setEditingName(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}><Pencil size={14} /></button>
                </div>
              )}
              <div style={{ fontSize: 13, color: "#666" }}>{user?.email}</div>
            </div>
          </div>
          <Row label="Exam" value={profile?.exam || "JAMB"} onClick={() => setShowExamModal(true)} />
          <Row label="Target Score" value={String(profile?.targetScore || 280)}>
            <input type="number" min={150} max={400} value={targetInput} onChange={e => handleTargetSave(e.target.value)} style={{ width: 80, background: "#1a1a1f", border: "1px solid #333", borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 13, textAlign: "center", outline: "none", fontFamily: "inherit" }} />
          </Row>
        </Section>

        {/* Subjects */}
        <Section title="Your Subjects">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SUBJECT_OPTIONS.map(s => {
              const sel = selectedSubjects.includes(s);
              return (
                <button key={s} onClick={() => handleSubjectToggle(s)} style={{ padding: "6px 14px", borderRadius: 8, border: sel ? "2px solid #6C3CE9" : "1px solid #333", background: sel ? "rgba(108,60,233,0.2)" : "#1a1a1f", color: sel ? "#fff" : "#888", fontWeight: sel ? 600 : 400, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                  {sel && <Check size={12} />} {s}
                </button>
              );
            })}
          </div>
          <p style={{ color: "#555", fontSize: 11, marginTop: 8 }}>Changes take effect on your next session</p>
        </Section>

        {/* Subscription */}
        <Section title="Subscription">
          {isPro ? (
            <>
              <Row label="Plan" value={`Pro ${profile?.subscription?.plan === "pro_yearly" ? "Yearly" : "Monthly"}`} />
              <Row label="Status" value={<span style={{ color: "#4ADE80", fontWeight: 600 }}>Active ✅</span>} />
              <Row label="Days Remaining" value={`${daysLeft} days`} />
              <button onClick={() => alert("To cancel, contact support@exampadi.com")} style={{ background: "none", border: "none", color: "#FF4D6A", fontSize: 13, cursor: "pointer", padding: "4px 0", fontFamily: "inherit" }}>Cancel Subscription</button>
            </>
          ) : (
            <>
              <Row label="Current Plan" value="Free" />
              <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
                <div>15 questions/day · 2 subjects · No AI Tutor</div>
              </div>
              <button onClick={() => setShowProModal(true)} style={{ padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg, #6C3CE9, #9B59B6)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Upgrade to Pro →
              </button>
            </>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <ToggleRow label="Daily study reminder" value={preferences.dailyReminder} onChange={v => handlePref("dailyReminder", v)} />
          <ToggleRow label="Streak alerts" value={preferences.streakAlerts} onChange={v => handlePref("streakAlerts", v)} />
          <ToggleRow label="New questions available" value={preferences.newQuestions} onChange={v => handlePref("newQuestions", v)} />
          <p style={{ color: "#555", fontSize: 11, marginTop: 8 }}>Push notifications require app install</p>
        </Section>

        {/* Study Preferences */}
        <Section title="Study Preferences">
          <Row label="Default session length">
            <select value={preferences.sessionLength} onChange={e => handlePref("sessionLength", parseInt(e.target.value))} style={{ background: "#1a1a1f", border: "1px solid #333", borderRadius: 6, color: "#fff", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
              {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </Row>
          <Row label="Question order">
            <select value={preferences.questionOrder} onChange={e => handlePref("questionOrder", e.target.value)} style={{ background: "#1a1a1f", border: "1px solid #333", borderRadius: 6, color: "#fff", padding: "6px 10px", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
              <option value="random">Random</option>
              <option value="newest">By Year (newest first)</option>
              <option value="difficulty">By Difficulty</option>
            </select>
          </Row>
          <ToggleRow label="Show hints by default" value={preferences.showHints} onChange={v => handlePref("showHints", v)} />
          <ToggleRow label="Auto-advance after answer" value={preferences.autoAdvance} onChange={v => handlePref("autoAdvance", v)} />
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" danger>
          <p style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 12 }}>These actions are irreversible.</p>
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)} style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", border: "1px solid #FF4D6A", color: "#FF4D6A", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
              Reset Progress
            </button>
          ) : (
            <div>
              <p style={{ color: "#FF6B6B", fontSize: 12, marginBottom: 8 }}>Type "RESET" to confirm:</p>
              <input value={resetInput} onChange={e => setResetInput(e.target.value)} placeholder="type RESET" style={{ background: "#1a1a1f", border: "1px solid #FF4D6A", borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 13, width: "100%", outline: "none", marginBottom: 8, fontFamily: "inherit" }} />
              <button disabled={resetInput !== "RESET"} onClick={handleResetProgress} style={{ padding: "8px 16px", borderRadius: 6, background: resetInput === "RESET" ? "#FF4D6A" : "#333", border: "none", color: "#fff", fontWeight: 600, cursor: resetInput === "RESET" ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: 12 }}>
                Confirm Reset
              </button>
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <button onClick={() => alert("Contact support@exampadi.com to delete your account")} style={{ background: "none", border: "none", color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
              Delete Account
            </button>
          </div>
        </Section>

        {/* Sign out */}
        <button onClick={handleLogout} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#1a1a1f", border: "1px solid #333", color: "#FF4D6A", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {/* Exam modal */}
      {showExamModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 20, padding: 24, maxWidth: 360, width: "90%" }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Select Exam Type</h3>
            {EXAM_OPTIONS.map(e => (
              <button key={e} onClick={() => { updateFirestore({ exam: e }); setShowExamModal(false); }} style={{ display: "block", width: "100%", padding: "10px 16px", borderRadius: 8, background: (profile?.exam || "JAMB") === e ? "rgba(108,60,233,0.2)" : "#1a1a1f", border: (profile?.exam || "JAMB") === e ? "1px solid #6C3CE9" : "1px solid #333", color: "#fff", cursor: "pointer", marginBottom: 8, textAlign: "left", fontFamily: "inherit", fontSize: 14 }}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
      <ProUpgradeModal open={showProModal} onClose={() => setShowProModal(false)} reason="mock" dismissible />
    </div>
  );
}

function Section({ title, children, danger }) {
  return (
    <div style={{ background: "#121218", border: danger ? "1px solid rgba(255,77,106,0.3)" : "1px solid #1e1e2a", borderRadius: 16, padding: 20, marginBottom: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: danger ? "#FF4D6A" : "#fff" }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, children, onClick }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a1a1f" }}>
      <span style={{ fontSize: 13, color: "#888" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {children || <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{value}</span>}
        {onClick && <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}><ChevronRight size={14} /></button>}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a1a1f" }}>
      <span style={{ fontSize: 13, color: "#fff" }}>{label}</span>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}