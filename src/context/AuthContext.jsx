import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // Ensure a Firestore profile doc exists so re-login recognizes the account
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      name,
      exam: null,
      subjects: [],
      onboarded: false,
      createdAt: serverTimestamp(),
    }, { merge: true });
    setUser({ ...cred.user, displayName: name });
  }

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
  }

  async function resetPassword(email, newPassword) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, newPassword);
      await updatePassword(cred.user, newPassword);
    } catch {
      throw new Error("No account found with this email");
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, findUserByEmail, refreshProfile, updateUser, profileVersion, isPro }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
