// Deep network diagnostic — tests reachability of the exact hosts the app depends on.
// Semantics: ANY HTTP response (even 4xx) proves DNS+TLS+route to the host worked.
// Only network errors / timeouts count as "blocked".

const FALLBACK_KEY = "AIzaSyDbXyJpW351DfqEyxwrsc4zZUNLcltaGQE";
const FIREBASE_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_API_KEY) || FALLBACK_KEY;
const FIREBASE_PROJECT =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "jamb-tutor";

async function probe(name, url, { method = "GET", timeout = 6000, cors = true, headers = {} } = {}) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      mode: cors ? "cors" : "no-cors",
      headers,
    });
    clearTimeout(timer);
    return {
      name,
      // Any HTTP response (incl. opaque no-cors) = host reachable
      ok: true,
      status: cors ? res.status : 0,
      ms: Date.now() - start,
      error: null,
      http: cors ? res.status : "opaque",
    };
  } catch (e) {
    const isTimeout = e.name === "AbortError";
    return {
      name,
      ok: false,
      status: null,
      ms: Date.now() - start,
      error: isTimeout ? "TIMEOUT" : e.message || e.name,
      http: null,
      kind: isTimeout ? "timeout" : "network",
    };
  }
}

export async function deepDiagnostic() {
  const results = [];

  const tests = [
    // General internet (no-cors: opaque response = reachable)
    { name: "Internet (google.com)", opts: { url: "https://www.google.com/generate_204", cors: false, timeout: 6000 } },
    { name: "Google Fonts", opts: { url: "https://fonts.googleapis.com/css2?family=Inter", timeout: 6000 } },

    // Firebase Auth (login works if these pass)
    { name: "Auth (identitytoolkit)", opts: { url: `https://identitytoolkit.googleapis.com/v1/projects?key=${FIREBASE_KEY}`, timeout: 8000 } },
    { name: "Auth (www.googleapis)", opts: { url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${FIREBASE_KEY}`, timeout: 8000 } },

    // Token refresh (session persistence depends on this)
    { name: "Secure Token (session refresh)", opts: { url: `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_KEY}`, method: "POST", timeout: 8000 } },

    // Firestore (data sync depends on this)
    { name: "Firestore (data sync)", opts: { url: `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/stats/global?key=${FIREBASE_KEY}`, timeout: 8000 } },

    // Workbox CDN — the service worker depends on this host
    { name: "Storage (offline/Workbox)", opts: { url: "https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js", timeout: 6000 } },

    // Firebase CDN
    { name: "Google CDN (gstatic)", opts: { url: "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js", timeout: 6000 } },

    // AI features
    { name: "Groq (AI features)", opts: { url: "https://api.groq.com/openai/v1/models", timeout: 8000 } },
  ];

  for (const t of tests) {
    const { url, ...opts } = t.opts;
    results.push(await probe(t.name, url, opts));
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const netInfo = {
    onLine: navigator.onLine,
    effectiveType: connection?.effectiveType || "unknown",
    downlink: connection?.downlink || "unknown",
    rtt: connection?.rtt || "unknown",
  };

  return { results, netInfo, diagnosis: diagnose(results) };
}

// ─── Classification ───────────────────────────────────────────
function diagnose(results) {
  const get = (needle) => results.find(r => r.name.includes(needle));
  const blocked = results.filter(r => !r.ok);
  const authOk = !!get("identitytoolkit")?.ok;
  const tokenOk = !!get("Secure Token")?.ok;
  const firestoreOk = !!get("Firestore")?.ok;
  const fontsOk = !!get("Google Fonts")?.ok;
  const storageOk = !!get("Storage")?.ok;

  if (blocked.length === 0) {
    return {
      level: "ok",
      title: "All endpoints reachable — network looks fine",
      advice: "DNS, TLS and every Firebase/AI host responded. If the app still misbehaves, use 'Clear Cache & Reload'.",
    };
  }

  if (blocked.length === results.length) {
    return {
      level: "critical",
      title: "ALL endpoints blocked — no internet route to Google/API hosts",
      advice: "Your network is blocking everything the app needs. Switch to mobile data or a different WiFi network, then retest.",
    };
  }

  if (authOk && (!tokenOk || !firestoreOk)) {
    return {
      level: "critical",
      title: "Partial Google blocking — login works, but sessions & data will NOT sync",
      advice:
        "Your ISP is filtering specific Google hosts (securetoken/firestore blocked while identitytoolkit passes). " +
        "Effect: you can sign in, but the session expires after ~1 hour and answers/XP won't save. " +
        "Fix: switch to mobile data or another WiFi, or disable any VPN/proxy. The app will auto-sync once reachable.",
    };
  }

  if (!fontsOk || !storageOk || !get("gstatic")?.ok) {
    return {
      level: "warn",
      title: "Some Google CDN hosts blocked — styling/offline mode may degrade",
      advice: "Core Firebase works, but fonts or the offline cache may fail. Switch networks if pages look unstyled.",
    };
  }

  if (!authOk) {
    return {
      level: "critical",
      title: "Firebase Auth endpoints blocked — sign-in will fail",
      advice: "Switch to mobile data or a different WiFi network, and disable any VPN/proxy.",
    };
  }

  return {
    level: "warn",
    title: `${blocked.length} endpoint(s) unreachable`,
    advice: `Blocked: ${blocked.map(r => r.name).join(", ")}. Try another network and retest.`,
  };
}
