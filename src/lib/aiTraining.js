import { collection, addDoc, getDocs, query, where, orderBy, limit, getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION = "aiTrainingData";

export async function logTrainingEntry({ userId, userEmail, type, systemPrompt, messages, metadata = {} }) {
  if (!db || !userId) return;
  try {
    await addDoc(collection(db, COLLECTION), {
      userId,
      userEmail,
      type,
      systemPrompt,
      messages,
      metadata,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    try {
      const queue = JSON.parse(localStorage.getItem("aiTrainingQueue") || "[]");
      queue.push({ userId, userEmail, type, systemPrompt, messages, metadata, createdAt: new Date().toISOString() });
      localStorage.setItem("aiTrainingQueue", JSON.stringify(queue.slice(-200)));
    } catch { /* storage full */ }
  }
}

export async function flushTrainingQueue() {
  if (!db) return;
  try {
    const queue = JSON.parse(localStorage.getItem("aiTrainingQueue") || "[]");
    if (queue.length === 0) return;
    for (const entry of queue) {
      await addDoc(collection(db, COLLECTION), entry);
    }
    localStorage.removeItem("aiTrainingQueue");
  } catch { /* will retry later */ }
}

export async function getTrainingEntries({ userId, type, since, until, limitCount = 100 }) {
  if (!db) return [];
  try {
    const constraints = [];
    if (userId) constraints.push(where("userId", "==", userId));
    if (type) constraints.push(where("type", "==", type));
    if (since) constraints.push(where("createdAt", ">=", since));
    if (until) constraints.push(where("createdAt", "<=", until));
    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(limitCount));
    const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("[aiTraining] fetch failed:", e.message);
    return [];
  }
}

export async function getTrainingEntryById(id) {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch {
    return null;
  }
}

export function formatTrainingEntryForFinetuning(entry) {
  return {
    type: entry.type,
    messages: entry.messages,
    metadata: entry.metadata,
    createdAt: entry.createdAt,
  };
}
