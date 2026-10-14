// src/lib/rooms.js — lightweight shared study rooms.
//
// A room = a code + a fixed question set + live per-member progress.
// Creator generates questions once; joiners pull the same set and report
// progress into the room doc (live via onSnapshot). No presence infra.
import {
  doc, setDoc, getDoc, updateDoc,
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
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Room not found — check the code");
  const room = snap.data();
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
