// Teacher exam generator: form → PDF (questions + answer key), archive + share.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { getUserProfile } from "../../lib/userProfile";
import { getSchool, saveGeneratedExam, listGeneratedExams } from "../../lib/schools";
import { pickExamQuestions, buildExamPdf, downloadPdf, pdfToFile } from "../../lib/examGenerator";
import { JAMB_SUBJECTS } from "../../data/subjects";
import { ArrowLeft, Download, Share2, Loader2, FileText } from "lucide-react";

export default function ExamGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [school, setSchool] = useState(null);
  const [form, setForm] = useState({ subject: "Physics", topics: "", count: 20, timeLimit: "1 hour", examBody: "JAMB" });
  const [preview, setPreview] = useState([]);
  const [busy, setBusy] = useState(false);
  const [archive, setArchive] = useState([]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((p) => {
        setProfile(p);
        if (p?.schoolId) {
          getSchool(p.schoolId).then(setSchool).catch(() => {});
          listGeneratedExams(p.schoolId).then(setArchive).catch(() => {});
        }
      }).catch(() => {});
    }
  }, [user]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handlePreview() {
    const topics = form.topics.split(",").map((t) => t.trim()).filter(Boolean);
    const qs = pickExamQuestions({ subject: form.subject, topics, count: Number(form.count) || 20 });
    if (qs.length === 0) {
      toast({ message: "No questions found — try another subject", type: "warning" });
      return;
    }
    setPreview(qs);
    toast({ message: `${qs.length} questions selected`, type: "success" });
  }

  async function handleBuild() {
    if (preview.length === 0) handlePreview();
    const qs = preview.length > 0 ? preview : pickExamQuestions({ subject: form.subject, count: Number(form.count) || 20 });
    if (qs.length === 0) return;
    setBusy(true);
    try {
      const pdf = await buildExamPdf({
        schoolName: school?.schoolName || school?.name || "ExamPadi School",
        subject: form.subject,
        examBody: form.examBody,
        timeLimit: form.timeLimit,
        questions: qs,
        teacherName: user?.displayName || user?.email,
      });
      const filename = `${form.subject}-${form.examBody}-exam-${Date.now()}.pdf`;
      downloadPdf(pdf, filename);
      if (profile?.schoolId) {
        await saveGeneratedExam(profile.schoolId, {
          subject: form.subject,
          examBody: form.examBody,
          count: qs.length,
          timeLimit: form.timeLimit,
          createdBy: user.uid,
          filename,
        });
        listGeneratedExams(profile.schoolId).then(setArchive).catch(() => {});
      }
      toast({ message: "Exam PDF downloaded + archived ✓", type: "success" });
    } catch (e) {
      toast({ message: `PDF failed: ${e.message}`, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    try {
      const qs = preview.length > 0 ? preview : pickExamQuestions({ subject: form.subject, count: Number(form.count) || 20 });
      const pdf = await buildExamPdf({
        schoolName: school?.schoolName || school?.name || "ExamPadi School",
        subject: form.subject,
        examBody: form.examBody,
        timeLimit: form.timeLimit,
        questions: qs,
        teacherName: user?.displayName || user?.email,
      });
      const file = new File([pdfToFile(pdf, "exam.pdf")], `${form.subject}-exam.pdf`, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${form.subject} exam` });
      } else {
        toast({ message: "Sharing not supported here — PDF downloaded instead", type: "info" });
        downloadPdf(pdf, `${form.subject}-exam.pdf`);
      }
    } catch (e) {
      toast({ message: `Share failed: ${e.message}`, type: "error" });
    }
  }

  return (
    <div className="page-content max-w-3xl mx-auto space-y-6">
      <Link to="/teacher" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <h1 className="text-2xl font-black text-text flex items-center gap-2"><FileText size={22} /> Exam Generator</h1>

      <div className="glass-card p-6 grid sm:grid-cols-2 gap-4">
        <label className="text-sm font-bold text-text">Subject
          <select value={form.subject} onChange={(e) => set("subject", e.target.value)} className="input-field mt-2">
            {JAMB_SUBJECTS.map((s) => <option key={s.id} value={s.name}>{s.icon} {s.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-text">Exam body
          <select value={form.examBody} onChange={(e) => set("examBody", e.target.value)} className="input-field mt-2">
            {["JAMB", "WAEC", "NECO", "NABTEB"].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-text">Topics (comma-separated, optional)
          <input value={form.topics} onChange={(e) => set("topics", e.target.value)} placeholder="e.g. Vectors, Motion" className="input-field mt-2" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm font-bold text-text">Questions
            <input type="number" min={5} max={100} value={form.count} onChange={(e) => set("count", e.target.value)} className="input-field mt-2" />
          </label>
          <label className="text-sm font-bold text-text">Time limit
            <input value={form.timeLimit} onChange={(e) => set("timeLimit", e.target.value)} placeholder="1 hour" className="input-field mt-2" />
          </label>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={handlePreview} className="btn-secondary px-5">Preview questions</button>
        <button onClick={handleBuild} disabled={busy} className="btn-primary px-5 disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download PDF
        </button>
        <button onClick={handleShare} className="btn-secondary px-5"><Share2 size={16} /> Share to WhatsApp</button>
      </div>

      {preview.length > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h2 className="font-black text-text">Preview ({preview.length})</h2>
          {preview.slice(0, 10).map((q, i) => (
            <div key={q.id || i} className="text-sm text-text" style={{ lineHeight: 1.6 }}>
              <strong>{i + 1}.</strong> {String(q.question).slice(0, 140)}{q.question.length > 140 ? "…" : ""}
              <span className="text-text-muted"> [{q.topic}]</span>
            </div>
          ))}
          {preview.length > 10 && <div className="text-xs text-text-muted">…and {preview.length - 10} more in the PDF.</div>}
        </div>
      )}

      {archive.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-black text-text mb-3">Saved exams</h2>
          <div className="space-y-2">
            {archive.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-text font-semibold">{a.subject} · {a.examBody} · {a.count} Qs</span>
                <span className="text-text-muted text-xs">{a.filename || ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
