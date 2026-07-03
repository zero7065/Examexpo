// Seed script: Run this from the browser console after login to populate Firestore with questions.
// Usage: import { seedQuestions } from "./seed"; then call seedQuestions() from a dev-only component.

import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { QUESTION_BANK } from "../data/questionBank";

const SUBJECTS_TO_SEED = ["Use of English Language", "Mathematics", "Physics"];

export async function seedQuestions() {
  if (!db) {
    console.warn("Firestore not configured. Run with VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID set.");
    return;
  }

  let totalAdded = 0;

  for (const subject of SUBJECTS_TO_SEED) {
    const questions = QUESTION_BANK[subject];
    if (!questions || questions.length === 0) {
      console.warn(`No questions found for ${subject}`);
      continue;
    }

    // Check if this subject already has questions in Firestore
    const q = query(collection(db, "questions"), where("subject", "==", subject));
    const existing = await getDocs(q);
    if (existing.size >= 5) {
      console.log(`${subject}: ${existing.size} questions already exist, skipping`);
      continue;
    }

    for (const question of questions.slice(0, 10)) {
      try {
        await addDoc(collection(db, "questions"), {
          ...question,
          exam: question.exam || "JAMB",
          createdAt: serverTimestamp(),
        });
        totalAdded++;
      } catch (e) {
        console.error(`Failed to add question ${question.id}:`, e);
      }
    }
    console.log(`Seeded ${Math.min(questions.length, 10)} questions for ${subject}`);
  }

  console.log(`✅ Seed complete: ${totalAdded} questions added to Firestore`);
  return totalAdded;
}

// Auto-run flag for dev environment
export async function autoSeedIfEmpty() {
  if (!db) return;
  try {
    const snapshot = await getDocs(query(collection(db, "questions"), where("exam", "==", "JAMB")));
    if (snapshot.size === 0) {
      console.log("No questions in Firestore, auto-seeding...");
      await seedQuestions();
    } else {
      console.log(`Firestore already has ${snapshot.size} questions`);
    }
  } catch (e) {
    console.warn("Could not check questions collection:", e);
  }
}