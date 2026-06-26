import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("ep-install-dismissed");
    if (dismissed) return;
    const handler = (e) => { e.preventDefault(); setPrompt(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleInstall() {
    if (prompt) { prompt.prompt(); setShow(false); }
  }

  function handleDismiss() {
    localStorage.setItem("ep-install-dismissed", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: 16, right: 16, zIndex: 8888,
      background: "#121218", border: "1px solid #6C3CE944", borderRadius: 14,
      padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: 14 }}>
          📱 Add ExamPadi to your home screen
        </p>
        <p style={{ color: "#888", fontSize: 12, margin: "2px 0 0" }}>
          For the best experience
        </p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleDismiss} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #333", background: "none", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
          Not now
        </button>
        <button onClick={handleInstall} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#6C3CE9", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
          Install
        </button>
      </div>
    </div>
  );
}