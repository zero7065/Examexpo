// src/lib/community.js — reviews (AI-moderated), surveys, updates/notifications.
import {
  doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, limit, serverTimestamp, increment, arrayUnion, arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { askGroq } from "./ai";

function needDb() {
  if (!db) throw new Error("Not available offline");
}

// ─── Reviews ───
// Flow: user submits → status "pending" → AI moderation → approved/rejected.
// Only approved reviews appear on the homepage/feed.
export async function submitReview({ uid, name, rating, text, context = "" }) {
  needDb();
  const clean = String(text || "").trim().slice(0, 500);
  if (!clean) throw new Error("Write your review first");
  const r = Math.min(5, Math.max(1, Math.floor(Number(rating) || 5)));
  if (!uid) throw new Error("Sign in to leave a review");
  const ref = await addDoc(collection(db, "reviews"), {
    uid,
    name: String(name || "Student").slice(0, 60),
    rating: r,
    text: clean,
    context: String(context || "").slice(0, 120),
    status: "pending",
    likes: [],
    likeCount: 0,
    createdAt: serverTimestamp(),
  });
  // Fire-and-forget AI moderation (never blocks the user)
  moderateReview(ref.id, clean, r).catch(() => {});
  return ref.id;
}

// AI gatekeeper: approves genuine, safe, on-topic reviews.
export async function moderateReview(reviewId, text, rating) {
  needDb();
  try {
    const res = await askGroq(
      "You moderate app reviews for a Nigerian exam-prep app. Return ONLY valid JSON.",
      `Review (rating ${rating}/5): "${text}"\nReturn JSON exactly: {"approved": true|false, "reason": "<short>"}. Approve if genuine, safe, and about studying/exams/the app. Reject spam, abuse, hate, personal phone numbers or emails, ads, or gibberish.`,
      { maxTokens: 150, temperature: 0.2 }
    );
    const jsonMatch = String(res).match(/\{[\s\S]*\}/);
    const verdict = jsonMatch ? JSON.parse(jsonMatch[0]) : { approved: true };
    await updateDoc(doc(db, "reviews", reviewId), {
      status: verdict.approved ? "approved" : "rejected",
      modReason: String(verdict.reason || "").slice(0, 200),
      moderatedAt: serverTimestamp(),
    });
    return !!verdict.approved;
  } catch (e) {
    // AI down? Leave pending for admin eyes rather than publishing blindly.
    console.warn("Review moderation deferred:", e?.message);
    return null;
  }
}

export async function listApprovedReviews(max = 24) {
  needDb();
  const snap = await getDocs(
    query(collection(db, "reviews"), where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(max))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function toggleReviewLike(reviewId, uid) {
  needDb();
  const ref = doc(db, "reviews", reviewId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Review not found");
  const likes = snap.data().likes || [];
  if (likes.includes(uid)) {
    await updateDoc(ref, { likes: arrayRemove(uid), likeCount: increment(-1) });
    return false;
  }
  await updateDoc(ref, { likes: arrayUnion(uid), likeCount: increment(1) });
  return true;
}

export async function setReviewStatus(reviewId, status, adminUid, adminEmail) {
  needDb();
  const { logActivity } = await import("./activityLog");
  await updateDoc(doc(db, "reviews", reviewId), { status });
  await logActivity({
    action: "review_moderated", userId: adminUid, email: adminEmail,
    details: { reviewId, status, reason: "admin console" },
  }).catch(() => {});
}

// Helper: should we ask for a review for this session? (once per session id)
export function shouldAskReview(sessionId) {
  try {
    return !localStorage.getItem(`review-asked-${sessionId || "once"}`);
  } catch {
    return true;
  }
}

// ─── Surveys (one active at a time) ───
export async function getActiveSurvey() {
  needDb();
  const snap = await getDocs(query(collection(db, "surveys"), where("active", "==", true), limit(1)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function submitSurveyVote(surveyId, uid, optionIdx, rating = null) {
  needDb();
  await setDoc(doc(db, "surveyVotes", `${surveyId}_${uid}`), {
    surveyId, uid, optionIdx, rating, createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "surveys", surveyId), {
    [`votes.${optionIdx}`]: increment(1),
    totalVotes: increment(1),
  });
}

export async function hasVotedSurvey(surveyId, uid) {
  needDb();
  const snap = await getDoc(doc(db, "surveyVotes", `${surveyId}_${uid}`));
  return snap.exists();
}

export async function upsertSurvey({ question, options, active = true }) {
  needDb();
  const cleanOpts = (options || []).map((o) => String(o).trim()).filter(Boolean).slice(0, 6);
  if (!String(question || "").trim() || cleanOpts.length < 2) {
    throw new Error("Survey needs a question and at least 2 options");
  }
  // Deactivate previous surveys so only one is active
  const prev = await getDocs(query(collection(db, "surveys"), where("active", "==", true)));
  await Promise.all(prev.docs.map((d) => updateDoc(d.ref, { active: false })));
  const ref = await addDoc(collection(db, "surveys"), {
    question: String(question).trim().slice(0, 200),
    options: cleanOpts,
    votes: Object.fromEntries(cleanOpts.map((_, i) => [i, 0])),
    totalVotes: 0,
    active,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Updates / changelog (admin-posted, everyone reads) ───
export async function postUpdate({ title, body, tag = "New" }) {
  needDb();
  if (!String(title || "").trim() || !String(body || "").trim()) {
    throw new Error("Update needs a title and body");
  }
  const ref = await addDoc(collection(db, "updates"), {
    title: String(title).trim().slice(0, 100),
    body: String(body).trim().slice(0, 1000),
    tag: String(tag).slice(0, 20),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listUpdates(max = 20) {
  needDb();
  const snap = await getDocs(query(collection(db, "updates"), orderBy("createdAt", "desc"), limit(max)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteUpdate(id) {
  needDb();
  await deleteDoc(doc(db, "updates", id));
}

// ─── Batch gifts: grant Pro to many users at once (admin) ───
export async function batchGiftPro(uids, { plan = "pro_monthly", days = 30, adminUid, adminEmail, note = "" }) {
  needDb();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  let done = 0;
  for (const uid of uids) {
    try {
      await updateDoc(doc(db, "users", uid), {
        subscription: {
          plan, status: "active", reference: `gift-${Date.now()}-${uid.slice(0, 6)}`,
          startDate: serverTimestamp(), endDate: expiry.toISOString(),
          autoRenew: false, gifted: true,
        },
      });
      done++;
    } catch (e) {
      console.warn("Gift failed for", uid, e?.message);
    }
  }
  const { logActivity } = await import("./activityLog");
  await logActivity({
    action: "batch_gift", userId: adminUid, email: adminEmail,
    details: { plan, days, requested: uids.length, gifted: done, note: String(note).slice(0, 120) },
  }).catch(() => {});
  return done;
}
