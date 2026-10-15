import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION = "aiSessions";

export async function createAISession(userId, subject = "General") {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, COLLECTION), {
      userId,
      subject,
      title: `Chat — ${subject}`,
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.warn("createAISession failed:", e?.message);
    return null;
  }
}

export async function getAISessions(userId) {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, COLLECTION), where("userId", "==", userId), orderBy("updatedAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("getAISessions failed:", e?.message);
    return [];
  }
}

export async function getAISession(sessionId) {
  if (!db) return null;
  try {
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, COLLECTION, sessionId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch {
    return null;
  }
}

export async function appendToAISession(sessionId, messages) {
  if (!db || !sessionId) return;
  try {
    const ref = doc(db, COLLECTION, sessionId);
    await updateDoc(ref, { messages, updatedAt: serverTimestamp() });
  } catch (e) {
    console.warn("appendToAISession failed:", e?.message);
  }
}

export async function renameAISession(sessionId, title) {
  if (!db || !sessionId) return;
  try {
    const ref = doc(db, COLLECTION, sessionId);
    await updateDoc(ref, { title, updatedAt: serverTimestamp() });
  } catch { /* non-critical */ }
}

export async function deleteAISession(sessionId) {
  if (!db || !sessionId) return;
  try {
    await deleteDoc(doc(db, COLLECTION, sessionId));
  } catch (e) {
    console.warn("deleteAISession failed:", e?.message);
  }
}
