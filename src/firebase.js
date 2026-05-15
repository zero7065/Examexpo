import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAZl7anzplj6uJoKZVjilGf0IHz4JcFmBY",
  authDomain: "exampadi-ai.firebaseapp.com",
  projectId: "exampadi-ai",
  storageBucket: "exampadi-ai.firebasestorage.app",
  messagingSenderId: "1020308324608",
  appId: "1:1020308324608:web:5c8df8d7f287b7f6e6f3e5",
  measurementId: "G-BF40PQKNXY",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

export const isFirebaseConfigured = true;
export { app, auth, db, googleProvider, analytics };