import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { logActivity } from "../lib/activityLog";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function register(email, password, name) {
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      if (e.code === 'auth/configuration-not-found' || e.code === 'auth/operation-not-allowed') {
        throw new Error("Firebase Email/Password auth is not enabled. Go to Firebase Console → Authentication → Sign-in method → enable Email/Password.");
      }
      if (e.code === 'auth/email-already-in-use') {
        throw e;
      }
      throw e;
    }
    try {
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        name,
        role: "user",
        exam: null,
        subjects: [],
        onboarded: false,
        createdAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      try { await deleteUser(cred.user); } catch (_) {}
      throw new Error("Failed to create profile. Please try again.");
    }
    setUser({ ...cred.user, displayName: name });
    logActivity({ action: "register", userId: cred.user.uid, email, details: { name } });
  }

  async function login(email, password) {
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      if (e.code === 'auth/configuration-not-found' || e.code === 'auth/operation-not-allowed') {
        throw new Error("Firebase Email/Password auth is not enabled. Go to Firebase Console → Authentication → Sign-in method → enable Email/Password.");
      }
      throw e;
    }
    logActivity({ action: "login", userId: cred.user.uid, email });
  }

  async function logout() {
    const uid = auth.currentUser?.uid;
    const email = auth.currentUser?.email;
    try {
      await signOut(auth);
      if (uid) logActivity({ action: "logout", userId: uid, email });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        throw new Error("No account found with this email");
      }
      if (e.code === 'auth/configuration-not-found' || e.code === 'auth/operation-not-allowed') {
        throw new Error("Firebase Email/Password auth is not enabled. Go to Firebase Console → Authentication → Sign-in method → enable Email/Password.");
      }
      throw new Error("Failed to send reset email. Check your email address and try again.");
    }
  }

  function findUserByEmail(email) {
    if (user && user.email === email) return user;
    return null;
  }

  async function refreshProfile() {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
    setProfileVersion(v => v + 1);
  }

  function updateUser(data) {
    if (user) setUser({ ...user, ...data });
  }

  function isPro() {
    return user?.plan === "pro" && user?.planExpiry && new Date(user.planExpiry) > new Date();
  }

  function getUserRole() {
    return user?.role || "user";
  }

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
        <div style={{
          width: 36,
          height: 36,
          border: "3px solid #333",
          borderTopColor: "#6C3CE9",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#888", fontFamily: "system-ui, sans-serif", fontSize: 15 }}>
          Loading ExamPadi...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, findUserByEmail, refreshProfile, updateUser, profileVersion, isPro, getUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
