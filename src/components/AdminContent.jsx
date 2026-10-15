// Admin content panel: post updates, moderate reviews + study rooms, run surveys.
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import {
  postUpdate, deleteUpdate, upsertSurvey, getActiveSurvey,
  setReviewStatus, subscribeUpdates, subscribeReviewQueue,
} from "../lib/community";
import { subscribeRoomQueue, setRoomStatus, deleteRoom } from "../lib/rooms";
import { Megaphone, Star, BarChart3, Trash2, Check, X, Plus, Users } from "lucide-react";

const REVIEW_TABS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Live" },
  { id: "rejected", label: "Rejected" },
];

export default function AdminContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updates, setUpdates] = useState([]);
  const [reviewTab, setReviewTab] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [roomTab, setRoomTab] = useState("pending");
  const [rooms, setRooms] = useState([]);
  const [survey, setSurvey] = useState(null);
  const [uTitle, setUTitle] = useState("");
  const [uBody, setUBody] = useState("");
  const [uTag, setUTag] = useState("New");
  const [sQ, setSQ] = useState("");
  const [sOpts, setSOpts] = useState(["", "", "", ""]);

  useEffect(() => {
    const subs = [
      subscribeUpdates(setUpdates, 20),
      subscribeReviewQueue(reviewTab, setReviews, 40),
      subscribeRoomQueue(roomTab, setRooms, 40),
    ];
    getActiveSurvey().then(setSurvey).catch(() => setSurvey(null));
    return () => subs.forEach((u) => u && u());
  }, [reviewTab, roomTab]);

  async function publishUpdate() {
    try {
      await postUpdate({ title: uTitle, body: uBody, tag: uTag });
      setUTitle("");
      setUBody("");
      toast({ message: "Update published — online users see it instantly 🔔", type: "success" });
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  async function removeUpdate(id) {
    if (!window.confirm("Delete this update?")) return;
    try {
      await deleteUpdate(id);
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  async function modReview(id, status) {
    try {
      await setReviewStatus(id, status, user.uid, user.email);
      toast({ message: `Review ${status}${status === "approved" ? " — now live" : ""}`, type: "success" });
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  async function modRoom(code, status) {
    try {
      await setRoomStatus(code, status, user.uid, user.email);
      toast({ message: `Room ${code} ${status}`, type: "success" });
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  async function removeRoom(code) {
    if (!window.confirm(`Delete room ${code} permanently?`)) return;
    try {
      await deleteRoom(code, user.uid, user.email);
      toast({ message: `Room ${code} deleted`, type: "success" });
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  async function publishSurvey() {
    try {
      await upsertSurvey({ question: sQ, options: sOpts });
      setSQ("");
      setSOpts(["", "", "", ""]);
      toast({ message: "Survey live — users see it after ~1 week of usage", type: "success" });
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  function TabBar({ tabs, active, onChange }) {
    return (
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => onChange(t.id)}
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: active === t.id ? "#6C3CE9" : "transparent",
              border: `1px solid ${active === t.id ? "#6C3CE9" : "#2a2a36"}`,
              color: active === t.id ? "#fff" : "#888" }}>
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Updates */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Megaphone size={16} color="#6C3CE9" /> Post an update
        </h3>
        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={uTitle} onChange={(e) => setUTitle(e.target.value)} placeholder="Title — e.g. 50 new NECO questions live" className="input-field flex-1" maxLength={100} />
            <select value={uTag} onChange={(e) => setUTag(e.target.value)} className="input-field" style={{ maxWidth: 130 }}>
              {["New", "Fix", "Content", "Event", "Reminder"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <textarea value={uBody} onChange={(e) => setUBody(e.target.value)} rows={2} placeholder="What changed, in one or two sentences…" className="input-field" style={{ resize: "vertical" }} maxLength={1000} />
          <button onClick={publishUpdate} className="btn-primary" style={{ justifySelf: "start" }}><Plus size={15} /> Publish</button>
        </div>
        {updates.map((u) => (
          <div key={u.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e1e2a" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#6C3CE9", textTransform: "uppercase" }}>{u.tag}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{u.title}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{String(u.body).slice(0, 120)}</div>
            </div>
            <button onClick={() => removeUpdate(u.id)} style={{ background: "none", border: "none", color: "#FF4D6A", cursor: "pointer" }}><Trash2 size={15} /></button>
          </div>
        ))}
      </section>

      {/* Reviews moderation */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Star size={16} color="#D4A853" /> Review moderation
        </h3>
        <TabBar tabs={REVIEW_TABS} active={reviewTab} onChange={setReviewTab} />
        {reviewTab === "pending" && reviews.length === 0 && (
          <p style={{ fontSize: 13, color: "#666" }}>Queue clear — nothing awaiting approval.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {r.name} · {"★".repeat(r.rating || 5)} · <span style={{ color: "#666", fontWeight: 400, fontSize: 11 }}>{r.context || "community"}</span>
            </div>
            <div style={{ fontSize: 13, color: "#ccc", margin: "6px 0 10px" }}>{r.text}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {r.status !== "approved" && (
                <button onClick={() => modReview(r.id, "approved")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#4ADE80", border: "none", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  <Check size={13} /> Approve
                </button>
              )}
              {r.status === "approved" && (
                <button onClick={() => modReview(r.id, "pending")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid #D4A853", color: "#D4A853", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  Unpublish
                </button>
              )}
              {r.status !== "rejected" && (
                <button onClick={() => modReview(r.id, "rejected")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid #FF4D6A", color: "#FF4D6A", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  <X size={13} /> Reject
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Study rooms moderation */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={16} color="#00E5A0" /> Study rooms
        </h3>
        <TabBar
          tabs={[{ id: "pending", label: "Pending" }, { id: "approved", label: "Live" }]}
          active={roomTab} onChange={setRoomTab}
        />
        {roomTab === "pending" && rooms.length === 0 && (
          <p style={{ fontSize: 13, color: "#666" }}>No rooms awaiting approval.</p>
        )}
        {rooms.map((r) => (
          <div key={r.id} style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{r.code}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{r.exam} · {r.subject} · host {r.hostName} · {r.memberCount || 1} member(s)</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {r.status !== "approved" && (
                <button onClick={() => modRoom(r.code, "approved")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#4ADE80", border: "none", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  <Check size={13} /> Approve
                </button>
              )}
              {r.status === "approved" && (
                <button onClick={() => modRoom(r.code, "pending")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid #D4A853", color: "#D4A853", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  Unlist
                </button>
              )}
              <button onClick={() => removeRoom(r.code)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid #FF4D6A", color: "#FF4D6A", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Survey */}
      <section>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={16} color="#00E5A0" /> Survey {survey ? `(live: ${survey.totalVotes || 0} votes)` : "(none live)"}
        </h3>
        {survey && (
          <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{survey.question}</div>
            {(survey.options || []).map((o, i) => {
              const v = (survey.votes || {})[i] || 0;
              const pct = survey.totalVotes > 0 ? Math.round((v / survey.totalVotes) * 100) : 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, width: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#1e1e2a", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#00E5A0" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#888", width: 70 }}>{v} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        )}
        <input value={sQ} onChange={(e) => setSQ(e.target.value)} placeholder="Survey question…" className="input-field" style={{ marginBottom: 8 }} maxLength={200} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          {sOpts.map((o, i) => (
            <input key={i} value={o} onChange={(e) => setSOpts((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} className="input-field" maxLength={80} />
          ))}
        </div>
        <button onClick={publishSurvey} className="btn-secondary">Publish survey (replaces live one)</button>
      </section>
    </div>
  );
}
