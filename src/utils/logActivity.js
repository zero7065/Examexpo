// src/utils/logActivity.js
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

const FIRST_NAMES = [
  "Tunde","Chisom","Adaeze","Emeka","Fatima","Blessing","Segun","Ngozi",
  "Uche","Amara","Kelechi","Sola","Bello","Ifunanya","Dayo","Zara",
  "Chidi","Aisha","Tobi","Onyeka","Musa","Yetunde","Ibrahim","Chiamaka",
];

const CITIES = [
  "Lagos","Abuja","Kano","Ibadan","Port Harcourt","Benin City","Kaduna",
  "Enugu","Owerri","Calabar","Jos","Ilorin","Abeokuta","Akure","Uyo",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function logActivity(type, data = {}) {
  const name = randomFrom(FIRST_NAMES);
  const city = randomFrom(CITIES);

  const messages = {
    session_complete: `${name} from ${city} scored ${data.score}% in ${data.subject} 🔥`,
    pro_upgrade: `${name} from ${city} just went Pro 🚀`,
    streak: `${name} from ${city} is on a ${data.days}-day streak 🔥`,
    high_score: `${name} from ${city} scored ${data.score}% in ${data.subject} — personal best! 🏆`,
    first_session: `${name} from ${city} just started their first practice session 📚`,
    cbt_complete: `${name} from ${city} completed a full CBT simulation — scored ${data.score}/400`,
  };

  const message = messages[type] || `${name} from ${city} is practicing right now 📖`;

  try {
    await addDoc(collection(db, "publicActivity"), {
      message,
      type,
      createdAt: serverTimestamp(),
      // Auto-expire after 24 hours (set TTL in Firebase Console on this field)
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    });
  } catch (err) {
    // Never let activity logging crash the app
    console.warn("Activity log failed:", err.message);
  }
}
