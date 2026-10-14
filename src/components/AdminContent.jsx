// Admin content panel: post updates, moderate reviews, run surveys.
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import {
  postUpdate, listUpdates, deleteUpdate,
  upsertSurvey, getActiveSurvey,
} from "../lib/community";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { setReviewStatus } from "../lib/community";
import { Megaphone, Star, BarChart3, Trash2, Check, X, Plus } from "lucide-react";

export default function AdminContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updates, setUpdates] = useState([]);
  const [pending, setPending] = useState([]);
  const [survey, setSurvey] = useState(null);
  const [uTitle, setUTitle] = useState("");
  const [uBody, setUBody] = useState("");
  const [uTag, setUTag] = useState("New");
  const [sQ, setSQ] = useState("");
  const [sOpts, setSOpts] = useState(["", "", "", ""]);

  function load() {
    listUpdates(20).then(setUpdates).catch(() => {});
    getDocs(query(collection(db, "reviews"), where("status", "==", "pending"), limit(30)))
      .then((s) => setPending(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
    getActiveSurvey().then(setSurvey).catch(() => setSurvey(null));
  }

  useEffect(() => {
    let live = true;
    listUpdates(20).then((u) => { if (live) setUpdates(u); }).catch(() => {});
    getDocs(query(collection(db, "reviews"), where("status", "==", "pending"), limit(30)))
      .then((s) => { if (live) setPending(s.docs.map((d) => ({ id: d.id, ...d.data() }))); })
      .catch(() => {});
    getActiveSurvey().then((s) => { if (live) setSurvey(s); }).catch(() => { if (live) setSurvey(null); });
    return () => { live = false; };
  }, []);

  async function publishUpdate() {
    try {
      await postUpdate({ title: uTitle, body: uBody, tag: uTag });
      setUTitle("");
      setUBody("");
      toast({ message: "Update published — users see it in their notification panel 🔔", type: "success" });
      load();
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  async function removeUpdate(id) {
    if (!window.confirm("Delete this update?")) return;
    try {
      await deleteUpdate(id);
      load();
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  async function modReview(id, status) {
    try {
      await setReviewStatus(id, status, user.uid, user.email);
      setPending((p) => p.filter((r) => r.id !== id));
      toast({ message: `Review ${status}`, type: "success" });
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
      load();
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
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
          <Star size={16} color="#D4A853" /> Reviews awaiting check ({pending.length})
        </h3>
        {pending.length === 0 && <p style={{ fontSize: 13, color: "#666" }}>Queue clear — AI approved or posted nothing pending.</p>}
        {pending.map((r) => (
          <div key={r.id} style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name} · {"★".repeat(r.rating || 5)}</div>
            <div style={{ fontSize: 13, color: "#ccc", margin: "6px 0 10px" }}>{r.text}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => modReview(r.id, "approved")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#4ADE80", border: "none", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                <Check size={13} /> Approve
              </button>
              <button onClick={() => modReview(r.id, "rejected")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid #FF4D6A", color: "#FF4D6A", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                <X size={13} /> Reject
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
