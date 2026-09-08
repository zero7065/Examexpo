import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../firebase";
import { PLANS } from "../config/plans";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export async function trackQuestion(userId) {
  if (!db || !userId) return false;
  try {
    const usageRef = doc(db, "users", userId);
    const snapshot = await getDoc(usageRef);
    if (!snapshot.exists()) return false;

    const data = snapshot.data();
    const today = getToday();
    const lastDate = data.lastUsageDate || "";

    if (lastDate !== today) {
      await updateDoc(usageRef, {
        lastUsageDate: today,
        questionsToday: 1,
      });
    } else {
      await updateDoc(usageRef, {
        questionsToday: increment(1),
      });
    }
    return true;
  } catch (e) {
    console.warn("Failed to track question:", e);
    return false;
  }
}

export async function checkQuestionLimit(userId) {
  if (!db || !userId) return { allowed: true, used: 0, limit: Infinity };

  try {
    const snapshot = await getDoc(doc(db, "users", userId));
    if (!snapshot.exists()) return { allowed: true, used: 0, limit: Infinity };

    const data = snapshot.data();
    const sub = data.subscription;
    const isPro = sub?.status === "active";

    if (isPro) return { allowed: true, used: 0, limit: Infinity };

    const today = getToday();
    const lastDate = data.lastUsageDate || "";
    const questionsToday = lastDate === today ? (data.questionsToday || 0) : 0;
    const limit = PLANS.free.limits.questionsPerDay;

    return {
      allowed: questionsToday < limit,
      used: questionsToday,
      limit,
    };
  } catch {
    return { allowed: true, used: 0, limit: Infinity };
  }
}

export async function trackAIMessage(userId) {
  if (!db || !userId) return false;
  try {
    const usageRef = doc(db, "users", userId);
    const snapshot = await getDoc(usageRef);
    if (!snapshot.exists()) return false;

    const data = snapshot.data();
    const today = getToday();
    const lastDate = data.lastAIDate || "";

    if (lastDate !== today) {
      await updateDoc(usageRef, {
        lastAIDate: today,
        aiMessagesToday: 1,
      });
    } else {
      await updateDoc(usageRef, {
        aiMessagesToday: increment(1),
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function checkAILimit(userId) {
  if (!db || !userId) return { allowed: true, used: 0, limit: Infinity };

  try {
    const snapshot = await getDoc(doc(db, "users", userId));
    if (!snapshot.exists()) return { allowed: true, used: 0, limit: Infinity };

    const data = snapshot.data();
    const sub = data.subscription;
    const isPro = sub?.status === "active";

    if (isPro) return { allowed: true, used: 0, limit: Infinity };

    const today = getToday();
    const lastDate = data.lastAIDate || "";
    const aiToday = lastDate === today ? (data.aiMessagesToday || 0) : 0;
    const limit = PLANS.free.limits.aiTutorMessages;

    return {
      allowed: aiToday < limit,
      used: aiToday,
      limit,
    };
  } catch {
    return { allowed: true, used: 0, limit: Infinity };
  }
}