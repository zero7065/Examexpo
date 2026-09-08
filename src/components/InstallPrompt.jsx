import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if previously dismissed (within 24 hours)
    const dismissed = localStorage.getItem("ep-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 86400000) return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 5 seconds delay for better UX
      setTimeout(() => setShow(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem("ep-install-dismissed", Date.now().toString());
    setShow(false);
  }

  if (!show || isStandalone || !deferredPrompt) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: 12, right: 12, zIndex: 8888,
      maxWidth: 420, margin: "0 auto",
      background: "linear-gradient(135deg, #121218 0%, #1a1a2e 100%)",
      border: "1px solid rgba(108,60,233,0.3)", borderRadius: 16,
      padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(108,60,233,0.15), 0 4px 16px rgba(0,0,0,0.3)",
      animation: "slideUp 0.4s ease-out",
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: "linear-gradient(135deg, #6C3CE9, #9b59b6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>
        E
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: 14, lineHeight: 1.3 }}>
          Install ExamPadi
        </p>
        <p style={{ color: "#888", fontSize: 12, margin: "2px 0 0", lineHeight: 1.3 }}>
          Quick access from your home screen
        </p>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={handleDismiss} style={{
          padding: "8px 12px", borderRadius: 10, border: "1px solid #333",
          background: "none", color: "#888", cursor: "pointer", fontSize: 13,
          fontFamily: "inherit", fontWeight: 600,
        }}>
          Later
        </button>
        <button onClick={handleInstall} style={{
          padding: "8px 14px", borderRadius: 10, border: "none",
          background: "#6C3CE9", color: "#fff", fontWeight: 700,
          cursor: "pointer", fontSize: 13, fontFamily: "inherit",
        }}>
          Install
        </button>
      </div>
    </div>
  );
}
