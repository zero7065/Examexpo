// Notification panel: latest updates + reminders, with unread dot.
// Unread state tracked locally (last-seen update id).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeUpdates } from "../lib/community";
import { Bell, X, Megaphone } from "lucide-react";

const SEEN_KEY = "exampadi_updates_seen";

function getSeen() {
  try { return localStorage.getItem(SEEN_KEY) || ""; } catch { return ""; /* private mode */ }
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const unsub = subscribeUpdates(setUpdates, 10);
    return () => unsub && unsub();
  }, []);

  const unread = updates.length > 0 && updates[0].id !== getSeen();

  function markSeen() {
    if (updates.length > 0) {
      try { localStorage.setItem(SEEN_KEY, updates[0].id); } catch { /* private mode */ }
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) setTimeout(markSeen, 1500); }}
        title="Updates & reminders"
        style={{
          width: 40, height: 40, borderRadius: "50%", position: "relative",
          background: "var(--bg-2)", border: "1px solid var(--border)",
          color: "var(--text)", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Bell size={18} />
        {unread && (
          <span style={{
            position: "absolute", top: 6, right: 7, width: 10, height: 10,
            borderRadius: "50%", background: "var(--danger)", border: "2px solid var(--bg-2)",
          }} />
        )}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setOpen(false)} />
          <div className="glass-card" style={{
            position: "absolute", right: 0, top: 48, width: "min(360px, 86vw)", zIndex: 61,
            maxHeight: 420, overflowY: "auto", padding: 16,
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-text flex items-center gap-2"><Megaphone size={16} className="text-primary" /> What's new</h3>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
            </div>
            {updates.length === 0 ? (
              <p className="text-sm text-text-muted">No updates yet. New features, content drops and reminders land here. 🔔</p>
            ) : (
              <div className="space-y-3">
                {updates.map((u) => (
                  <div key={u.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)" }}>{u.tag || "New"}</span>
                    </div>
                    <div className="font-bold text-text text-sm">{u.title}</div>
                    <div className="text-sm text-text-muted" style={{ lineHeight: 1.55 }}>{u.body}</div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/settings" onClick={() => setOpen(false)} className="text-xs font-bold text-primary" style={{ display: "block", marginTop: 10 }}>
              Manage notification permission in Settings →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
