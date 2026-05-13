// src/utils/dailyUsage.js - Fully offline with localStorage
// Added fingerprinting for better user identification

const FREE_LIMIT = 30;
const AI_FREE_LIMIT = 30;

async function getDeviceId() {
  try {
    const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default;
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.warn('FingerprintJS failed, falling back to random ID:', error);
    // Fallback to a random ID if fingerprinting fails
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getUsageKey(type, identifier) {
  return `exampadi_daily_${type}_${identifier}`;
}

async function getUsage(type, identifier) {
  const key = getUsageKey(type, identifier);
  const data = localStorage.getItem(key);
  const today = getToday();
  
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.date === today) {
        return parsed;
      }
    } catch {
      // Ignore
    }
  }
  
  return { date: today, questionsUsed: 0, aiTutorUsed: 0 };
}

async function saveUsage(type, identifier, data) {
  const key = getUsageKey(type, identifier);
  localStorage.setItem(key, JSON.stringify(data));
}

export async function checkAILimit(uid, isPro) {
  if (isPro) return { allowed: true, used: 0, limit: Infinity };
  
  // For free users, use device ID instead of user ID for better persistence
  const identifier = isPro ? uid : await getDeviceId();
  const usage = await getUsage("all", identifier);
  const used = usage.aiTutorUsed || 0;
  
  if (used >= AI_FREE_LIMIT) {
    return { allowed: false, used, limit: AI_FREE_LIMIT };
  }
  
  return { allowed: true, used, limit: AI_FREE_LIMIT };
}

export async function incrementAILimit(uid, isPro) {
  // For free users, use device ID instead of user ID for better persistence
  const identifier = isPro ? uid : await getDeviceId();
  const usage = await getUsage("all", identifier);
  usage.aiTutorUsed = (usage.aiTutorUsed || 0) + 1;
  await saveUsage("all", identifier, usage);
  return { allowed: true, used: usage.aiTutorUsed, limit: AI_FREE_LIMIT };
}

export async function checkQuestionLimit(uid, isPro) {
  if (isPro) return { allowed: true, used: 0, limit: Infinity };
  
  // For free users, use device ID instead of user ID for better persistence
  const identifier = isPro ? uid : await getDeviceId();
  const usage = await getUsage("all", identifier);
  const used = usage.questionsUsed || 0;
  
  if (used >= FREE_LIMIT) {
    return { allowed: false, used, limit: FREE_LIMIT };
  }
  
  return { allowed: true, used, limit: FREE_LIMIT };
}

export async function incrementQuestionLimit(uid, isPro) {
  // For free users, use device ID instead of user ID for better persistence
  const identifier = isPro ? uid : await getDeviceId();
  const usage = await getUsage("all", identifier);
  usage.questionsUsed = (usage.questionsUsed || 0) + 1;
  await saveUsage("all", identifier, usage);
  return { allowed: true, used: usage.questionsUsed, limit: FREE_LIMIT };
}

export async function getDailyStats(uid, isPro) {
  // For free users, use device ID instead of user ID for better persistence
  const identifier = isPro ? uid : await getDeviceId();
  const usage = await getUsage("all", identifier);
  return {
    questionsUsed: usage.questionsUsed || 0,
    aiTutorUsed: usage.aiTutorUsed || 0,
    questionLimit: FREE_LIMIT,
    aiTutorLimit: AI_FREE_LIMIT,
  };
}

export async function resetDailyUsage(uid, isPro) {
  // For free users, use device ID instead of user ID for better persistence
  const identifier = isPro ? uid : await getDeviceId();
  const today = getToday();
  await saveUsage("all", identifier, { date: today, questionsUsed: 0, aiTutorUsed: 0 });
}

// Backward compatible exports for old code
export async function checkAndIncrementUsage(uid, isPro) {
  const result = await checkQuestionLimit(uid, isPro);
  if (result.allowed) {
    await incrementQuestionLimit(uid, isPro);
  }
  return result;
}

export async function checkAndIncrementAILimit(uid, isPro) {
  const result = await checkAILimit(uid, isPro);
  if (result.allowed) {
    await incrementAILimit(uid, isPro);
  }
  return result;
}