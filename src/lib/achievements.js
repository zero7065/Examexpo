// Event-based achievement unlocks (for achievements without stat conditions).
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";

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
