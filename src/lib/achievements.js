// Event-based achievement unlocks (for achievements without stat conditions).
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Active-member badge: streak fire or recent activity dot.
// Returns { label, color } or null.
export function getActiveBadge(profile) {
  if (!profile) return null;
  const streak = profile.streak || profile.currentStreak || 0;
  if (streak >= 7) return { label: "🔥 Active", color: "#FF9F43" };
  const last = profile.lastActive?.toDate
    ? profile.lastActive.toDate().getTime()
    : profile.lastActive
      ? new Date(profile.lastActive).getTime()
      : 0;
  if (last && Date.now() - last < 48 * 60 * 60 * 1000) {
    return { label: "🟢 Active", color: "var(--success)" };
  }
  return null;
}

// Unlocks `id` for uid if not already unlocked. Returns true when newly unlocked.
export async function unlockAchievement(uid, id) {
  if (!uid || !db) return false;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    const existing = snap.exists() ? snap.data().achievements || [] : [];
    if (existing.includes(id)) return false;
    await updateDoc(doc(db, "users", uid), { achievements: arrayUnion(id) });
    return true;
  } catch {
    return false;
  }
}
