const LEVEL_THRESHOLDS = [
  { level: 1, min: 0, max: 99 },
  { level: 2, min: 100, max: 299 },
  { level: 3, min: 300, max: 599 },
  { level: 4, min: 600, max: 999 },
  { level: 5, min: 1000, max: Infinity },
];

const ACTIVITY_XP = {
  practice: 10,
  mock: 25,
  ai_tutor: 5,
  assignment_pass: 30,
  streak_bonus: 15,
  help_friend: 20,
};

function getStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function calculateLevel(totalXp) {
  for (const t of LEVEL_THRESHOLDS) {
    if (totalXp >= t.min && totalXp <= t.max) return t.level;
  }
  return 1;
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

export function getXpProfile(userId) {
  const key = `ep_xp_${userId}`;
  const data = getStorage(key);
  if (data) return data;
  const fresh = { xp: 0, level: 1, highscore: 0, totalXp: 0, activities: [] };
  setStorage(key, fresh);
  return fresh;
}

export function addXp(userId, amount, activity) {
  const profile = getXpProfile(userId);
  const xpGain = amount || ACTIVITY_XP[activity] || 0;

  profile.totalXp += xpGain;
  profile.level = calculateLevel(profile.totalXp);
  profile.xp = profile.totalXp;
  profile.activities.push({
    activity,
    xp: xpGain,
    timestamp: Date.now(),
    date: todayKey(),
  });

  setStorage(`ep_xp_${userId}`, profile);
  updateLeaderboard(userId, getUserName(userId), profile.totalXp);
  return profile;
}

function getUserName(userId) {
  const key = `ep_username_${userId}`;
  return localStorage.getItem(key) || "Student";
}

export function getHighscore(userId) {
  const profile = getXpProfile(userId);
  return profile.highscore;
}

export function updateHighscore(userId, score) {
  const profile = getXpProfile(userId);
  if (score > profile.highscore) {
    profile.highscore = score;
    setStorage(`ep_xp_${userId}`, profile);
  }
  return profile.highscore;
}

export function getLeaderboard() {
  const board = getStorage("ep_leaderboard");
  return (board || [])
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);
}

export function updateLeaderboard(userId, name, xp) {
  const board = getStorage("ep_leaderboard") || [];
  const idx = board.findIndex((e) => e.userId === userId);
  const entry = { userId, name: name || "Student", xp, updatedAt: Date.now() };

  if (idx >= 0) {
    board[idx] = entry;
  } else {
    board.push(entry);
  }

  setStorage("ep_leaderboard", board);
}

export function getDailyXp(userId) {
  const profile = getXpProfile(userId);
  const today = todayKey();
  return profile.activities
    .filter((a) => a.date === today)
    .reduce((sum, a) => sum + a.xp, 0);
}

export function checkDailyLimit(userId) {
  const earned = getDailyXp(userId);
  const limit = 500;
  return { earned, limit, remaining: Math.max(0, limit - earned) };
}
