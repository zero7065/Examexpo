// src/lib/branding.js — Site branding & contact settings stored in Firestore.
// Read once at app bootstrap; admin can override via /admin (Branding tab).
// No Firebase Storage billing required — only text URLs/settings.
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const BRANDING_DOC = "siteContent/branding";

export const DEFAULT_BRANDING = {
  siteName: "ExamPadi",
  tagline: "Pass JAMB, WAEC & NABTEB First Try",
  backgroundImageUrl: "",
  footerText: "Developed by Jadai Studios",
  contactEmail: "jadai7065@gmail.com",
  contactPhone: "+234 812 763 6057",
  contactWhatsApp: "https://wa.me/2348127636057",
  supportWhatsApp: "+234 812 763 6057",
};

export async function loadBranding() {
  if (!db) return { ...DEFAULT_BRANDING };
  try {
    const snap = await getDoc(doc(db, BRANDING_DOC));
    if (snap.exists()) return { ...DEFAULT_BRANDING, ...snap.data() };
  } catch (e) {
    console.warn("branding load failed:", e.message);
  }
  return { ...DEFAULT_BRANDING };
}

export async function saveBranding(updates) {
  if (!db) throw new Error("Firestore not configured");
  await setDoc(
    doc(db, BRANDING_DOC),
    { ...updates, updatedAt: new Date().toISOString() },
    { merge: true },
  );
  return updates;
}
