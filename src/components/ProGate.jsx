import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProGate({ feature }) {
  const navigate = useNavigate();
  return (
    <div style={{
      textAlign: "center", padding: "40px 24px",
      background: "var(--bg-2)", borderRadius: 16,
      border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <h3 style={{ color: "var(--text)", fontWeight: 800, marginBottom: 8 }}>
        Pro Feature
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
        {feature} is available on the Pro plan.
        Upgrade for ₦3,000/month — less than a lesson centre day.
      </p>
      <button
        onClick={() => navigate("/payment")}
        style={{
          padding: "12px 28px", borderRadius: 10,
          background: "var(--primary)", border: "none",
          color: "#000", fontWeight: 800, cursor: "pointer",
          fontFamily: "inherit", fontSize: 15,
        }}>
        Upgrade to Pro →
      </button>
    </div>
  );
}
