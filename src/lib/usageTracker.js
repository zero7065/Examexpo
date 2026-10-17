// src/lib/usageTracker.js
// Question + AI credit accounting for ExamPadi.
// Single source of truth for per-user daily/monthly/pack AI limits.

import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { PLANS, aiLimitsFor, AI_SOFT_WARNING_PCT, CLASSROOM_AI_PER_STUDENT } from "../config/plans";

// Plans that unlock Pro perks (Classroom members inherit Pro limits).
const PRO_PLAN_IDS = new Set(["pro_monthly", "pro_yearly", "ielts", "team_monthly", "team_yearly"]);
// Classroom plans draw from a shared per-team AI pool instead of a per-user cap.
const TEAM_PLAN_IDS = new Set(["team_monthly", "team_yearly"]);

function activePlanOf(data) {
  const sub = data?.subscription;
  if (sub?.status === "active" && PRO_PLAN_IDS.has(sub.plan)) return sub.plan;
  return "free";
}

// ─── Time helpers (Africa/Lagos = WAT = UTC+1) ───
// All day/month keys use WAT so Nigerian students reset at local midnight,
// not UTC midnight (which is 1am WAT).
const WAT_OFFSET_MS = 60 * 60 * 1000;

function watDate(now = new Date()) {
  return new Date(now.getTime() + WAT_OFFSET_MS);
}

function getToday(now = new Date()) {
  return watDate(now).toISOString().split("T")[0]; // YYYY-MM-DD
}

function getMonthKey(now = new Date()) {
  return watDate(now).toISOString().slice(0, 7); // YYYY-MM
}

// ─── Question tracking ───
export async function trackQuestion(userId) {
  if (!db || !userId) return false;
  try {
    const usageRef = doc(db, "users", userId);
    const snapshot = await getDoc(usageRef);
    if (!snapshot.exists()) return false;

    const data = snapshot.data();
    const today = getToday();
    const lastDate = data.lastUsageDate || "";

    if (lastDate !== today) {
      await updateDoc(usageRef, {
        lastUsageDate: today,
        questionsToday: 1,
      });
    } else {
      await updateDoc(usageRef, {
        questionsToday: increment(1),
      });
    }
    return true;
  } catch (e) {
    console.warn("Failed to track question:", e);
    return false;
  }
}

export async function checkQuestionLimit(userId) {
  if (!db || !userId) return { allowed: true, used: 0, limit: Infinity };

  try {
    const snapshot = await getDoc(doc(db, "users", userId));
    if (!snapshot.exists()) return { allowed: true, used: 0, limit: Infinity };

    const data = snapshot.data();
    const planId = activePlanOf(data);

    if (planId !== "free") return { allowed: true, used: 0, limit: Infinity };

    const today = getToday();
    const lastDate = data.lastUsageDate || "";
    const questionsToday = lastDate === today ? (data.questionsToday || 0) : 0;
    const limit = PLANS.free.limits.questionsPerDay;

    return {
      allowed: questionsToday < limit,
      used: questionsToday,
      limit,
    };
  } catch {
    return { allowed: true, used: 0, limit: Infinity };
  }
}

/** Read the shared AI usage pool for a team/classroom plan. */
async function teamPoolStatus(teamId, monthKey) {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);

  if (!teamSnap.exists()) {
    return { used: 0, limit: 0, exhausted: true };
  }

  const teamData = teamSnap.data();
  const pool = teamData?.aiPool || {};
  const used = Number(pool[monthKey] || 0);
  const seatCount = Math.max(1, Number(teamData?.seatsUsed || 1));
  const limit = seatCount * CLASSROOM_AI_PER_STUDENT;

  return { used, limit, exhausted: used >= limit };
}

