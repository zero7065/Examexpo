// src/data/questions/compat.js — drop-in replacements for the two legacy
// bank APIs, backed by the canonical master bank (master.js).
//
// Covers: getQuestionsFromBank, getAllSubjectsForExam, getAvailableYears,
// NABTEB_SUBJECTS (from questionBank.js) AND questions, getBySubject,
// getBySubjectAndTopic, getByExam, getTopics, getRandomQuestions,
// getAllSubjects, getTotalCount, getFilteredQuestions (from questions/index.js).
//
// Behavior contract: identical signatures and filtering semantics; only the
// underlying pool is larger (both legacy banks unified).
import { getAllBankQuestions } from "./master";

// ─── Aliases (superset of both legacy maps) ───
const SUBJECT_ALIASES = {
  maths: "Mathematics",
  "further maths": "Further Mathematics",
  english: "Use of English Language",
  "use of english": "Use of English Language",
  "use of english language": "Use of English Language",
  "literature in english": "Literature-in-English",
  literature: "Literature-in-English",
  "christian religious studies": "Christian Religious Knowledge",
  crs: "Christian Religious Knowledge",
  agr: "Agricultural Science",
  "agric science": "Agricultural Science",
  "mathematics (core)": "Mathematics",
};

export const NABTEB_SUBJECTS = [
  { id: "computer-craft", name: "Computer Craft Practice", code: "CCP", icon: "🖥️" },
  { id: "auto-mechanics", name: "Auto Mechanics Work", code: "AMW", icon: "🔧" },
  { id: "electrical-installation", name: "Electrical Installation Work", code: "EIW", icon: "💡" },
  { id: "plumbing", name: "Plumbing and Pipe Fitting", code: "PPF", icon: "🔨" },
  { id: "catering", name: "Catering Craft Practice", code: "CAT", icon: "🍳" },
  { id: "building-construction", name: "Building Construction", code: "BLD", icon: "🏗️" },
  { id: "welding", name: "Welding and Fabrication", code: "WEL", icon: "🔥" },
  { id: "cosmetology", name: "Cosmetology", code: "COS", icon: "💄" },
  { id: "garment-making", name: "Garment Making", code: "GAR", icon: "🧵" },
  { id: "book-keeping", name: "Book-Keeping", code: "BBK", icon: "📒" },
];

function normalize(q) {
  return {
    ...q,
    answer: q.answer || q.correctAnswer,
    correctAnswer: q.correctAnswer || q.answer,
  };
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── questionBank.js API ───
export function getQuestionsFromBank({ subject, year, exam, topic = null, count = 10, difficulty = null }) {
  const normalized = SUBJECT_ALIASES[String(subject || "").toLowerCase()] || subject;
  const n = (normalized || "").toLowerCase();

  // Prefer exact subject matches so "Mathematics" never pulls "Further Mathematics"
  const exactPool = [];
  const fuzzyPool = [];
  for (const q of getAllBankQuestions()) {
    const k = String(q.subject || "").toLowerCase();
    if (!n) continue;
    if (k === n) exactPool.push(q);
    else if (k.includes(n) || n.includes(k)) fuzzyPool.push(q);
  }
  let pool = exactPool.length > 0 ? exactPool : fuzzyPool;

  // Filter by exam (canonical exam is an array)
  if (exam && pool.length > 0) {
    pool = pool.filter((q) => Array.isArray(q.exam) && q.exam.includes(exam));
  }

  // Filter by difficulty
  if (difficulty && pool.length > 0) {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  // Filter by topic — fall back to full pool if topic yields nothing
  if (topic && pool.length > 0) {
    const topicPool = pool.filter((q) =>
      String(q.topic || "").toLowerCase().includes(String(topic).toLowerCase())
    );
    if (topicPool.length > 0) pool = topicPool;
  }

  // Filter by year - prioritize exact year, then any recent
  if (year && pool.length > 0) {
    const yearPool = pool.filter((q) => q.year === year);
    if (yearPool.length >= 3) pool = yearPool;
  }

  pool = pool.map(normalize);
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

export function getAllSubjectsForExam(exam) {
  const subjects = new Set();
  for (const q of getAllBankQuestions()) {
    if (!exam || (Array.isArray(q.exam) && q.exam.includes(exam))) {
      subjects.add(q.subject);
    }
  }
  return Array.from(subjects);
}

export function getAvailableYears(subject, exam) {
  const pool = getAllBankQuestions().filter((q) => {
    const k = String(q.subject || "");
    return k.includes(subject) || String(subject).includes(k);
  });
  const filtered = exam ? pool.filter((q) => Array.isArray(q.exam) && q.exam.includes(exam)) : pool;
  return [...new Set(filtered.map((q) => q.year))].sort((a, b) => b - a);
}

// ─── questions/index.js API (strict-equality semantics preserved) ───
export const questions = getAllBankQuestions();

export function getBySubject(subject) {
  return getAllBankQuestions().filter((q) => q.subject === subject).map(normalize);
}

export function getBySubjectAndTopic(subject, topic) {
  return getAllBankQuestions().filter((q) => q.subject === subject && q.topic === topic).map(normalize);
}

export function getByExam(exam) {
  return getAllBankQuestions().filter((q) => Array.isArray(q.exam) && q.exam.includes(exam)).map(normalize);
}

export function getTopics(subject) {
  const topics = new Set();
  getAllBankQuestions().filter((q) => q.subject === subject).forEach((q) => topics.add(q.topic));
  return [...topics];
}

const INDEX_ALIASES = {
  maths: "Mathematics",
  "further maths": "Further Mathematics",
  "use of english": "English",
  "use of english language": "English",
};

export function getRandomQuestions(subject, count) {
  const normalized = INDEX_ALIASES[String(subject).toLowerCase()] || subject;
  const subjectQuestions = getAllBankQuestions().filter((q) => q.subject === normalized);
  return shuffle(subjectQuestions).slice(0, Math.min(count, subjectQuestions.length)).map(normalize);
}

export function getAllSubjects() {
  const subjects = new Set();
  getAllBankQuestions().forEach((q) => subjects.add(q.subject));
  return [...subjects].sort();
}

export function getTotalCount(subject) {
  if (subject) return getAllBankQuestions().filter((q) => q.subject === subject).length;
  return getAllBankQuestions().length;
}

export function getFilteredQuestions(filters = {}) {
  let result = [...getAllBankQuestions()];

  if (filters.subject && filters.subject !== "All Subjects") {
    result = result.filter((q) => q.subject === filters.subject);
  }
  if (filters.topic) {
    result = result.filter((q) => q.topic === filters.topic);
  }
  if (filters.exam && filters.exam !== "ALL") {
    result = result.filter((q) => Array.isArray(q.exam) && q.exam.includes(filters.exam));
  }
  if (filters.difficulty && filters.difficulty !== "ALL") {
    result = result.filter((q) => q.difficulty === String(filters.difficulty).toLowerCase());
  }
  if (filters.yearFrom) {
    result = result.filter((q) => q.year >= parseInt(filters.yearFrom));
  }
  if (filters.yearTo) {
    result = result.filter((q) => q.year <= parseInt(filters.yearTo));
  }
  if (filters.highYieldOnly) {
    result = result.filter((q) => q.highYield);
  }

  return result.map(normalize);
}

// Convenience re-export of the master loader
export { getBank, loadBank, bankCounts } from "./master";
