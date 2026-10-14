// src/lib/rag.js — lightweight Retrieval-Augmented Generation over the local
// question bank. Fully offline: token-overlap retrieval, no embeddings needed.
// Retrieved items are injected into the tutor system prompt as grounded context.
import { questions } from "../data/questions/compat";

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "was", "were",
  "what", "which", "who", "how", "why", "for", "with", "on", "by", "at", "it",
  "this", "that", "these", "those", "me", "my", "please", "explain", "solve",
  "help", "question", "answer", "biko", "abeg",
]);

function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

// Score a bank question against the query. Returns { q, score }.
function scoreQuestion(q, qTokens, subjectHint) {
  const hay = tokens(`${q.question} ${q.topic || ""} ${q.explanation || ""}`);
  const haySet = new Set(hay);
  let overlap = 0;
  for (const t of qTokens) {
    if (haySet.has(t)) overlap++;
    // prefix matches (e.g. "photo" ~ "photosynthesis")
    else if ([...haySet].some((h) => (h.startsWith(t) && t.length > 4) || (t.startsWith(h) && h.length > 4))) {
      overlap += 0.5;
    }
  }
  if (overlap === 0) return 0;
  let score = overlap;
  if (subjectHint && String(q.subject || "").toLowerCase().includes(subjectHint.toLowerCase())) score += 2;
  if (q.highYield) score += 1;
  return score;
}

// Retrieve top-K most relevant bank items for a user message.
export function retrieveContext(messageText, { subject = "", topK = 3 } = {}) {
  try {
    const qTokens = [...new Set(tokens(messageText))];
    if (qTokens.length === 0 || !Array.isArray(questions)) return [];
    const scored = [];
    for (const q of questions) {
      const s = scoreQuestion(q, qTokens, subject);
      if (s > 0) scored.push({ q, s });
    }
    scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, topK).map(({ q }) => q);
  } catch {
    return [];
  }
}

// Format retrieved items as a compact context block for the system prompt.
export function formatRagContext(items) {
  if (!items || items.length === 0) return "";
  const lines = items.map((q, i) => {
    const opts = q.options
      ? Object.entries(q.options).map(([k, v]) => `${k}) ${String(v).slice(0, 60)}`).join(" ")
      : "";
    return `[${i + 1}] (${q.subject}${q.topic ? `/${q.topic}` : ""}) ${String(q.question).slice(0, 220)}\n${opts}\nAnswer: ${q.correctAnswer || q.answer || "?"} — ${String(q.explanation || "").slice(0, 200)}`;
  });
  return `\n\nGrounded curriculum context (use it when relevant, never quote IDs):\n${lines.join("\n")}`;
}

// One-call helper: retrieve + format for a user message.
export function ragContextFor(messageText, opts) {
  return formatRagContext(retrieveContext(messageText, opts));
}
