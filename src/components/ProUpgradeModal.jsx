import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePaystack } from "../hooks/usePaystack";
import { PLANS } from "../config/plans";
import { X, Check, Crown, ChevronRight, Loader2, Zap, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ProUpgradeModal({ open, onClose, reason, dismissible }) {
  const { user } = useAuth();
  const [billing, setBilling] = useState("yearly");
  const { initializePayment, loading } = usePaystack();

  if (!open) return null;

  const plan = billing === "yearly" ? "pro_yearly" : "pro_monthly";
  const planData = PLANS[plan];
  const freePlan = PLANS.free;

  function getReasonPill() {
    switch (reason) {
      case "questions": return { text: "⚡ Daily limit reached — 15/15 questions used", color: "#FF4D6A" };
      case "ai": return { text: "🤖 AI Tutor is a Pro feature", color: "#6C3CE9" };
      case "mock": return { text: "📝 Mock exams require Pro", color: "#4D9EFF" };
      case "subjects": return { text: "📚 Unlock all subjects with Pro", color: "#FF9F43" };
      default: return null;
    }
  }

  const reasonPill = getReasonPill();

  async function handleUpgrade() {
    if (!user) return;
    await initializePayment({
      plan,
      userEmail: user.email,
      userId: user.uid,
      userName: user.displayName || "Student",
    });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Gradient border wrapper */}
      <div style={{
        background: "linear-gradient(135deg, #6C3CE9, #D4A853)",
        padding: 1, borderRadius: 28, maxWidth: 560, width: "100%",
        boxShadow: "0 24px 80px rgba(108,60,233,0.3), 0 0 60px rgba(212,168,83,0.1)",
      }}>
        <div style={{
          background: "#0d0d12", borderRadius: 27, padding: "32px 28px",
          position: "relative", maxHeight: "90vh", overflowY: "auto",
        }}>
          {/* Close button */}
          {dismissible && (
            <button onClick={onClose} style={{
              position: "absolute", top: 16, right: 16, width: 32, height: 32,
              borderRadius: "50%", background: "#1a1a1f", border: "1px solid #333",
              color: "#888", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", transition: "all 0.2s",
            }}>
              <X size={16} />
            </button>
          )}

          {/* Animated Crown */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              display: "inline-flex", width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(212,168,83,0.2), rgba(212,168,83,0.05))",
              border: "1px solid rgba(212,168,83,0.3)",
              alignItems: "center", justifyContent: "center",
              animation: "crownGlow 2s ease-in-out infinite",
            }}>
              <Crown size={32} color="#D4A853" />
            </div>
            <style>{`
              @keyframes crownGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(212,168,83,0.2); }
                50% { box-shadow: 0 0 40px rgba(212,168,83,0.4); }
              }
            `}</style>
          </div>

          {/* Headline */}
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            Unlock Your Full Potential
          </h2>
          <p style={{ color: "#888", fontSize: 15, textAlign: "center", margin: "0 0 24px" }}>
            Top JAMB scorers study smarter, not harder. Go Pro.
          </p>

          {/* Reason pill */}
          {reasonPill && (
            <div style={{
              display: "flex", justifyContent: "center", marginBottom: 24,
            }}>
              <span style={{
                padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: `${reasonPill.color}15`, color: reasonPill.color,
                border: `1px solid ${reasonPill.color}30`,
              }}>
                {reasonPill.text}
              </span>
            </div>
          )}

          {/* Plan toggle */}
          <div style={{
            display: "flex", background: "#1a1a1f", borderRadius: 14,
            padding: 4, marginBottom: 24, border: "1px solid #222",
          }}>
            {[
              { id: "monthly", label: "Monthly" },
              { id: "yearly", label: "Yearly", badge: "SAVE ₦6,000" },
            ].map((tab) => {
              const isActive = billing === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setBilling(tab.id)}
                  style={{
                    flex: 1, padding: "12px 16px", borderRadius: 11,
                    background: isActive ? "#6C3CE9" : "transparent",
                    border: "none", cursor: "pointer", textAlign: "center",
                    position: "relative", transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 14, color: isActive ? "#fff" : "#888" }}>
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <span style={{
                      display: "block", fontSize: 10, fontWeight: 700,
                      color: isActive ? "#D4A853" : "#D4A853", marginTop: 2,
                      opacity: isActive ? 1 : 0.6,
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Price */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
              {billing === "yearly" && (
                <span style={{ fontSize: 16, color: "#FF6B6B", textDecoration: "line-through", fontWeight: 500 }}>
                  ₦18,000
                </span>
              )}
              <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
                ₦{planData.price.toLocaleString()}
              </span>
            </div>
            <div style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
              {billing === "yearly" ? "/year · that's just ₦1,000/month" : "/month"}
            </div>
          </div>

          {/* Features columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 20 }}>
            {planData.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "rgba(74,222,128,0.15)", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Check size={12} color="#4ADE80" />
                </div>
                <span style={{ color: "#fff", fontSize: 13, lineHeight: 1.3 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Locked free features */}
          <div style={{
            background: "rgba(255,77,106,0.05)", borderRadius: 12, padding: "12px 16px",
            marginBottom: 24, border: "1px solid rgba(255,77,106,0.1)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B6B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              What you're missing on Free
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {freePlan.locked.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <X size={12} color="#FF6B6B" style={{ opacity: 0.6, flexShrink: 0 }} />
                  <span style={{ color: "#999", fontSize: 12 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              width: "100%", height: 56, borderRadius: 16, border: "none",
              background: "linear-gradient(135deg, #6C3CE9 0%, #9B59B6 50%, #D4A853 100%)",
              color: "#fff", fontWeight: 700, fontSize: 17, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s", opacity: loading ? 0.7 : 1,
              boxShadow: "0 8px 32px rgba(108,60,233,0.3)",
            }}
            onMouseOver={(e) => {
              if (!loading) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "scale(1.02)"; }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {loading ? (
              <Loader2 size={22} style={{ animation: "spin 0.8s linear infinite" }} />
            ) : (
              <>
                Activate Pro {billing === "yearly" ? "Yearly" : "Monthly"}
                <ChevronRight size={20} />
              </>
            )}
          </button>

          {/* Trust signals */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, marginBottom: 16 }}>
            {[
              { icon: <ShieldCheck size={14} />, label: "Secured by Paystack" },
              { icon: <ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} />, label: "Cancel anytime" },
              { icon: <Zap size={14} />, label: "Naira payments" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, color: "#555", fontSize: 11, fontWeight: 500 }}>
                {item.icon} {item.label}
              </div>
            ))}
          </div>

          {/* Dismiss */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", color: "#666", fontSize: 13,
                cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2,
                fontFamily: "inherit",
              }}
            >
              Continue with Free plan
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}