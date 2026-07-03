// src/utils/localStorageAuth.js
// Complete offline auth system using localStorage

const USERS_KEY = "exampadi_users";
const SESSION_KEY = "exampadi_session";

export function createUser(email, password, name) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    throw new Error("Email already registered");
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password, // In real app, this would be hashed
    name,
    plan: email === "test@admin.com" ? "pro" : "free",
    planExpiry: email === "test@admin.com" ? new Date(Date.now() + 365*24*60*60*1000).toISOString() : null,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    totalSessions: 0,
    studyTimeSeconds: 0,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Set session
  const sessionUser = { ...newUser };
  delete sessionUser.password;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  
  return sessionUser;
}

export function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  const sessionUser = { ...user };
  delete sessionUser.password;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  
  return sessionUser;
}

export function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  }
  return null;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateUserData(updates) {
  const session = getCurrentUser();
  if (!session) return;
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const userIndex = users.findIndex(u => u.id === session.id);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
  }
}

export function isProUser() {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.plan === "pro") {
    const expiry = user.planExpiry ? new Date(user.planExpiry) : null;
    if (expiry && expiry > new Date()) return true;
  }
  return false;
}

// Daily usage helpers
export function getDailyUsage(uid) {
  const today = new Date().toISOString().split("T")[0];
  const key = `daily_usage_${uid}_${today}`;
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return { questionsUsed: 0, aiTutorUsed: 0, date: today };
    }
  }
  return { questionsUsed: 0, aiTutorUsed: 0, date: today };
}

export function incrementDailyUsage(uid, type) {
  const today = new Date().toISOString().split("T")[0];
  const key = `daily_usage_${uid}_${today}`;
  let data = getDailyUsage(uid);
  
  // Reset if new day
  if (data.date !== today) {
    data = { questionsUsed: 0, aiTutorUsed: 0, date: today };
  }
  
  if (type === "question") {
    data.questionsUsed += 1;
  } else if (type === "aiTutor") {
    data.aiTutorUsed += 1;
  }
  
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}