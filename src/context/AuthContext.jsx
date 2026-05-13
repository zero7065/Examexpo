// src/context/AuthContext.jsx - Fully offline with localStorage
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("exampadi_users") || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem("exampadi_users", JSON.stringify(users));
}

function getCurrentSession() {
  try {
    return JSON.parse(localStorage.getItem("exampadi_session") || "null");
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem("exampadi_session", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("exampadi_session");
}

async function createUser(email, password, name) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error("Email already registered");
  }
  
  const hashedPassword = await hashPassword(password);
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    name: name || "Student",
    plan: "free",
    planExpiry: null,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    totalSessions: 0,
    totalStudyTimeSeconds: 0,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    joinedAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const sessionUser = { ...newUser };
  delete sessionUser.password;
  saveSession(sessionUser);
  
  return sessionUser;
}

async function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  const hashedInput = await hashPassword(password);
  if (user.password !== hashedInput) {
    throw new Error("Invalid email or password");
  }
  
  const sessionUser = { ...user };
  delete sessionUser.password;
  saveSession(sessionUser);
  
  return sessionUser;
}

async function resetPassword(email, newPassword) {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    throw new Error("No account found with this email");
  }
  
  const hashedPassword = await hashPassword(newPassword);
  users[userIndex].password = hashedPassword;
  saveUsers(users);
  
  return true;
}

function findUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email === email);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const session = getCurrentSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  function register(email, password, name) {
    const newUser = createUser(email, password, name);
    setUser(newUser);
    return newUser;
  }

  async function login(email, password) {
    const loggedInUser = await loginUser(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  function updateUser(updates) {
    if (!user) return;
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      saveUsers(users);
      
      const updatedUser = { ...user, ...updates };
      delete updatedUser.password;
      saveSession(updatedUser);
      setUser(updatedUser);
    }
  }

  function isPro() {
    if (!user) return false;
    if (user.plan === "pro") {
      if (!user.planExpiry) return true;
      return new Date(user.planExpiry) > new Date();
    }
    return false;
  }

  // Full-screen loader
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        flexDirection: "column",
        gap: 16,
      }}>
        <div style={{ fontSize: 52 }}>🎓</div>
        <p style={{ color: "#888", fontFamily: "system-ui, sans-serif", fontSize: 15 }}>
          Loading ExamPadi...
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      logout, 
      updateUser,
      isPro,
      resetPassword: (email, newPassword) => resetPassword(email, newPassword),
      findUserByEmail: (email) => findUserByEmail(email)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);