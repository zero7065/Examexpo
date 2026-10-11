// Join a class with an invite code (/join or /join/:code).
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { acceptClassInvite } from "../../lib/schools";
import { Users, ArrowLeft } from "lucide-react";

export default function JoinClass() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { code: paramCode } = useParams();
  const [code, setCode] = useState(paramCode || "");
  const [busy, setBusy] = useState(false);

  async function join(c) {
    const clean = String(c || "").trim().toUpperCase();
    if (!clean) { toast({ message: "Enter your class code", type: "warning" }); return; }
    if (!user) { navigate("/auth", { replace: true }); return; }
    setBusy(true);
    try {
      await acceptClassInvite(clean, user.uid);
      toast({ message: "Welcome to your class! 🎓", type: "success" });
      navigate("/dashboard", { replace: true });
    } catch (e) {
      toast({ message: e.message || "Could not join class", type: "error" });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (paramCode && user && !busy) join(paramCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCode, user]);

  return (
    <div className="page-content max-w-md mx-auto">
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back
      </Link>
      <div className="glass-card p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white" style={{ background: "var(--landing-gradient)" }}>
          <Users size={26} />
        </div>
        <h1 className="text-2xl font-black text-text">Join your class</h1>
        <p className="text-sm text-text-muted">Enter the 6-letter code from your teacher.</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          className="input-field text-center"
          style={{ fontSize: 22, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase" }}
        />
        <button onClick={() => join(code)} disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? "Joining…" : "Join class"}
        </button>
      </div>
    </div>
  );
}
