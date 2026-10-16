import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION = "teacherInvites";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TEACH-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += "-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createTeacherInvite({ schoolId = null, schoolName, createdBy, createdByName, expiresInDays = 30 }) {
  if (!db) throw new Error("Database not available");
  const code = generateCode();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const ref = await addDoc(collection(db, COLLECTION), {
    code,
    schoolId,
    schoolName,
    createdBy,
    createdByName,
    expiresAt,
    used: false,
    usedBy: null,
    usedAt: null,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, code, schoolId, schoolName, expiresAt };
}

export async function listTeacherInvites() {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, COLLECTION), where("used", "==", false)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function redeemTeacherInvite(code, userId) {
  if (!db) throw new Error("Database not available");
  const snap = await getDocs(query(collection(db, COLLECTION), where("code", "==", code.toUpperCase())));
  if (snap.empty) throw new Error("Invalid invite code");
  const invite = { id: snap.docs[0].id, ...snap.docs[0].data() };
  if (invite.used) throw new Error("This invite code has already been used");
  if (new Date(invite.expiresAt) < new Date()) throw new Error("This invite code has expired");
  await updateDoc(doc(db, COLLECTION, invite.id), {
    used: true,
    usedBy: userId,
    usedAt: serverTimestamp(),
  });
  return invite;
}

export async function revokeTeacherInvite(id) {
  if (!db) return;
  await deleteDoc(doc(db, COLLECTION, id));
}
