// src/lib/likelyQuestions.js — deterministic repetition engine.
// Scores bank questions by how often their topic repeats across years.
// Thin topics (no repetition data) are filled by AI predictions in the UI;
// every result carries its origin so badges stay honest.
import { getBank } from "../data/questions/master";

export function scoreQuestion(q) {
  const repeated = Array.isArray(q.repeatedFrom) ? q.repeatedFrom.length : 0;
  return repeated * 10 + (q.highYield ? 20 : 0) + (q.difficulty === "medium" ? 5 : 0);
}

// Top-N likely questions for a subject+exam, highest repetition score first.
export function predictLikelyQuestions({ subject, exam = "JAMB", count = 20 }) {
  const pool = getBank(exam).filter((q) =>
    String(q.subject || "").toLowerCase() === String(subject || "").toLowerCase()
  );
  // Fall back to alias-insensitive match when exact yields nothing
  const list = pool.length > 0 ? pool : getBank(exam).filter((q) => {
    const k = String(q.subject || "").toLowerCase();
    const n = String(subject || "").toLowerCase();
    return k.includes(n) || n.includes(k);
  });
  return list
    .map((q) => ({ ...q, _score: scoreQuestion(q), _origin: "DATA" }))
    .sort((a, b) => b._score - a._score)
    .slice(0, count);
}

export function getRepetitionInsight(q) {
  const years = Array.isArray(q.repeatedFrom) ? [...q.repeatedFrom].sort((a, b) => a - b) : [];
  if (years.length === 0) return null;
  const span = years.length > 1 ? `${years.length} exams (${years[0]}–${years[years.length - 1]})` : `${years.length} exam`;
  return `🔥 This pattern appeared in ${years.join(", ")} — ${span}.`;
}

export function likelyTopics({ subject, exam = "JAMB", count = 6 }) {
  const scored = predictLikelyQuestions({ subject, exam, count: 200 });
  const seen = new Map();
  for (const q of scored) {
    const key = q.topic || "General";
    if (!seen.has(key)) {
      seen.set(key, {
        topic: key,
        likelihood: q.highYield ? "very high" : q._score >= 20 ? "high" : "medium",
        reason: getRepetitionInsight(q) || "Frequently tested fundamentals.",
        sampleQuestion: q.question,
        _origin: "DATA",
      });
    }
    if (seen.size >= count) break;
  }
  return [...seen.values()];
}
