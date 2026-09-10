// Deep network diagnostic — tests DNS, TLS, CORS, and specific Google endpoints
export async function deepDiagnostic() {
  const results = [];

  // Enable Firebase debug logging if available
  try {
    if (typeof window !== 'undefined') {
      window.firebase.DEBUG = true;
      window.firebase.LOG_LEVEL = 'debug';
    }
  } catch (e) {}

  const tests = [
    // DNS + basic connectivity
    { name: "Google.com", url: "https://www.google.com/generate_204", method: "GET", timeout: 6000 },
    { name: "Google Fonts", url: "https://fonts.googleapis.com/css2?family=Inter", method: "GET", timeout: 6000 },

    // Firebase Auth endpoints
    { name: "Auth (identitytoolkit)", url: "https://identitytoolkit.googleapis.com/v1/projects?key=AIzaSyDbXyJpW351DfqEyxwrsc4zZUNLcltaGQE", method: "GET", timeout: 8000 },
    { name: "Auth (www.googleapis)", url: "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=AIzaSyDbXyJpW351DfqEyxwrsc4zZUNLcltaGQE", method: "GET", timeout: 8000 },

    // Firestore
    { name: "Firestore REST", url: "https://firestore.googleapis.com/v1/projects/jamb-tutor/databases/(default)/documents/stats/global", method: "GET", timeout: 8000 },

    // Token endpoint
    { name: "Secure Token", url: "https://securetoken.googleapis.com/v1/token?key=AIzaSyDbXyJpW351DfqEyxwrsc4zZUNLcltaGQE", method: "POST", timeout: 8000 },

    // CORS preflight test
    { name: "CORS preflight", url: "https://identitytoolkit.googleapis.com/v1/projects?key=AIzaSyDbXyJpW351DfqEyxwrsc4zZUNLcltaGQE", method: "OPTIONS", timeout: 6000 },

    // Alternative Google endpoint
    { name: "Google CDN", url: "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js", method: "GET", timeout: 6000 },
  ];

  for (const test of tests) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), test.timeout);
      const res = await fetch(test.url, {
        method: test.method,
        signal: controller.signal,
        headers: test.method === "OPTIONS" ? { "Origin": window.location.origin } : {},
      });
      clearTimeout(timer);
      const ms = Date.now() - start;
      results.push({
        name: test.name,
        status: res.status,
        ok: res.ok,
        ms,
        error: null,
      });
    } catch (e) {
      const ms = Date.now() - start;
      results.push({
        name: test.name,
        status: null,
        ok: false,
        ms,
        error: e.name === "AbortError" ? "TIMEOUT" : e.message || e.name,
      });
    }
  }

  // Test WebSocket to Firebase
  try {
    const ws = new WebSocket("wss://identitytoolkit.googleapis.com");
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { ws.close(); reject(new Error("TIMEOUT")); }, 4000);
      ws.onopen = () => { clearTimeout(timer); ws.close(); resolve(); };
      ws.onerror = (e) => { clearTimeout(timer); reject(e); };
    });
    results.push({ name: "WebSocket (Auth)", status: 101, ok: true, ms: 0, error: null });
  } catch (e) {
    results.push({ name: "WebSocket (Auth)", status: null, ok: false, ms: 0, error: e.message || e.name });
  }

  // Check navigator.onLine and connection info
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const netInfo = {
    onLine: navigator.onLine,
    effectiveType: connection?.effectiveType || "unknown",
    downlink: connection?.downlink || "unknown",
    rtt: connection?.rtt || "unknown",
  };

  return { results, netInfo };
}
