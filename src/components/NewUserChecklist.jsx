import { useState, useEffect } from "react";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../lib/userProfile";
import { NEW_USER_CHECKLIST } from "../data/pageTours";

export default function NewUserChecklist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user) getUserProfile(user.uid).then(setProfile).catch(() => {});
  }, [user]);

  if (!profile || dismissed) return null;

  const completed = NEW_USER_CHECKLIST.filter((item) => item.done(profile)).length;
  const total = NEW_USER_CHECKLIST.length;
  const allDone = completed === total;

  if (allDone) return null;

  return (
    <div style={{ position: "fixed", bottom: 80, left: 16, zIndex: 60, width: 280, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Getting Started</span>
        <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12 }}>✕</button>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--bg-3)", marginBottom: 12, overflow: "hidden" }}>
        <div style={{ width: `${(completed / total) * 100}%`, height: "100%", background: "var(--primary)", borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      {NEW_USER_CHECKLIST.map((item) => {
        const done = item.done(profile);
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.page)}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            {done ? <CheckCircle size={14} color="#4ADE80" /> : <Circle size={14} color="var(--text-muted)" />}
            <span style={{ flex: 1, fontSize: 12, color: done ? "var(--text-muted)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>{item.label}</span>
            <ChevronRight size={12} color="var(--text-muted)" />
          </button>
        );
      })}
    </div>
  );
}
