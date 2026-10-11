// Community feed: top students + public help board.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import {
  postHelpRequest, subscribeHelpRequests, replyToRequest,
  subscribeReplies, resolveRequest, getTopStudents,
} from "../lib/discussions";
import AvatarDisplay from "../components/Avatar/AvatarDisplay";
import { Trophy, MessageCircle, CheckCircle2, Send, ChevronDown, Sparkles } from "lucide-react";
import { JAMB_SUBJECTS } from "../data/subjects";

function ReplyThread({ request, user, userName }) {
  const [replies, setReplies] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeReplies(request.id, setReplies);
    return () => unsub && unsub();
  }, [open, request.id]);

  async function send() {
    try {
      await replyToRequest(request.id, { uid: user.uid, name: userName, text });
      setText("");
    } catch (e) {
      toast({ message: e.message || "Could not reply", type: "error" });
    }
  }

  async function resolve() {
    try {
      await resolveRequest(request.id, user.uid);
      toast({ message: "Marked as resolved ✓", type: "success" });
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  return (
    <div className="glass-card p-4">
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
        <AvatarDisplay profile={{ name: request.name }} size={32} radius={16} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{request.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {request.subject}{request.topic ? ` · ${request.topic}` : ""} · {request.replyCount || 0} repl{request.replyCount === 1 ? "y" : "ies"}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase",
          background: request.status === "resolved" ? "rgb(var(--success-rgb) / 0.12)" : "rgb(var(--accent-rgb) / 0.14)",
          color: request.status === "resolved" ? "var(--success)" : "var(--accent)",
        }}>
          {request.status === "resolved" ? "Solved ✓" : "Open"}
        </span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 10px" }}>{request.text}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setOpen((o) => !o)} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
          <MessageCircle size={14} /> {open ? "Hide" : "Discuss"} <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </button>
        {request.uid === user?.uid && request.status !== "resolved" && (
          <button onClick={resolve} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13 }}>
            <CheckCircle2 size={14} /> Resolved
          </button>
        )}
        <Link to={`/u/${request.uid}`} style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "var(--primary)", alignSelf: "center" }}>Profile →</Link>
      </div>
      {open && (
        <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {replies.map((r) => (
            <div key={r.id} style={{ background: "var(--bg-3)", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)" }}>{r.name}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>{r.text}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Write a helpful reply…" className="input-field flex-1" />
            <button onClick={send} className="btn-primary" style={{ padding: "10px 16px" }}><Send size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [top, setTop] = useState([]);
  const [requests, setRequests] = useState([]);
  const [subject, setSubject] = useState("Physics");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    getTopStudents(10).then(setTop).catch(() => {});
    const unsub = subscribeHelpRequests(setRequests, 30);
    return () => unsub && unsub();
  }, []);

  async function post() {
    if (posting) return;
    setPosting(true);
    try {
      await postHelpRequest({
        uid: user.uid,
        name: user.displayName || "Student",
        subject, topic: topic.trim(), text: text.trim(),
      });
      setText("");
      setTopic("");
      toast({ message: "Help request posted — the community can now reply ✓", type: "success" });
    } catch (e) {
      toast({ message: e.message || "Could not post", type: "error" });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="page-content max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="h-1">Community feed</h1>
        <p className="lead">Top students, open questions, and help from people who just solved them.</p>
      </header>

      {/* Top students */}
      <section>
        <h2 className="font-black text-text mb-3 flex items-center gap-2"><Trophy size={18} className="text-accent" /> Top students this week</h2>
        {top.length === 0 ? (
          <p className="text-sm text-text-muted">No public profiles yet — be the first! Turn on “Public profile” in Settings → Profile.</p>
        ) : (
          <div className="grid-auto">
            {top.map((s, i) => (
              <div key={s.uid} className="glass-card p-4 flex items-center gap-3">
                <span style={{ fontWeight: 900, color: "var(--text-muted)", width: 26 }}>#{i + 1}</span>
                <AvatarDisplay profile={s} user={{ displayName: s.name, photoURL: s.photoURL }} size={40} radius={20} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || "Student"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>⚡ {(s.xp || 0).toLocaleString()} XP</div>
                </div>
                <Link to={`/u/${s.uid}`} className="btn-secondary" style={{ padding: "8px 14px", fontSize: 12 }}>View</Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ask for help */}
      <section className="glass-card p-5" style={{ borderColor: "rgb(var(--primary-rgb) / 0.35)" }}>
        <h2 className="font-black text-text mb-3 flex items-center gap-2"><Sparkles size={17} className="text-primary" /> Stuck? Ask the community</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" style={{ maxWidth: 220 }}>
            {JAMB_SUBJECTS.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (optional)" className="input-field flex-1" />
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
          placeholder='e.g. "I keep getting mole calculations wrong — how do you convert mass to moles?"'
          className="input-field" style={{ resize: "vertical", marginBottom: 10 }} />
        <button onClick={post} disabled={posting} className="btn-primary disabled:opacity-60">
          {posting ? "Posting…" : "Post help request"}
        </button>
      </section>

      {/* Help board */}
      <section className="space-y-3">
        <h2 className="font-black text-text">Open questions ({requests.filter((r) => r.status !== "resolved").length})</h2>
        {requests.length === 0 && <p className="text-sm text-text-muted">Nothing here yet — post the first question above 👆</p>}
        {requests.map((r) => (
          <ReplyThread key={r.id} request={r} user={user} userName={user?.displayName || "Student"} />
        ))}
      </section>
    </div>
  );
}
