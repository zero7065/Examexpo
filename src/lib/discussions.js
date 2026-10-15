// Friend discussions, question sharing, and the public help board.
import {
  doc, setDoc, getDoc, getDocs, addDoc, updateDoc,
  collection, query, where, orderBy, limit, serverTimestamp, onSnapshot, increment,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

function needDb() {
  if (!db) throw new Error("Not available offline");
}

// ─── 1:1 friend threads (keyed by study-pair id) ───
export async function getOrCreateThread(pairId, users) {
  needDb();
  const ref = doc(db, "discussions", pairId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { users, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  return pairId;
}

export async function sendMessage(pairId, { fromUid, fromName, text = "", question = null }) {
  needDb();
  const clean = String(text || "").trim().slice(0, 1000);
  if (!clean && !question) throw new Error("Empty message");
  await addDoc(collection(db, "discussions", pairId, "messages"), {
    fromUid,
    fromName: String(fromName || "Student").slice(0, 60),
    text: clean,
    question: question || null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "discussions", pairId), { updatedAt: serverTimestamp() }).catch(() => {});
}

export function subscribeMessages(pairId, cb) {
  const q = query(collection(db, "discussions", pairId, "messages"), orderBy("createdAt", "asc"), limit(200));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, () => cb([]));
}

// ─── Public help board ───
export async function postHelpRequest({ uid, name, subject, topic, text }) {
  needDb();
  const clean = String(text || "").trim().slice(0, 500);
  if (!clean) throw new Error("Describe what you need help with");
  if (!subject) throw new Error("Pick a subject");
  const ref = await addDoc(collection(db, "helpRequests"), {
    uid,
    name: String(name || "Student").slice(0, 60),
    subject,
    topic: String(topic || "").slice(0, 80),
    text: clean,
    status: "open",
    replyCount: 0,
    createdAt: serverTimestamp(),
  }).catch((e) => {
    console.warn("postHelpRequest failed:", e?.message);
    throw new Error("Could not post help request. Please try again.");
  });
  return ref.id;
}

export async function listHelpRequests(max = 30) {
  needDb();
  const snap = await getDocs(query(collection(db, "helpRequests"), orderBy("createdAt", "desc"), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeHelpRequests(cb, max = 30) {
  const q = query(collection(db, "helpRequests"), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, () => cb([]));
}

export async function replyToRequest(requestId, { uid, name, text }) {
  needDb();
  const clean = String(text || "").trim().slice(0, 1000);
  if (!clean) throw new Error("Write a reply first");
  await addDoc(collection(db, "helpReplies"), {
    requestId,
    uid,
    name: String(name || "Student").slice(0, 60),
    text: clean,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "helpRequests", requestId), { replyCount: increment(1) }).catch(() => {});
}

export function subscribeReplies(requestId, cb) {
  const q = query(collection(db, "helpReplies"), where("requestId", "==", requestId), orderBy("createdAt", "asc"), limit(100));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, () => cb([]));
}

export async function resolveRequest(requestId, uid) {
  needDb();
  const snap = await getDoc(doc(db, "helpRequests", requestId));
  if (!snap.exists()) throw new Error("Request not found");
  if (snap.data().uid !== uid) throw new Error("Only the asker can resolve this");
  await updateDoc(doc(db, "helpRequests", requestId), { status: "resolved" });
}

// ─── Public profiles + top students ───
export async function getPublicProfile(uid) {
  needDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) throw new Error("Profile not found");
  return { uid, ...snap.data() };
}

export async function getTopStudents(max = 10) {
  needDb();
  const snap = await getDocs(query(collection(db, "users"), orderBy("xp", "desc"), limit(50)));
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => u.isPublic)
    .slice(0, max);
}
