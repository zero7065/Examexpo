import { useState } from "react";
import { clearOldServiceWorker } from "../lib/clearCache";
import { deepDiagnostic } from "../lib/deepDiagnostic";

export default function NetworkDiagnostic() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState(null);
  const [testing, setTesting] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [logs, setLogs] = useState([]);

  function addLog(msg) {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function runTests() {
    setTesting(true);
    setData(null);
    setLogs([]);
    addLog("Starting deep network diagnostic...");

    const result = await deepDiagnostic();
    setData(result);

    const blocked = result.results.filter(r => !r.ok);
    const ok = result.results.filter(r => r.ok);
    addLog(`${ok.length}/${result.results.length} endpoints reachable`);
    if (blocked.length > 0) {
      addLog(`Blocked: ${blocked.map(r => r.name).join(", ")}`);
    }
    addLog(`Network: ${result.netInfo.onLine ? "Online" : "OFFLINE"} | Type: ${result.netInfo.effectiveType} | Speed: ${result.netInfo.downlink}Mbps | Latency: ${result.netInfo.rtt}ms`);
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
        borderRadius: 16, padding: 24, maxWidth: 500, width: "100%",
        maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <h2 style={{ color: "var(--text)", fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 4 }}>
          Deep Network Diagnostic
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "0 0 16px" }}>
          Tests DNS, TLS, CORS, and all Firebase endpoints
        </p>

        {testing && (
          <div style={{ padding: 16, textAlign: "center" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border)",
              borderTopColor: "var(--primary)", animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }} />
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Testing all endpoints...</p>
          </div>
        )}

        {data && (
          <>
            {/* Connection Info */}
            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 12,
              background: "var(--bg-3)", border: "1px solid var(--border)",
              fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)", lineHeight: 1.8,
            }}>
              <div>Online: <span style={{ color: data.netInfo.onLine ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{data.netInfo.onLine ? "YES" : "NO"}</span></div>
              <div>Connection: {data.netInfo.effectiveType} | {data.netInfo.downlink}Mbps | {data.netInfo.rtt}ms RTT</div>
            </div>

            {/* Endpoint Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {data.results.map((r) => (
                <div key={r.name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderRadius: 8,
                  background: r.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${r.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}>
                  <div>
                    <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>{r.name}</span>
                    {r.error && (
                      <span style={{ color: "#ef4444", fontSize: 11, marginLeft: 8, fontFamily: "monospace" }}>
                        {r.error}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "monospace" }}>
                      {r.ms}ms
                    </span>
                    <span style={{
                      color: r.ok ? "#22c55e" : "#ef4444", fontSize: 12, fontFamily: "monospace", fontWeight: 700,
                    }}>
                      {r.ok ? `${r.status} OK` : `FAIL`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Logs */}
            {logs.length > 0 && (
              <div style={{
                padding: "8px 12px", borderRadius: 8, marginBottom: 12,
                background: "#0a0a0f", border: "1px solid var(--border)",
                fontSize: 11, fontFamily: "monospace", color: "#888", lineHeight: 1.8,
                maxHeight: 100, overflow: "auto",
              }}>
                {logs.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            )}

            {/* Diagnosis */}
            {(() => {
              const allBlocked = data.results.every(r => !r.ok);
              const googleBlocked = data.results.filter(r => r.name.includes("Google") || r.name.includes("Auth")).every(r => !r.ok);
              const firestoreBlocked = data.results.find(r => r.name.includes("Firestore")) && !data.results.find(r => r.name.includes("Firestore"))?.ok;
              const fontsOk = data.results.find(r => r.name === "Google Fonts")?.ok;

              if (allBlocked) {
                return (
                  <div style={{
                    padding: "12px 14px", borderRadius: 10, marginBottom: 12,
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  }}>
                    <p style={{ color: "#ef4444", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>
                      ALL endpoints blocked — ISP-level Google blocking
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                      Your network is blocking ALL Google services. Switch to mobile data hotspot.
                    </p>
                  </div>
                );
              }
              if (googleBlocked && fontsOk) {
                return (
                  <div style={{
                    padding: "12px 14px", borderRadius: 10, marginBottom: 12,
                    background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                  }}>
                    <p style={{ color: "#f59e0b", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>
                      Google accessible but Firebase Auth/Firestore blocked
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                      Your ISP may be specifically blocking Firebase endpoints. Try:<br/>
                      1. Mobile data hotspot<br/>
                      2. Different WiFi network<br/>
                      3. Disable any VPN/proxy
                    </p>
                  </div>
                );
              }
              if (firestoreBlocked) {
                return (
                  <div style={{
                    padding: "12px 14px", borderRadius: 10, marginBottom: 12,
                    background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                  }}>
                    <p style={{ color: "#f59e0b", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>
                      Firestore blocked — Auth may still work
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                      Firebase Auth might work but data won't save. Try mobile data.
                    </p>
                  </div>
                );
              }
              return (
                <div style={{
                  padding: "12px 14px", borderRadius: 10, marginBottom: 12,
                  background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                }}>
                  <p style={{ color: "#22c55e", fontSize: 14, fontWeight: 700, margin: 0 }}>
                    All critical endpoints reachable — network looks fine
                  </p>
                </div>
              );
            })()}
          </>
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

        {!testing && (
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
