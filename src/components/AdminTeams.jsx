// Admin teams panel: all paid teams, seats, members, revoke.
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { listTeamsForAdmin, deactivateTeam } from "../lib/teams";
import { batchGiftPro } from "../lib/community";
import { Users, Ticket, Ban, Gift } from "lucide-react";

export default function AdminTeams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [giftIds, setGiftIds] = useState("");
  const [giftPlan, setGiftPlan] = useState("pro_monthly");
  const [giftDays, setGiftDays] = useState(30);
  const [gifting, setGifting] = useState(false);

  function load() {
    setLoading(true);
    listTeamsForAdmin().then(setTeams).catch((e) => toast({ message: e.message, type: "error" })).finally(() => setLoading(false));
  }

  useEffect(() => {
    let live = true;
    listTeamsForAdmin()
      .then((t) => { if (live) setTeams(t); })
      .catch((e) => { if (live) toast({ message: e.message, type: "error" }); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function revoke(id) {
    if (!window.confirm("Revoke this team? New joins stop; existing members keep Pro until expiry.")) return;
    try {
      await deactivateTeam(id, user.uid, user.email);
      toast({ message: "Team revoked", type: "success" });
      load();
    } catch (e) {
      toast({ message: e.message, type: "error" });
    }
  }

  if (loading) return <div style={{ color: "#888", padding: 24 }}>Loading teams…</div>;

  async function handleGift() {
    const uids = giftIds.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (uids.length === 0) {
      toast({ message: "Paste at least one user UID", type: "warning" });
      return;
    }
    if (!window.confirm(`Gift ${giftPlan} (${giftDays} days) to ${uids.length} account(s)?`)) return;
    setGifting(true);
    try {
      const done = await batchGiftPro(uids, { plan: giftPlan, days: Number(giftDays) || 30, adminUid: user.uid, adminEmail: user.email });
      toast({ message: `Gifted Pro to ${done}/${uids.length} accounts 🎁`, type: "success" });
      setGiftIds("");
    } catch (e) {
      toast({ message: e.message, type: "error" });
    } finally {
      setGifting(false);
    }
  }

  return (
    <div>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>
        Every paid group subscription. Revoking stops new joins — paid-up members keep Pro until expiry (no-refund policy).
      </p>

      {/* Batch gifts */}
      <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <Gift size={15} color="#D4A853" /> Batch-gift Pro
        </h3>
        <textarea value={giftIds} onChange={(e) => setGiftIds(e.target.value)} rows={2}
          placeholder="Paste user UIDs — one per line or comma-separated"
          className="input-field font-mono" style={{ resize: "vertical", marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={giftPlan} onChange={(e) => setGiftPlan(e.target.value)} className="input-field" style={{ maxWidth: 180 }}>
            <option value="pro_monthly">Pro Monthly</option>
            <option value="pro_yearly">Pro Yearly</option>
          </select>
          <select value={giftDays} onChange={(e) => setGiftDays(Number(e.target.value))} className="input-field" style={{ maxWidth: 140 }}>
            {[7, 14, 30, 90, 365].map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
          <button onClick={handleGift} disabled={gifting} className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>
            {gifting ? "Gifting…" : "Gift Pro"}
          </button>
        </div>
      </div>
      {teams.length === 0 && <div style={{ color: "#666", padding: 24, textAlign: "center" }}>No teams yet.</div>}
      <div style={{ display: "grid", gap: 12 }}>
        {teams.map((t) => (
          <div key={t.id} style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Users size={18} color="#6C3CE9" />
              <strong style={{ fontSize: 16 }}>{t.name}</strong>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                background: t.status === "active" ? "rgba(74,222,128,0.12)" : t.status === "pending" ? "rgba(255,159,67,0.12)" : "rgba(255,77,106,0.12)",
                color: t.status === "active" ? "#4ADE80" : t.status === "pending" ? "#FF9F43" : "#FF4D6A",
              }}>{t.status?.toUpperCase()}</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
                {t.plan} · {t.seatsUsed || 0}/{t.seats || 0} seats
                {t.amountPaid ? ` · ₦${Number(t.amountPaid).toLocaleString()} paid` : ""}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#888", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Ticket size={13} /> <code style={{ color: "#D4A853", fontWeight: 700 }}>{t.code}</code>
              </span>
              <span style={{ fontSize: 12, color: "#666" }}>payer: {t.payerEmail || t.payerUid?.slice(0, 8)}</span>
              {(t.members || []).length > 0 && (
                <span style={{ fontSize: 12, color: "#666" }}>· {t.members.length} member{t.members.length === 1 ? "" : "s"}</span>
              )}
              {t.status === "active" && (
                <button onClick={() => revoke(t.id)} style={{
                  marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 8, background: "transparent",
                  border: "1px solid #FF4D6A", color: "#FF4D6A", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>
                  <Ban size={13} /> Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
