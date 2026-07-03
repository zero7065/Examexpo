import { collection, getDocs, query, where, limit as firestoreLimit, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getQuestionsFromBank } from "../data/questionBank";

export async function getQuestions(subject, topic, count = 10) {
  const results = [];

  if (db) {
    try {
      const constraints = [where("subject", "==", subject)];
      if (topic) constraints.push(where("topic", "==", topic));
      constraints.push(firestoreLimit(count));

      const q = query(collection(db, "questions"), ...constraints);
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => results.push({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Firestore questions fetch failed, using local bank", e);
    }
  }

  if (results.length === 0) {
    const local = getQuestionsFromBank({ subject, topic, count });
    results.push(...local.map((q, i) => ({ ...q, id: q.id || `${subject}_local_${i}` })));
  }

  return results.length <= count ? results : results.slice(0, count);
}

export async function saveSession(userId, sessionData) {
  const sessionPayload = {
    ...sessionData,
    completedAt: serverTimestamp(),
    xpEarned: sessionData.xpEarned || calculateXP(sessionData),
  };

  if (db && userId) {
    try {
      const sessionsRef = collection(db, "userSessions", userId, "sessions");
      const docRef = await addDoc(sessionsRef, sessionPayload);
      return docRef.id;
    } catch (e) {
      console.warn("Firestore save failed, saving to localStorage", e);
    }
  }

  return saveSessionLocal(userId, sessionPayload);
}

export async function generateQuestionsWithAI(subject, topic, count = 5) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return [];

  const prompt = `Generate ${count} Nigerian ${subject} exam questions${topic ? ` on topic: ${topic}` : ""}. 
Return ONLY a valid JSON array. Each question object must have: 
{ "question": "string", "options": {"A":"...","B":"...","C":"...","D":"..."}, "correctAnswer": "A|B|C|D", "explanation": "string", "topic": "string", "difficulty": "easy|medium|hard" }
Do NOT include any text outside the JSON array.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a Nigerian exam question generator. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map((q, i) => ({
      ...q,
      id: `ai_${Date.now()}_${i}`,
      subject,
      exam: "JAMB",
    }));
  } catch {
    return [];
  }
}

function calculateXP(session) {
  const base = session.correctAnswers * 10;
  const bonus = session.percentageScore >= 80 ? 50 : session.percentageScore >= 60 ? 25 : 0;
  return base + bonus;
}

function saveSessionLocal(userId, sessionData) {
  const key = `exampadi_sessions_${userId}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ ...sessionData, completedAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing));
  return `local_${Date.now()}`;
}