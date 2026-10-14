import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION = "aiSessions";

export async function createAISession(userId, subject = "General") {
  if (!db) return null;
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    subject,
    title: `Chat — ${subject}`,
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAISessions(userId) {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, COLLECTION), where("userId", "==", userId), orderBy("updatedAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAISession(sessionId) {
  if (!db) return null;
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, COLLECTION, sessionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function appendToAISession(sessionId, messages) {
  if (!db || !sessionId) return;
  const ref = doc(db, COLLECTION, sessionId);
  await updateDoc(ref, {
    messages,
    updatedAt: serverTimestamp(),
  });
}

export async function renameAISession(sessionId, title) {
  if (!db || !sessionId) return;
  const ref = doc(db, COLLECTION, sessionId);
  await updateDoc(ref, { title, updatedAt: serverTimestamp() });
}

export async function deleteAISession(sessionId) {
  if (!db || !sessionId) return;
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, COLLECTION, sessionId));
}
