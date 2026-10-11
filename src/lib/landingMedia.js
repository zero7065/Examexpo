// src/lib/landingMedia.js — landing image slots with graceful fallback.
// Priority per slot: Firestore siteContent/landing URL (admin-managed)
// → bundled /images/app-*.png (Playwright captures)
// → code-drawn mockup (rendered by LandingMedia when all sources fail).
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const LANDING_SLOTS = ["hero", "practice", "cbt", "dashboard", "aiTutor"];

export const BUNDLED_SHOTS = {
  hero: "/images/app-practice.png",
  practice: "/images/app-practice.png",
  cbt: "/images/app-cbt.png",
  dashboard: "/images/app-dashboard.png",
  aiTutor: "/images/app-aitutor.png",
};

let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 10 * 60 * 1000;

export async function getLandingMedia() {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;
  try {
    const snap = await getDoc(doc(db, "siteContent", "landing"));
    _cache = snap.exists() ? snap.data() || {} : {};
  } catch (_) {
    try {
      const raw = localStorage.getItem("exampadi_landing_media");
      _cache = raw ? JSON.parse(raw) : {};
    } catch (_) {
      _cache = {};
    }
  }
  _cacheAt = Date.now();
  try {
    localStorage.setItem("exampadi_landing_media", JSON.stringify(_cache));
  } catch (_) {}
  return _cache;
}

// Ordered candidate URLs for a slot (admin URL first, bundled second).
export async function getSlotSources(slot) {
  const media = await getLandingMedia();
  const sources = [];
  if (media && media[slot]) sources.push(media[slot]);
  if (BUNDLED_SHOTS[slot]) sources.push(BUNDLED_SHOTS[slot]);
  return sources;
}
