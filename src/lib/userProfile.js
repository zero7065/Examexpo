import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export async function createUserProfile(uid, data) {
  if (!db || !uid) return;
  const userDoc = doc(db, "users", uid);
  await setDoc(userDoc, {
    ...data,
    onboarded: true,
    lastActive: serverTimestamp(),
  }, { merge: true }).catch((e) => console.warn("createUserProfile:", e?.message));
}

export async function getUserProfile(uid) {
  if (!db || !uid) return null;
  const userDoc = doc(db, "users", uid);
  const snapshot = await getDoc(userDoc).catch(() => null);
  if (snapshot && snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
}

export async function updateUserProfile(uid, data) {
  if (!db || !uid) return;
  const userDoc = doc(db, "users", uid);
  await updateDoc(userDoc, {
    ...data,
    updatedAt: serverTimestamp(),
  }).catch((e) => console.warn("updateUserProfile:", e?.message));
}

export async function updateStreak(uid) {
  if (!db || !uid) return;
  const userDoc = doc(db, "users", uid);
  const snapshot = await getDoc(userDoc).catch(() => null);
  if (!snapshot || !snapshot.exists()) return;
  const userData = snapshot.data();
  const lastActive = userData.lastActive?.toDate ? userData.lastActive.toDate() : null;
  if (!lastActive) {
    await updateDoc(userDoc, { streak: 1, lastActive: serverTimestamp() }).catch(() => {});
    return;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastActiveDay.getTime() === today.getTime()) return;
  if (lastActiveDay.getTime() === yesterday.getTime()) {
    await updateDoc(userDoc, { streak: (userData.streak || 0) + 1, lastActive: serverTimestamp() }).catch(() => {});
  } else {
    await updateDoc(userDoc, { streak: 1, lastActive: serverTimestamp() }).catch(() => {});
  }
}
