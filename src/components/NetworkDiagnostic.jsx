import { useState, useEffect } from "react";
import { clearOldServiceWorker } from "../lib/clearCache";

export default function NetworkDiagnostic() {
  const [show, setShow] = useState(false);
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const [cleared, setCleared] = useState(false);

  async function runTests() {
    setTesting(true);
    setResults([]);
    const r = [];

    const endpoints = [
      ["Firebase Auth", "https://identitytoolkit.googleapis.com/v1/projects?key=AIzaSyDbXyJpW351DfqEyxwrsc4zZUNLcltaGQE"],
      ["Firestore", "https://firestore.googleapis.com/v1/projects/jamb-tutor/databases/(default)/documents/stats/global"],
      ["Firebase Token", "https://securetoken.googleapis.com/v1/token?key=AIzaSyDbXyJpW351DfqEyxwrsc4zZUNLcltaGQE"],
      ["Google Fonts", "https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900"],
    ];

    for (const [name, url] of endpoints) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal, method: name === "Firebase Token" ? "POST" : "GET" });
        clearTimeout(timer);
        r.push({ name, status: res.ok ? "OK" : `FAIL (${res.status})`, ok: res.ok });
      } catch (e) {
        r.push({ name, status: `BLOCKED (${e.name === "AbortError" ? "timeout" : e.name})`, ok: false });
      }
    }

    setResults(r);
    setTesting(false);
  }

  async function handleClearCache() {
    await clearOldServiceWorker();
    setCleared(true);
    setTimeout(() => window.location.reload(), 500);
  }

  if (!show) {
    return (
      <button
        onClick={() => { setShow(true); runTests(); }}
        style={{
          position: "fixed", bottom: 16, left: 16, zIndex: 9998,
          background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "8px 14px", cursor: "pointer",
          fontSize: 12, color: "var(--text-muted)", fontFamily: "inherit",
          boxShadow: "var(--card-shadow)",
        }}
      >
        Network Diagnostic
      </button>
    );
  }

  const allBlocked = results.length > 0 && results.every(r => !r.ok);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.85)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setShow(false); }}
    >
      <div style={{
        background: "var(--bg-2)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 28, maxWidth: 440, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <h2 style={{ color: "var(--text)", fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 8 }}>
          Network Diagnostic
        </h2>

        {testing ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Testing connections to Google/Firebase...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {results.map((r) => (
              <div key={r.name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 8,
                background: r.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${r.ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}>
                <span style={{ color: "var(--text)", fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                <span style={{
                  color: r.ok ? "#22c55e" : "#ef4444", fontSize: 12, fontFamily: "monospace", fontWeight: 700,
                }}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {allBlocked && !testing && (
          <div style={{
            padding: "14px 16px", borderRadius: 10, marginBottom: 16,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          }}>
            <p style={{ color: "#ef4444", fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>
              All Google/Firebase endpoints are blocked on your network
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              Your ISP or network is blocking access to Google services. Try:<br/>
              1. Switch to mobile data (MTN/Airtel/Glo)<br/>
              2. Turn off VPN if active<br/>
              3. Try a different WiFi network<br/>
              4. Restart your router/modem
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleClearCache}
            disabled={cleared}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: cleared ? "#22c55e" : "var(--primary)", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {cleared ? "Reloading..." : "Clear Cache & Reload"}
          </button>
          <button
            onClick={() => setShow(false)}
            style={{
              padding: "12px 20px", borderRadius: 10,
              border: "1px solid var(--border)", background: "var(--bg-3)",
              color: "var(--text-muted)", fontWeight: 600, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Close
          </button>
        </div>

        {!testing && results.length > 0 && (
          <button
            onClick={runTests}
            style={{
              width: "100%", padding: "10px", marginTop: 10, borderRadius: 10,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-muted)", fontSize: 13, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Retest
          </button>
        )}
      </div>
    </div>
  );
}
