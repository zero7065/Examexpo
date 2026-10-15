// src/lib/rooms.js — lightweight shared study rooms.
//
// A room = a code + a fixed question set + live per-member progress.
// Creator generates questions once; joiners pull the same set and report
// progress into the room doc (live via onSnapshot). No presence infra.
//
// Moderation: user-created rooms start status "pending" — only the host can
// enter. They appear on the site (public listing / joinable) after an admin
// approves them (status "approved").
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit,
  serverTimestamp, onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getQuestionsFromBank } from "../data/questions/compat";

function needDb() {
  if (!db) throw new Error("Not available offline");
}

function makeCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `ROOM-${s}`;
}

export async function createRoom({ subject, count = 10, exam = "JAMB", hostUid, hostName }) {
  needDb();
  const questions = getQuestionsFromBank({ subject, count, exam });
  if (questions.length === 0) throw new Error("No questions available for this subject yet");
  const code = makeCode();
  await setDoc(doc(db, "studyRooms", code), {
    code,
    subject,
    exam,
    hostUid,
    hostName: String(hostName || "Host").slice(0, 60),
    status: "pending",
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer || q.answer,
      topic: q.topic || "",
      explanation: q.explanation || "",
    })),
    progress: { [hostUid]: { name: hostName || "Host", answered: 0, correct: 0, total: questions.length, updatedAt: serverTimestamp() } },
    createdAt: serverTimestamp(),
  });
  return { code, total: questions.length };
}

export async function joinRoom(code, { uid, name }) {
  needDb();
  const clean = String(code || "").trim().toUpperCase();
  const ref = doc(db, "studyRooms", clean);
  // Pending rooms are unreadable to non-hosts → getDoc may be denied.
  const snap = await getDoc(ref).catch(() => null);
  if (!snap || !snap.exists()) {
    throw new Error("Room not found — or it's still awaiting admin approval.");
  }
  const room = snap.data();
  if (room.status !== "approved" && room.hostUid !== uid) {
    throw new Error("This room is awaiting admin approval — the host can play now, others once approved.");
  }
  await updateDoc(ref, {
    [`progress.${uid}`]: {
      name: String(name || "Student").slice(0, 60),
      answered: 0,
      correct: 0,
      total: (room.questions || []).length,
      updatedAt: serverTimestamp(),
    },
  });
  return { id: snap.id, ...room };
}

export async function reportRoomProgress(code, { uid, name, answered, correct, total }) {
  needDb();
  await updateDoc(doc(db, "studyRooms", code), {
    [`progress.${uid}`]: { name, answered, correct, total, updatedAt: serverTimestamp() },
  }).catch(() => {});
}

export function subscribeRoom(code, cb) {
  const unsub = onSnapshot(doc(db, "studyRooms", code), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, () => cb(null));
  return unsub;
}

export async function findRoom(code) {
  needDb();
  const snap = await getDoc(doc(db, "studyRooms", String(code || "").trim().toUpperCase()));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Real-time public listing: only approved rooms appear on the site.
export function subscribeApprovedRooms(cb, max = 20) {
  if (!db) { cb([]); return () => {}; }
  return onSnapshot(
    query(collection(db, "studyRooms"), where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(max)),
    (snap) => cb(snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, code: data.code, subject: data.subject, exam: data.exam, hostName: data.hostName, createdAt: data.createdAt };
    })),
    () => cb([])
  );
}

// Real-time admin moderation queue for one status (pending/approved/rejected).
export function subscribeRoomQueue(status, cb, max = 40) {
  if (!db) { cb([]); return () => {}; }
  return onSnapshot(
    query(collection(db, "studyRooms"), where("status", "==", status), orderBy("createdAt", "desc"), limit(max)),
    (snap) => cb(snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id, code: data.code, subject: data.subject, exam: data.exam,
        hostName: data.hostName, hostUid: data.hostUid, status: data.status,
        memberCount: Object.keys(data.progress || {}).length, createdAt: data.createdAt,
      };
    })),
    () => cb([])
  );
}

export async function setRoomStatus(code, status, adminUid, adminEmail) {
  needDb();
  const clean = String(code || "").trim().toUpperCase();
  await updateDoc(doc(db, "studyRooms", clean), {
    status,
    moderatedAt: serverTimestamp(),
    moderatedBy: adminUid || null,
  });
  const { logActivity } = await import("./activityLog");
  await logActivity({
    action: "room_moderated", userId: adminUid, email: adminEmail,
    details: { roomCode: clean, status },
  }).catch(() => {});
}

export async function deleteRoom(code, adminUid, adminEmail) {
  needDb();
  const clean = String(code || "").trim().toUpperCase();
  await deleteDoc(doc(db, "studyRooms", clean));
  const { logActivity } = await import("./activityLog");
  await logActivity({
    action: "room_deleted", userId: adminUid, email: adminEmail,
    details: { roomCode: clean },
  }).catch(() => {});
}