// ─── AI credit tracking ───
// Returns a rich object:
//   { allowed, used, limit, remaining, monthUsed, monthLimit, packRemaining,
//     softWarning, hardStop, plan, dailyCap, reason }
export async function checkAILimit(userId) {
  // Fail-open: if db/auth is unavailable, allow the request.
  if (!db || !userId) {
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity, monthUsed: 0, monthLimit: Infinity, packRemaining: 0, softWarning: false, hardStop: false, plan: "free", dailyCap: Infinity, reason: "fail-open", available: null, isFree: true };
  }

  try {
    const snapshot = await getDoc(doc(db, "users", userId));
    if (!snapshot.exists()) {
      return { allowed: true, used: 0, limit: Infinity, remaining: Infinity, monthUsed: 0, monthLimit: Infinity, packRemaining: 0, softWarning: false, hardStop: false, plan: "free", dailyCap: Infinity, reason: "no-user-doc", available: null, isFree: true };
    }

    const data = snapshot.data();
    const planId = activePlanOf(data);
    const limits = aiLimitsFor(planId);
    const packCredits = Number(data.aiPackCredits || 0);
    const isFree = planId === "free";

    const today = getToday();
    const monthKey = getMonthKey();

    // ─── Classroom / School: pooled AI allowance ───
    // 300 messages per seat, shared across every member of the team. Gated on
    // the team doc so no individual student can exhaust the class allowance.
    if (TEAM_PLAN_IDS.has(planId) && data.viaTeam) {
      const pool = await teamPoolStatus(data.viaTeam, monthKey);
      const hardStop = pool.exhausted && packCredits <= 0;
      return {
        allowed: !hardStop,
        used: pool.used,
        limit: pool.limit,
        remaining: Math.max(0, pool.limit - pool.used),
        available: Math.max(0, pool.limit - pool.used) + packCredits,
        monthUsed: pool.used,
        monthLimit: pool.limit,
        packRemaining: packCredits,
        softWarning: !hardStop && pool.used >= Math.floor(pool.limit * AI_SOFT_WARNING_PCT),
        hardStop,
        plan: planId,
        dailyCap: limits.dailyCap || Infinity,
        isFree: false,
        pooled: true,
        reason: hardStop ? "hard-stop" : "ok",
      };
    }

    // Daily counters (reset at WAT midnight)
    const lastAIDay = data.lastAIDay || "";
    const usedToday = lastAIDay === today ? Number(data.aiMessagesDay || 0) : 0;
    const dailyCap = isFree ? (limits.perDay || 3) : (limits.dailyCap || Infinity);

    // Monthly counters (reset at start of WAT month) — paid plans only
    const aiMonth = data.aiMonth || "";
    const monthUsed = aiMonth === monthKey ? Number(data.aiMessagesMonth || 0) : 0;
    const monthLimit = isFree ? 0 : (limits.perMonth || Infinity);

    // Free: gated by daily allowance, pack credits extend past it.
    // Paid: gated by monthly cap, pack credits extend past it.
    // Daily smoothing (dailyCap) applies to paid plans as a pacing guide,
    // but is NOT a hard block (catch-up sessions are allowed).
    const baseReached = isFree ? usedToday >= dailyCap : monthUsed >= monthLimit;
    const packExhausted = packCredits <= 0;
    const hardStop = baseReached && packExhausted;

    // Soft warning: 80% of monthly cap (paid plans only)
    const softWarning = !isFree && !hardStop && monthUsed >= Math.floor(monthLimit * AI_SOFT_WARNING_PCT);

    const baseAvailable = isFree
      ? Math.max(0, dailyCap - usedToday)
      : Math.max(0, monthLimit - monthUsed);

    return {
      allowed: !hardStop,
      used: usedToday,
      limit: dailyCap,
      remaining: Math.max(0, dailyCap - usedToday),
      available: baseAvailable + packCredits,
      monthUsed: isFree ? usedToday : monthUsed,
      monthLimit: isFree ? dailyCap : monthLimit,
      packRemaining: packCredits,
      softWarning,
      hardStop,
      plan: planId,
      dailyCap,
      isFree,
      reason: hardStop ? "hard-stop" : "ok",
    };
  } catch (e) {
    console.warn("[usageTracker] checkAILimit failed (fail-open):", e);
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity, monthUsed: 0, monthLimit: Infinity, packRemaining: 0, softWarning: false, hardStop: false, plan: "free", dailyCap: Infinity, reason: "fail-open", available: null, isFree: true };
  }
}

// Consume one AI message. Increments daily + monthly counters, and if the
// monthly cap is hit, consumes from the pack pool. Logs usage to aiUsageLog.
export async function trackAIMessage(userId, meta = {}) {
  if (!db || !userId) return false;
  try {
    const usageRef = doc(db, "users", userId);
    const snapshot = await getDoc(usageRef);
    if (!snapshot.exists()) return false;

    const data = snapshot.data();
    const today = getToday();
    const monthKey = getMonthKey();
    const lastAIDay = data.lastAIDay || "";
    const aiMonth = data.aiMonth || "";

    const update = {};

    // Daily counter
    if (lastAIDay !== today) {
      update.lastAIDay = today;
      update.aiMessagesDay = 1;
    } else {
      update.aiMessagesDay = increment(1);
    }

    // Monthly counter
    if (aiMonth !== monthKey) {
      update.aiMonth = monthKey;
      update.aiMessagesMonth = 1;
    } else {
      update.aiMessagesMonth = increment(1);
    }

    // Pack consumption: free users drain the pack only past their daily
    // allowance; paid plans drain it only past their monthly cap.
    const planId = activePlanOf(data);
    const limits = aiLimitsFor(planId);
    const isFree = planId === "free";
    const usedToday = lastAIDay === today ? Number(data.aiMessagesDay || 0) : 0;
    const monthUsed = aiMonth === monthKey ? Number(data.aiMessagesMonth || 0) : 0;
    const overBase = isFree
      ? usedToday >= (limits.perDay || 3)
      : monthUsed >= (limits.perMonth || Infinity);
    if (overBase) {
      update.aiPackCredits = increment(-1);
    }

    // Classroom members also drain the shared team pool (300/seat).
    if (TEAM_PLAN_IDS.has(planId) && data.viaTeam) {
      const teamRef = doc(db, 'teams', data.viaTeam);
      const fieldPath = `aiPool.${monthKey}`;
      await updateDoc(teamRef, { [fieldPath]: increment(1) }).catch(() => {});
    }

    await updateDoc(usageRef, update);

    // Fire-and-forget usage log for cost monitoring (do not block UI)
    try {
      await addDoc(collection(db, "aiUsageLog"), {
        userId,
        plan: planId,
        model: meta.model || null,
        tokens: meta.tokens || null,
        source: meta.source || null,
        createdAt: serverTimestamp(),
      });
    } catch {
      // Logging failure should never block AI usage
    }

    return true;
  } catch (e) {
    console.warn("[usageTracker] trackAIMessage failed:", e);
    return false;
  }
}

// Convenience: check + track in one call. Returns check result; if allowed,
// increments counters asynchronously (fire-and-forget for speed).
export async function consumeAIMessage(userId, meta = {}) {
  const check = await checkAILimit(userId);
  if (!check.allowed) {
    return { ...check, consumed: false };
  }
  // Track asynchronously — do not block the AI call on the write
  trackAIMessage(userId, meta).catch(() => {});
  return { ...check, consumed: true };
}
