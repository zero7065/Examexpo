import { useState } from "react";
import { Sparkles, Megaphone, BookOpenCheck, Loader2, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { createAssignment, createAnnouncement, listAssignmentsForTeacher, listAnnouncementsForSchool } from "../../lib/teacherContent";
import { askGroq } from "../../lib/ai";

export default function TeacherTools({ schoolId, roster, classId }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("report");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [assignment, setAssignment] = useState({ title: "", subject: "", dueDate: "", topic: "" });
  const [announcement, setAnnouncement] = useState({ title: "", body: "" });
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const selectedStudents = roster.map((r) => r.uid);

  async function generateAIReport() {
    if (!roster.length) {
      toast({ message: "No students in this class yet", type: "warning" });
      return;
    }
    setAiLoading(true);
    setAiReport("");
    try {
      const summary = roster.map((r) => {
        const topics = Object.entries(r.topics).map(([t, v]) => `${t}: ${v.c}/${v.t} correct`).join(", ");
        return `${r.name} (XP: ${r.xp}, streak: ${r.streak}) — ${topics || "no activity yet"}`;
      }).join("\n");

      const result = await askGroq(
        "You are an expert teaching assistant. Analyze student performance data and give a concise report: 1) Class overview, 2) Top 3 weak topics across students, 3) 3 specific teaching recommendations, 4) Students needing individual attention. Keep it under 300 words. Use simple language.",
        `Class: ${classId}\nStudents:\n${summary}`,
        { maxTokens: 600 }
      );
      setAiReport(result);
    } catch (e) {
      toast({ message: `AI report failed: ${e.message}`, type: "error" });
    } finally {
      setAiLoading(false);
    }
  }

  async function loadAssignments() {
    try {
      const data = await listAssignmentsForTeacher(user.uid);
      setAssignments(data);
    } catch (e) {
      console.error("Failed to load assignments:", e);
    }
  }

  async function loadAnnouncements() {
    try {
      const data = await listAnnouncementsForSchool(schoolId);
      setAnnouncements(data);
    } catch (e) {
      console.error("Failed to load announcements:", e);
    }
  }

  async function handleCreateAssignment() {
    if (!assignment.title.trim() || !assignment.topic.trim()) {
      toast({ message: "Title and topic are required", type: "warning" });
      return;
    }
    try {
      await createAssignment({
        teacherId: user.uid,
        teacherName: user.displayName || user.email,
        title: assignment.title.trim(),
        questions: [],
        studentIds: selectedStudents,
        dueDate: assignment.dueDate || null,
        subject: assignment.subject.trim(),
      });
      toast({ message: "Assignment created", type: "success" });
      setAssignment({ title: "", subject: "", dueDate: "", topic: "" });
      await loadAssignments();
    } catch (e) {
      toast({ message: `Failed: ${e.message}`, type: "error" });
    }
  }

  async function handleCreateAnnouncement() {
    if (!announcement.title.trim() || !announcement.body.trim()) {
      toast({ message: "Title and body are required", type: "warning" });
      return;
    }
    try {
      await createAnnouncement({
        teacherId: user.uid,
        teacherName: user.displayName || user.email,
        title: announcement.title.trim(),
        body: announcement.body.trim(),
        targetStudentIds: [],
        schoolId,
      });
      toast({ message: "Announcement published", type: "success" });
      setAnnouncement({ title: "", body: "" });
      await loadAnnouncements();
    } catch (e) {
      toast({ message: `Failed: ${e.message}`, type: "error" });
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: "report", label: "AI Student Report", icon: Sparkles },
          { id: "assignments", label: "Assignments", icon: BookOpenCheck },
          { id: "announcements", label: "Announcements", icon: Megaphone },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "assignments") loadAssignments(); if (t.id === "announcements") loadAnnouncements(); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t.id ? "#6C3CE9" : "#1e1e2a", color: tab === t.id ? "#fff" : "#888", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "report" && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ color: "var(--text)", fontSize: 16, fontWeight: 700, margin: 0 }}>AI-Compiled Student Performance Report</h3>
            <button onClick={generateAIReport} disabled={aiLoading} style={{ padding: "8px 16px", borderRadius: 8, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: aiLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: aiLoading ? 0.6 : 1 }}>
              {aiLoading ? <Loader2 size={14} /> : <Sparkles size={14} />} Generate Report
            </button>
          </div>
          {aiReport && (
            <div style={{ padding: 16, borderRadius: 10, background: "rgba(108,60,233,0.08)", border: "1px solid rgba(108,60,233,0.2)", whiteSpace: "pre-wrap", color: "var(--text)", fontSize: 14, lineHeight: 1.7 }}>
              {aiReport}
            </div>
          )}
          {!aiReport && !aiLoading && (
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Click "Generate Report" to get an AI analysis of your students' performance, weak topics, and teaching recommendations.</p>
          )}
        </div>
      )}

      {tab === "assignments" && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ color: "var(--text)", fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Create Assignment</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input placeholder="Title (e.g., Week 5 Homework)" value={assignment.title} onChange={(e) => setAssignment({ ...assignment, title: e.target.value })} style={{ padding: "10px 14px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: "#fff", fontSize: 13, outline: "none" }} />
            <input placeholder="Subject" value={assignment.subject} onChange={(e) => setAssignment({ ...assignment, subject: e.target.value })} style={{ padding: "10px 14px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: "#fff", fontSize: 13, outline: "none" }} />
            <input placeholder="Topic to study" value={assignment.topic} onChange={(e) => setAssignment({ ...assignment, topic: e.target.value })} style={{ padding: "10px 14px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: "#fff", fontSize: 13, outline: "none" }} />
            <input type="date" value={assignment.dueDate} onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })} style={{ padding: "10px 14px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: "#fff", fontSize: 13, outline: "none" }} />
          </div>
          <button onClick={handleCreateAssignment} style={{ padding: "10px 20px", borderRadius: 8, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>Create Assignment</button>

          {assignments.length > 0 && (
            <div>
              <h4 style={{ color: "#888", fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>Previous Assignments</h4>
              {assignments.map((a) => (
                <div key={a.id} style={{ padding: 12, borderRadius: 8, background: "#1a1a1f", marginBottom: 8 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                  <div style={{ color: "#888", fontSize: 12 }}>{a.subject} · Due: {a.dueDate || "No deadline"} · {a.studentIds?.length || 0} students</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "announcements" && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ color: "var(--text)", fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Send Announcement</h3>
          <input placeholder="Title" value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: "#fff", fontSize: 13, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
          <textarea placeholder="Write your announcement…" value={announcement.body} onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: "#fff", fontSize: 13, outline: "none", marginBottom: 12, boxSizing: "border-box", resize: "vertical" }} />
          <button onClick={handleCreateAnnouncement} style={{ padding: "10px 20px", borderRadius: 8, background: "#6C3CE9", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <Send size={14} /> Publish to All Students
          </button>

          {announcements.length > 0 && (
            <div>
              <h4 style={{ color: "#888", fontSize: 13, fontWeight: 700, margin: "0 0 8px" }}>Previous Announcements</h4>
              {announcements.map((a) => (
                <div key={a.id} style={{ padding: 12, borderRadius: 8, background: "#1a1a1f", marginBottom: 8 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                  <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{a.body?.slice(0, 100)}…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
