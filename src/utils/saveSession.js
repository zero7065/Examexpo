// src/utils/saveSession.js
import { doc, setDoc, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { logActivity } from "./logActivity";

export async function saveSession({ uid, exam, mode, subjects, year, questions, answers, timeSpentSeconds }) {
  const sessionId = `session_${Date.now()}`;
  const correct = answers.filter(a => a.isCorrect).length;
  const total = questions.length;
  const score = Math.round((correct / total) * 100);

  // Save session document
  await setDoc(doc(db, "users", uid, "sessions", sessionId), {
    exam,
    mode,
    subjects,
    year: year || null,
    totalQuestions: total,
    correctAnswers: correct,
    wrongAnswers: total - correct,
    percentageScore: score,
    timeSpentSeconds,
    completedAt: serverTimestamp(),
    questionLog: answers.map(a => ({
      questionId: a.id,
      subject: a.subject,
      topic: a.topic || null,
      userAnswer: a.userAnswer,
      correctAnswer: a.correctAnswer,
      isCorrect: a.isCorrect,
    })),
  });

  // Update user aggregate stats
  await updateDoc(doc(db, "users", uid), {
    totalQuestionsAnswered: increment(total),
    totalCorrect: increment(correct),
    totalSessions: increment(1),
    totalStudyTimeSeconds: increment(timeSpentSeconds),
    lastActiveDate: new Date().toISOString().split("T")[0],
  });

  // Update streak and capture new streak value
  const newStreak = await updateStreak(uid);

  // Update per-subject stats
  for (const subject of subjects) {
    const subjectAnswers = answers.filter(a => a.subject === subject);
    const subjectCorrect = subjectAnswers.filter(a => a.isCorrect).length;
    const subjectRef = doc(db, "users", uid, "subjectStats", subject.replace(/\s+/g, "_").toLowerCase());
    const subjectSnap = await getDoc(subjectRef);

    if (subjectSnap.exists()) {
      const old = subjectSnap.data();
      const newTotal = old.totalAttempted + subjectAnswers.length;
      const newCorrect = old.totalCorrect + subjectCorrect;
      await updateDoc(subjectRef, {
        totalAttempted: newTotal,
        totalCorrect: newCorrect,
        accuracyPercent: Math.round((newCorrect / newTotal) * 100),
        lastPracticed: serverTimestamp(),
      });
    } else {
      await setDoc(subjectRef, {
        subjectId: subject.replace(/\s+/g, "_").toLowerCase(),
        subjectName: subject,
        totalAttempted: subjectAnswers.length,
        totalCorrect: subjectCorrect,
        accuracyPercent: subjectAnswers.length > 0 ? Math.round((subjectCorrect / subjectAnswers.length) * 100) : 0,
        lastPracticed: serverTimestamp(),
      });
    }
  }

  // Update global stats doc
  const statsRef = doc(db, "stats", "global");
  try {
    await updateDoc(statsRef, {
      totalQuestions: increment(total),
      questionsToday: increment(total),
      activePastHour: increment(1),
    });
  } catch {
    // Doc doesn't exist yet — create it
    await setDoc(statsRef, {
      totalUsers: 1,
      totalQuestions: total,
      questionsToday: total,
      activePastHour: 1,
    });
  }

  // Log public activity (non-blocking)
  const primarySubject = subjects[0] || exam;
  if (newStreak >= 3) {
    await logActivity("streak", { days: newStreak });
  } else if (score >= 70) {
    await logActivity("high_score", { score, subject: primarySubject });
  } else {
    await logActivity("session_complete", { score, subject: primarySubject });
  }

  return { sessionId, score, correct, total };
}

async function updateStreak(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = data.streak || 0;
  if (data.lastActiveDate === yesterday) {
    newStreak = newStreak + 1;
  } else if (data.lastActiveDate !== today) {
    newStreak = 1;
  }

  const longest = Math.max(newStreak, data.longestStreak || 0);
  await updateDoc(ref, {
    streak: newStreak,
    longestStreak: longest,
    lastActiveDate: today,
  });

  return newStreak;
}
