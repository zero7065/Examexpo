// src/lib/compliance.js — data export + account deletion (NDPR).
// Deletion is two-phase: soft-delete now (flag + anonymize, immediate sign-out),
// hard purge after 30 days via the scheduled Cloud Function (functions/index.js).
import {
  doc, collection, query, where, getDocs, writeBatch, getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, getAppStorage } from "../firebaseConfig";

const EXPORT_KEY_PREFIX = "exampadi_export_at_";
const EXPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Collections holding per-user data (top-level, keyed by userId field,
// except users/aiMemory/studyPlans which are keyed by doc id).
const USER_DATA_COLLECTIONS = [
  "sessions",
  "mockExams",
  "notes",
  "activityLog",
  "feedback",
];

export function exportAllowedAt(uid) {
  try {
    const at = Number(localStorage.getItem(EXPORT_KEY_PREFIX + uid) || 0);
    return at + EXPORT_COOLDOWN_MS <= Date.now();
  } catch {
    return true;
  }
}

export function markExported(uid) {
  try {
    localStorage.setItem(EXPORT_KEY_PREFIX + uid, String(Date.now()));
  } catch { /* persistence best-effort */ }
}

// Aggregate everything we hold about a user into one JSON object.
export async function exportUserData(uid) {
  if (!uid || !db) throw new Error("Not available offline");
  const out = { exportedAt: new Date().toISOString(), uid };

  const userSnap = await getDoc(doc(db, "users", uid));
  out.profile = userSnap.exists() ? userSnap.data() : null;

  for (const col of USER_DATA_COLLECTIONS) {
    const snap = await getDocs(query(collection(db, col), where("userId", "==", uid)));
    out[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  for (const col of ["aiMemory", "studyPlans"]) {
    try {
      const s = await getDoc(doc(db, col, uid));
      out[col] = s.exists() ? s.data() : null;
    } catch {
      out[col] = null;
    }
  }
  return out;
}

export function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Phase 1 — soft delete: flag + anonymize profile, schedule purge, keep auth
// until the caller signs out / deletes the auth record.
export async function softDeleteAccount(uid) {
  if (!uid || !db) throw new Error("Not available offline");
  const batch = writeBatch(db);
  batch.set(doc(db, "users", uid), {
    deletedAt: serverTimestamp(),
    deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    name: "Deleted User",
    photoURL: null,
    avatarPreset: null,
  }, { merge: true });
  // Anonymize display names cached in partner-facing docs is handled at purge.
  await batch.commit();
  // Best-effort avatar file removal now (profile must not leak the photo)
  try {
    await deleteObject(ref(getAppStorage(), `avatars/${uid}/profile.jpg`));
  } catch { /* file may not exist */ }
}

// Phase 2 — hard purge runs in functions/index.js (scheduled, Admin SDK):
// it deletes users/{uid}, all USER_DATA_COLLECTIONS docs, aiMemory/{uid},
// studyPlans/{uid} and the avatar file for accounts past deletionScheduledAt.
// The client never hard-deletes directly (no admin privileges).
