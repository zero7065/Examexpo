// Pricing (single source of truth: src/config/plans.js) + Schools strip.
import { Link } from "react-router-dom";
import { Check, MessageSquare } from "lucide-react";
import { PLANS } from "../../config/plans";

export default function LandingPricing() {
  const cards = [
    {
      name: "Free",
      price: "₦0",
      period: "forever",
      popular: false,
      cta: "Get Started",
      href: "/auth",
      features: PLANS.free.features,
    },
    {
      name: PLANS.pro_monthly.name,
      price: `₦${PLANS.pro_monthly.price.toLocaleString()}`,
      period: "/month",
      popular: true,
      cta: "Go Pro",
      href: "/payment",
      features: PLANS.pro_monthly.features,
    },
    {
      name: PLANS.pro_yearly.name,
      price: `₦${PLANS.pro_yearly.price.toLocaleString()}`,
      period: "/year",
      strike: `₦${PLANS.pro_yearly.originalPrice.toLocaleString()}`,
      badge: PLANS.pro_yearly.badge,
      popular: false,
      cta: "Best Value",
      href: "/payment",
      features: PLANS.pro_yearly.features,
    },
  ];

  return (
    <section id="pricing" className="lp-section" style={{ background: "linear-gradient(180deg, var(--bg), rgb(var(--primary-rgb) / 0.06))" }}>
      <div className="lp-container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="lp-h2">Simple <span className="lp-gradient-text">Pricing</span></h2>
          <p className="lp-sub">Start free, upgrade when you need more power.</p>
        </div>
        <div className="lp-price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 980, margin: "0 auto", alignItems: "stretch" }}>
          {cards.map((plan, i) => (
            <div key={plan.name} className={`lp-animate-in lp-delay-${i + 1}`} style={{
              background: plan.popular ? "var(--landing-gradient)" : "rgb(var(--bg-2-rgb) / 0.72)",
              backdropFilter: plan.popular ? "none" : "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: plan.popular ? "none" : "blur(20px) saturate(1.4)",
              borderRadius: 20, padding: 32,
              border: plan.popular ? "none" : "1px solid var(--border)",
              position: "relative", overflow: "hidden",
              transform: plan.popular ? "scale(1.05)" : "none",
              color: plan.popular ? "#fff" : "var(--text)",
              display: "flex", flexDirection: "column",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: 16, right: -32,
                  background: "rgba(255,255,255,0.2)", color: "#fff",
                  padding: "4px 40px", fontSize: 11, fontWeight: 700,
                  transform: "rotate(45deg)", backdropFilter: "blur(8px)",
                }}>POPULAR</div>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>{plan.name}</h3>
              {plan.badge && (
                <div style={{ fontSize: 11, fontWeight: 800, color: plan.popular ? "#fff" : "var(--accent)", letterSpacing: "0.04em", marginTop: 4 }}>{plan.badge}</div>
              )}
              <div style={{ margin: "16px 0" }}>
                {plan.strike && (
                  <span style={{ fontSize: 15, opacity: 0.6, textDecoration: "line-through", marginRight: 8 }}>{plan.strike}</span>
                )}
                <span style={{ fontSize: 36, fontWeight: 900 }}>{plan.price}</span>
                <span style={{ fontSize: 14, opacity: 0.7 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: 1.4 }}>
                    <Check size={16} style={{ flexShrink: 0, color: plan.popular ? "rgba(255,255,255,0.85)" : "var(--primary)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={plan.href} style={{
                display: "block", textAlign: "center", padding: "14px", borderRadius: 12,
                fontWeight: 700, fontSize: 14, textDecoration: "none",
                background: plan.popular ? "rgba(255,255,255,0.2)" : "var(--landing-gradient)",
                color: "#fff",
                border: plan.popular ? "1px solid rgba(255,255,255,0.2)" : "none",
              }}>{plan.cta}</Link>
            </div>
          ))}
        </div>

        {/* Schools strip */}
        <div className="lp-glass lp-animate-in" style={{
          maxWidth: 980, margin: "32px auto 0", borderRadius: 20, padding: "24px 32px",
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Running a school or tutorial centre?</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              Bulk Pro seats, teacher oversight and onboarding support — talk to us on WhatsApp.
            </div>
          </div>
          <a
            href="https://wa.me/2348127636057?text=Hi!%20I%27m%20interested%20in%20ExamPadi%20for%20my%20school."
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn-primary"
            style={{ padding: "12px 24px", fontSize: 14 }}
          >
            <MessageSquare size={16} /> Contact for Schools
          </a>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .lp-price-grid { grid-template-columns: 1fr !important; max-width: 420px; } }`}</style>
    </section>
  );
}
