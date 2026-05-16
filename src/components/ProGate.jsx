import { useState } from "react";
import { useSubscription } from "../hooks/useSubscription";
import ProUpgradeModal from "./ProUpgradeModal";

export default function ProGate({ children, reason }) {
  const { isPro } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  if (isPro) return children;

  return (
    <>
      <div style={{ position: "relative" }}>
        <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
          {children}
        </div>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
          background: "rgba(0,0,0,0.4)", borderRadius: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(108,60,233,0.2)", border: "1px solid rgba(108,60,233,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 22 }}>🔒</span>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Pro Feature</span>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #6C3CE9, #9B59B6)",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            Upgrade →
          </button>
        </div>
      </div>
      <ProUpgradeModal open={showModal} onClose={() => setShowModal(false)} reason={reason} />
    </>
  );
}