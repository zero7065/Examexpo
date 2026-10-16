// src/pages/schools/PartnerDashboard.jsx — Partner Plan earnings dashboard.
// Schools earn 20% (25% at 100+ paying referrals) of every payment from
// students who sign up with their referral code. Payouts are manual
// (admin marks commissions paid); this page shows live balances.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, query, where, limit, orderBy, onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { partnerLink } from "../../lib/partner";
import { Copy, Check, Users, Wallet, GraduationCap, ArrowLeft } from "lucide-react";

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function PartnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email || !db) return;
    // Schools readable by their contact email (see firestore.rules).
    const q = query(
      collection(db, "schools"),
      where("contactEmail", "==", user.email),
      limit(5)
    );
    const unsubSchool = onSnapshot(q, (snap) => {
      const docSnap = snap.docs[0];
      setSchool(docSnap ? { id: docSnap.id, ...docSnap.data() } : null);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubSchool();
  }, [user?.email]);

  useEffect(() => {
    if (!school?.id || !db) return;
    const q = query(
      collection(db, "commissions"),
      where("schoolId", "==", school.id),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const unsub = onSnapshot(q, (snap) => {
      setCommissions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [school?.id]);

  const partner = school?.partner || null;
  const link = partner?.code ? partnerLink(partner.code) : null;

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may be blocked */ }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Loading partner dashboard…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px 64px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <button
        onClick={() => navigate("/schools")}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, marginBottom: 16, fontFamily: "inherit" }}
      >
        <ArrowLeft size={14} /> Back to Schools
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>
        Partner <span style={{ color: "var(--primary)" }}>Dashboard</span>
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 28px" }}>
        Earn 20% of every payment from students who join ExamPadi with your school's link — 25% after 100 paying referrals. The school itself pays ₦0.
      </p>

      {!school ? (
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, textAlign: "center" }}>
          <GraduationCap size={40} color="var(--primary)" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ color: "var(--text)", margin: "0 0 8px" }}>No school found for your email</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
            The Partner Dashboard is available to registered schools. Register your school first — you'll be enrolled in the Partner Plan automatically once approved.
          </p>
          <button
            onClick={() => navigate("/schools/signup")}
            style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Register your school
          </button>
        </div>
      ) : !partner?.code ? (
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, textAlign: "center" }}>
          <Wallet size={40} color="var(--accent)" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ color: "var(--text)", margin: "0 0 8px" }}>Partner Plan activating…</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {school.status === "approved"
              ? "Your school is approved. The referral code is being generated — check back in a few minutes."
              :               `Your school registration is ${school.status || "pending"}. The Partner Plan unlocks once an admin approves your school.`}
          </p>
        </div>
      ) : (
        <>
          {/* Referral link */}
          <div style={{ background: "linear-gradient(135deg, rgb(var(--primary-rgb) / 0.12), rgb(var(--accent-rgb) / 0.08))", border: "1px solid rgb(var(--primary-rgb) / 0.3)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Your referral link
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <code style={{ flex: 1, minWidth: 240, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--text)", wordBreak: "break-all" }}>
                {link}
              </code>
              <button
                onClick={copyLink}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: copied ? "var(--success)" : "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}
              >
                {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy link</>}
              </button>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "12px 0 0" }}>
              Share this with students and parents. Code: <b style={{ color: "var(--text)" }}>{partner.code}</b> · Commission rate: <b style={{ color: "var(--text)" }}>{Math.round((partner.rate || 0.2) * 100)}%</b>
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
            {[
              { label: "Paying referrals", value: partner.payersCount || 0, icon: <Users size={18} />, tint: "var(--primary)" },
              { label: "Total earned", value: naira(partner.totalEarned), icon: <Wallet size={18} />, tint: "var(--success)" },
              { label: "Pending payout", value: naira(partner.pendingPayout), icon: <Wallet size={18} />, tint: "var(--accent)" },
              { label: "Paid out", value: naira(partner.totalPaid), icon: <Check size={18} />, tint: "var(--text-muted)" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: s.tint, marginBottom: 10 }}>{s.icon}<span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{s.label}</span></div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Commission history */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>Recent commissions</h3>
          {commissions.length === 0 ? (
            <div style={{ background: "var(--bg-2)", border: "1px dashed var(--border)", borderRadius: 14, padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
              No commissions yet. Share your link — every Pro, IELTS, Classroom or credit-pack purchase from your referrals earns a commission.
            </div>
          ) : (
            <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              {commissions.map((c, i) => (
                <div
                  key={c.id}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", borderTop: i === 0 ? "none" : "1px solid var(--border)", flexWrap: "wrap" }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{String(c.plan || "plan").replace(/_/g, " ")}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : "—"} · ref {String(c.reference || "").slice(0, 18)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{Math.round((c.rate || 0.2) * 100)}% of {naira(c.amountPaidNaira)}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "var(--success)" }}>+{naira(c.commissionNaira)}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: c.status === "paid" ? "rgb(var(--success-rgb) / 0.15)" : "rgb(var(--accent-rgb) / 0.15)", color: c.status === "paid" ? "var(--success)" : "var(--accent)" }}>
                      {c.status === "paid" ? "PAID" : "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
