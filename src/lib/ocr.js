// src/lib/ocr.js — OCR + parse + enrich pipeline stages (browser + Node).
// OCR uses the multimodal model (qwen3.8-27b); parsing/enrichment use the
// standard text chain. All return structured data or throw honest errors.
import { askGroqVision, askGroq } from "./ai";

export async function ocrImage(imageBase64) {
  const system =
    "You transcribe Nigerian exam past-paper photos. Return ONLY the transcribed text, preserving question numbers, options A-D, and any instructions. No commentary.";
  const messages = [
    { role: "user", content: "Transcribe every question and option letter in this photo exactly." },
  ];
  return askGroqVision({ systemPrompt: system, messages, imageBase64, maxTokens: 2000 });
}

export async function parseQuestions(text, { exam, year, subject }) {
  const system =
    "You extract exam questions into JSON. Return ONLY valid JSON, no markdown fences.";
  const user = `Extract every complete question from this ${exam} ${year} ${subject} transcript into a JSON array. Each item exactly: {"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A|B|C|D"}. The transcript may not mark answers — if the answer is genuinely unknown, OMIT that question entirely. Transcript:\n\n${text}`;
  const res = await askGroq(system, user, { maxTokens: 3000, temperature: 0.3 });
  const cleaned = String(res).trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const parsed = JSON.parse(cleaned);
  const arr = Array.isArray(parsed) ? parsed : parsed.questions;
  if (!Array.isArray(arr)) throw new Error("Parser returned no question array");
  return arr.filter(
    (q) =>
      q &&
      String(q.question || "").trim() &&
      ["A", "B", "C", "D"].includes(String(q.answer || "").toUpperCase()) &&
      ["A", "B", "C", "D"].every((k) => String(q.options?.[k] || "").trim())
  );
}

export async function enrichQuestion(q, { subject, exam }) {
  const system =
    "You are a Nigerian curriculum expert. Return ONLY valid JSON, no markdown fences.";
  const user = `For this ${exam} ${subject} question, return JSON exactly: {"topic":"<short topic>","difficulty":"easy|medium|hard","explanation":"<2-3 sentence why-correct>","commonMistake":"<what students pick wrongly and why>","syllabusCode":"<CODE-nn or null>"}. Question: ${q.question} Options: ${JSON.stringify(q.options)} Answer: ${q.answer}`;
  const res = await askGroq(system, user, { maxTokens: 600, temperature: 0.4 });
  const cleaned = String(res).trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const e = JSON.parse(cleaned);
  return {
    topic: String(e.topic || "General").slice(0, 60),
    difficulty: ["easy", "medium", "hard"].includes(e.difficulty) ? e.difficulty : "medium",
    explanation: String(e.explanation || "").slice(0, 600),
    commonMistake: String(e.commonMistake || "").slice(0, 300) || undefined,
    syllabusCode: e.syllabusCode || undefined,
  };
}
