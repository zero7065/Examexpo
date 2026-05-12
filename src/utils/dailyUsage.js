// src/utils/dailyUsage.js - Fully offline with localStorage

const FREE_LIMIT = 30;
const AI_FREE_LIMIT = 30;

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getUsageKey(type) {
  return `exampadi_daily_${type}`;
}

function getUsage(type) {
  const key = getUsageKey(type);
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

function saveUsage(type, data) {
  const key = getUsageKey(type);
  localStorage.setItem(key, JSON.stringify(data));
}

export function checkAILimit(uid, isPro) {
  if (isPro) return { allowed: true, used: 0, limit: Infinity };
  
  const usage = getUsage("all");
  const used = usage.aiTutorUsed || 0;
  
  if (used >= AI_FREE_LIMIT) {
    return { allowed: false, used, limit: AI_FREE_LIMIT };
  }
  
  return { allowed: true, used, limit: AI_FREE_LIMIT };
}

export function incrementAILimit() {
  const usage = getUsage("all");
  usage.aiTutorUsed = (usage.aiTutorUsed || 0) + 1;
  saveUsage("all", usage);
  return { allowed: true, used: usage.aiTutorUsed, limit: AI_FREE_LIMIT };
}

export function checkQuestionLimit(uid, isPro) {
  if (isPro) return { allowed: true, used: 0, limit: Infinity };
  
  const usage = getUsage("all");
  const used = usage.questionsUsed || 0;
  
  if (used >= FREE_LIMIT) {
    return { allowed: false, used, limit: FREE_LIMIT };
  }
  
  return { allowed: true, used, limit: FREE_LIMIT };
}

export function incrementQuestionLimit() {
  const usage = getUsage("all");
  usage.questionsUsed = (usage.questionsUsed || 0) + 1;
  saveUsage("all", usage);
  return { allowed: true, used: usage.questionsUsed, limit: FREE_LIMIT };
}

export function getDailyStats() {
  const usage = getUsage("all");
  return {
    questionsUsed: usage.questionsUsed || 0,
    aiTutorUsed: usage.aiTutorUsed || 0,
    questionLimit: FREE_LIMIT,
    aiTutorLimit: AI_FREE_LIMIT,
  };
}

export function resetDailyUsage() {
  const today = getToday();
  saveUsage("all", { date: today, questionsUsed: 0, aiTutorUsed: 0 });
}

// Backward compatible exports for old code
export async function checkAndIncrementUsage(uid, isPro) {
  const result = checkQuestionLimit(uid, isPro);
  if (result.allowed) {
    incrementQuestionLimit();
  }
  return result;
}

export async function checkAndIncrementAILimit(uid, isPro) {
  const result = checkAILimit(uid, isPro);
  if (result.allowed) {
    incrementAILimit();
  }
  return result;
}