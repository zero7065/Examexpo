// src/context/AuthContext.jsx - Fully offline with localStorage
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const TEST_ADMIN_EMAIL = "test@admin.com";
const TEST_ADMIN_PASSWORD = "testadmin123";

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

function createUser(email, password, name) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error("Email already registered");
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    name: name || "Student",
    plan: email === TEST_ADMIN_EMAIL ? "pro" : "free",
    planExpiry: email === TEST_ADMIN_EMAIL 
      ? new Date(Date.now() + 365*24*60*60*1000).toISOString() 
      : null,
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

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  const sessionUser = { ...user };
  delete sessionUser.password;
  saveSession(sessionUser);
  
  return sessionUser;
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

  function login(email, password) {
    // Test admin check
    if (email === TEST_ADMIN_EMAIL && password === TEST_ADMIN_PASSWORD) {
      const users = getUsers();
      let testAdmin = users.find(u => u.email === TEST_ADMIN_EMAIL);
      
      if (!testAdmin) {
        testAdmin = createUser(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, "Test Admin");
      } else {
        const sessionUser = { ...testAdmin };
        delete sessionUser.password;
        saveSession(sessionUser);
        setUser(sessionUser);
      }
      return sessionUser;
    }
    
    const loggedInUser = loginUser(email, password);
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
      isPro 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);