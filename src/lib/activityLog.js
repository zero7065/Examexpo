import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

let logCache = [];
let logTimer = null;

export async function logActivity({ action, userId, email, details }) {
  const entry = { action, userId, email, details: details || {}, timestamp: serverTimestamp() };
  logCache.push(entry);
  if (db) {
    try {
      await addDoc(collection(db, "activityLog"), entry);
    } catch (e) {
      console.warn("Activity log failed:", e);
    }
  }
  if (!logTimer) {
    logTimer = setTimeout(() => { logCache = []; logTimer = null; }, 5000);
  }
}

export function getAdminUids() {
  const raw = import.meta.env.VITE_ADMIN_UIDS || "";
  return raw.split(",").filter(Boolean).map(s => s.trim());
}

export function isAdmin(user) {
  if (!user) return false;
  const adminUids = getAdminUids();
  if (adminUids.includes(user.uid)) return true;
  return user.email === "admin@exampadi.com";
}
