import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ASSIGNMENTS = "teacherAssignments";
const ANNOUNCEMENTS = "teacherAnnouncements";

export async function createAssignment({ teacherId, teacherName, title, questions, studentIds, dueDate, subject }) {
  if (!db) throw new Error("Database not available");
  const ref = await addDoc(collection(db, ASSIGNMENTS), {
    teacherId,
    teacherName,
    title,
    questions,
    studentIds,
    dueDate,
    subject,
    createdAt: serverTimestamp(),
    status: "active",
  });
  return ref.id;
}

export async function listAssignmentsForTeacher(teacherId) {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, ASSIGNMENTS), where("teacherId", "==", teacherId), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listAssignmentsForStudent(userId) {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, ASSIGNMENTS), where("studentIds", "array-contains", userId), where("status", "==", "active")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function submitAssignment(assignmentId, studentId, answers) {
  if (!db) return;
  const ref = doc(db, ASSIGNMENTS, assignmentId);
  const existing = await getDocs(query(collection(db, ASSIGNMENTS), where("__name__", "==", assignmentId)));
  if (!existing.empty) {
    const data = existing.docs[0].data();
    const submissions = data.submissions || {};
    submissions[studentId] = { answers, submittedAt: serverTimestamp() };
    await updateDoc(ref, { submissions });
  }
}

export async function createAnnouncement({ teacherId, teacherName, title, body, targetStudentIds = [], schoolId }) {
  if (!db) throw new Error("Database not available");
  const ref = await addDoc(collection(db, ANNOUNCEMENTS), {
    teacherId,
    teacherName,
    title,
    body,
    targetStudentIds,
    schoolId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listAnnouncementsForSchool(schoolId) {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, ANNOUNCEMENTS), where("schoolId", "==", schoolId), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listAnnouncementsForStudent(userId, schoolId) {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, ANNOUNCEMENTS), where("schoolId", "==", schoolId), orderBy("createdAt", "desc")));
  return snap.docs.filter((d) => {
    const data = d.data();
    return data.targetStudentIds.length === 0 || data.targetStudentIds.includes(userId);
  }).map((d) => ({ id: d.id, ...d.data() }));
}
