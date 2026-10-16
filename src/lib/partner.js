// src/lib/partner.js — School Partner Plan: referral codes + attribution.
// Commissions are recorded SERVER-SIDE only (api/verify-payment.js +
// api/paystack-webhook.js). This module handles code generation,
// URL capture, and user attribution.

import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const REF_STORAGE_KEY = "ep_partner_ref";

// Short human-friendly code from a school doc id + randomness.
export function generatePartnerCode(schoolId) {
  const base = String(schoolId || "").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `EP-${base}${rand}`;
}

export function partnerLink(code) {
  if (!code) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://exampadi.app";
  return `${origin}/auth?ref=${encodeURIComponent(code)}`;
}

// Called by setSchoolStatus(schoolId, "approved") — idempotent.
export async function ensurePartnerEnrolled(schoolId) {
  if (!db || !schoolId) return null;
  const ref = doc(db, "schools", schoolId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.partner?.code) return data.partner.code;
  const code = generatePartnerCode(schoolId);
  await updateDoc(ref, {
    partner: {
      code,
      enrolledAt: serverTimestamp(),
      rate: 0.2,
      totalEarned: 0,
      totalPaid: 0,
      pendingPayout: 0,
      payersCount: 0,
      referredPayers: [],
    },
  });
  return code;
}

// Read ?ref= from the current URL and stash it for attribution.
export function captureRefCodeFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = String(params.get("ref") || "").trim().toUpperCase();
    if (ref.startsWith("EP-") && ref.length <= 20) {
      localStorage.setItem(REF_STORAGE_KEY, ref);
      return ref;
    }
  } catch { /* private mode etc. */ }
  return null;
}

export function readStoredRefCode() {
  try {
    return localStorage.getItem(REF_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function clearStoredRefCode() {
  try {
    localStorage.removeItem(REF_STORAGE_KEY);
  } catch { /* ignore */ }
}

// After sign-in/sign-up: stamp the referral code on the user doc once.
// Never overwrites an existing attribution. Retries briefly — the user doc
// may still be seeding right after registration.
export async function attributePartnerRef(user) {
  if (!db || !user?.uid) return false;
  const code = readStoredRefCode();
  if (!code) return false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      if (snap.data().partnerCode) {
        clearStoredRefCode();
        return false;
      }
      await updateDoc(ref, { partnerCode: code, partnerCodeAttributedAt: serverTimestamp() });
      clearStoredRefCode();
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  return false;
}

// Called at payment time — attaches the payer's attribution to metadata.
export async function getPartnerCodeForPayment(userId) {
  if (!db || !userId) return null;
  try {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? (snap.data().partnerCode || null) : null;
  } catch {
    return null;
  }
}
