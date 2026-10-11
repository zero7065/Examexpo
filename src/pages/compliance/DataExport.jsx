// Dedicated data-export page (also reachable from Settings → Privacy).
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { exportUserData, downloadJson, exportAllowedAt, markExported } from "../../lib/compliance";
import { ArrowLeft, Download, Loader2, ShieldCheck } from "lucide-react";

export default function DataExport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleExport() {
    if (!user) return;
    if (!exportAllowedAt(user.uid)) {
      toast({ message: "Exports are limited to once every 24 hours", type: "warning" });
      return;
    }
    setBusy(true);
    try {
      const data = await exportUserData(user.uid);
      downloadJson(`exampadi-data-${user.uid.slice(0, 8)}-${new Date().toISOString().split("T")[0]}.json`, data);
      markExported(user.uid);
      setDone(true);
      toast({ message: "Your data has been downloaded ✓", type: "success" });
    } catch (e) {
      toast({ message: `Export failed: ${e.message}`, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-content max-w-2xl mx-auto space-y-6">
      <Link to="/settings" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Settings
      </Link>
      <div className="glass-card p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <ShieldCheck size={26} />
        </div>
        <h1 className="text-2xl font-black text-text">Export my data</h1>
        <p className="text-sm text-text-muted" style={{ lineHeight: 1.7 }}>
          Downloads a JSON file with your profile, practice sessions, mock exams,
          notes, AI memory, study plans and activity log — everything ExamPadi holds about you.
        </p>
        <button onClick={handleExport} disabled={busy} className="btn-primary px-8 disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {busy ? "Preparing…" : "Download JSON"}
        </button>
        {done && <p className="text-xs text-text-muted">Saved. You can export again after 24 hours.</p>}
        <p className="text-xs text-text-muted">
          Want it all gone instead? <Link to="/profile" className="text-danger font-semibold">Delete your account</Link> — data is purged within 30 days.
        </p>
      </div>
    </div>
  );
}
