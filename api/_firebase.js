// api/_firebase.js — cached Firebase Admin connection for serverless.
//
// Vercel keeps this module in memory across warm invocations, so we parse the
// service-account JSON and initialize the app ONCE per container instead of on
// every request. All server-side Firestore access should go through here.
import admin from "firebase-admin";

let cached = null;

// Returns { admin, db } or null when no service account is configured.
export function getFirebase() {
  if (cached) return cached;

  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) return null;

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(sa)),
      });
    }
    cached = { admin, db: admin.firestore() };
    return cached;
  } catch (e) {
    console.error("[firebase] init failed:", e?.message);
    // Never cache a failed init — the next request retries.
    return null;
  }
}
