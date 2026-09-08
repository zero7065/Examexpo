// src/firebaseConfig.js — Real Firebase SDK
// Replaces the localStorage shim. All existing imports work unchanged.

import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  GoogleAuthProvider,
  setPersistence,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  increment,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

// ─── Firebase Config ───
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_firebase_api_key" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your_project_id";

// Initialize immediately — app will be null if not configured
let app = null;
let _auth = null;
let _db = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    _auth = getAuth(app);
    _db = getFirestore(app);
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
} else {
  console.warn(
    "Firebase not configured — add real values to .env. Auth & Firestore will be unavailable."
  );
}

// ─── Always export (even if null) ───
export const auth = _auth;
export const db = _db;

// Re-export Firestore functions directly
export { doc, collection, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc };
export { query, where, orderBy, limit, writeBatch, increment, serverTimestamp, arrayUnion };

// Re-export Auth functions directly
export { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword };
export { signOut, updateProfile, sendPasswordResetEmail, deleteUser };
export { GoogleAuthProvider, setPersistence };
export const browserLocalPersistence = "local";

// ─── Google sign-in helper ───
const _googleProvider = new GoogleAuthProvider();
export { _googleProvider as googleProvider };

export async function signInWithGoogle() {
  if (!_auth) throw new Error("Firebase not configured");
  return signInWithPopup(_auth, _googleProvider);
}

// ─── App metadata ───
export const app_meta = app;
export const isFirebaseConfigured = isConfigured;
