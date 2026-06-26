import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: If Firebase setup fails or config is missing, we'll use a mock or handle it gracefully.
const firebaseConfig = {
  apiKey: "MOCK_KEY",
  authDomain: "sidekick-jamb.firebaseapp.com",
  projectId: "sidekick-jamb",
  storageBucket: "sidekick-jamb.appspot.com",
  messagingSenderId: "12345",
  appId: "1:12345:web:12345"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
