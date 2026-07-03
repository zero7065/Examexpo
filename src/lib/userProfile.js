import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function createUserProfile(uid, data) {
  const userDoc = doc(db, "users", uid);
  await setDoc(userDoc, {
    exam: data.exam || null,
    subjects: data.subjects || [],
    streak: 1,
    lastActive: serverTimestamp(),
    xp: 0,
    targetScore: data.targetScore || 280,
    createdAt: serverTimestamp(),
    onboarded: true,
    ...data,
  });
}

export async function getUserProfile(uid) {
  const userDoc = doc(db, "users", uid);
  const snapshot = await getDoc(userDoc);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
}

export async function updateUserProfile(uid, data) {
  const userDoc = doc(db, "users", uid);
  await updateDoc(userDoc, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateStreak(uid) {
  const userDoc = doc(db, "users", uid);
  const snapshot = await getDoc(userDoc);
  
  if (!snapshot.exists()) return;
  
  const userData = snapshot.data();
  const lastActive = userData.lastActive?.toDate ? userData.lastActive.toDate() : null;
  
  if (!lastActive) {
    await updateDoc(userDoc, {
      streak: 1,
      lastActive: serverTimestamp(),
    });
    return;
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastActiveDay.getTime() === today.getTime()) {
    return;
  }
  
  if (lastActiveDay.getTime() === yesterday.getTime()) {
    await updateDoc(userDoc, {
      streak: (userData.streak || 0) + 1,
      lastActive: serverTimestamp(),
    });
  } else {
    await updateDoc(userDoc, {
      streak: 1,
      lastActive: serverTimestamp(),
    });
  }
}