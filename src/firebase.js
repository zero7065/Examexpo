// src/firebase.js - Gracefully handles missing API keys (uses localStorage instead)

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000",
};

// Only initialize Firebase if real keys exist
if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  try {
    const { initializeApp } = require("firebase/app");
    const { getAuth, GoogleAuthProvider } = require("firebase/auth");
    const { getFirestore } = require("firebase/firestore");
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (e) {
    console.log("Firebase not configured - using localStorage only");
  }
} else {
  console.log("Firebase API key not set - using localStorage auth only");
}

export { app, auth, db, googleProvider };
export const isFirebaseConfigured = !!(import.meta.env.VITE_FIREBASE_API_KEY);