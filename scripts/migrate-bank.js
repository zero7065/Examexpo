// scripts/migrate-bank.js — one-off migration of the two legacy banks
// (src/data/questionBank.js + src/data/questions/index.js) into canonical
// per-exam JSON files under src/data/questions/master-bank/.
// See src/data/questions/schema.md. Safe to re-run (rewrites files).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { QUESTION_BANK } from "../src/data/questionBank.js";
import { questions as INDEX_QUESTIONS } from "../src/data/questions/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "src", "data", "questions", "master-bank");

const EXAMS = ["JAMB", "WAEC", "NECO", "NABTEB", "POST-UTME"];

function normText(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function hashText(s) {
  return createHash("sha256").update(normText(s)).digest("hex").slice(0, 16);
}

function slug3(subject) {
  const words = String(subject).toLowerCase().replace(/[^a-z ]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 4);
  return words.map((w) => w[0]).join("").slice(0, 4) || "gen";
}

function toArrayExam(exam) {
  if (Array.isArray(exam)) return exam.map((e) => String(e).toUpperCase().replace(/-/g, "-"));
  if (typeof exam === "string") return [exam.toUpperCase()];
  return ["JAMB"];
}

function canonicalize(raw, counters, targetExam) {
  const examArr = toArrayExam(raw.exam).map((e) =>
    e === "POSTUTME" || e === "POST_UTME" ? "POST-UTME" : e
  );
  // ID is per-file: prefix uses the target exam file so ids stay unique
  const key = `${targetExam.toLowerCase()}-${raw.year || "0000"}-${slug3(raw.subject)}`;
  counters[key] = (counters[key] || 0) + 1;
  const id = `${key}-${String(counters[key]).padStart(3, "0")}`;

  const options = {
    A: String(raw.options?.A ?? ""),
    B: String(raw.options?.B ?? ""),
    C: String(raw.options?.C ?? ""),
    D: String(raw.options?.D ?? ""),
  };
  const correctAnswer = String(raw.correctAnswer ?? raw.answer ?? "").toUpperCase();

  return {
    id,
    subject: String(raw.subject || "General"),
    topic: String(raw.topic || "General"),
    exam: examArr,
    year: Number(raw.year) || 0,
    difficulty: ["easy", "medium", "hard"].includes(raw.difficulty) ? raw.difficulty : "medium",
    question: String(raw.question || ""),
    options,
    correctAnswer,
    explanation: String(raw.explanation || ""),
    ...(raw.hint ? { hint: String(raw.hint) } : {}),
    source: "past",
    createdAt: new Date().toISOString(),
  };
}

async function main() {
  const counters = {};
  const raw = [];

  // Legacy bank 1: keyed object
  for (const list of Object.values(QUESTION_BANK)) {
    for (const q of list) raw.push({ q, from: "questionBank.js" });
  }
  // Legacy bank 2: flat array
  for (const q of INDEX_QUESTIONS) raw.push({ q, from: "questions/index.js" });

  console.log(`Legacy input: ${raw.length} questions`);

  const files = { JAMB: [], WAEC: [], NECO: [], NABTEB: [], "POST-UTME": [] };
  const seen = new Set();
  let dupes = 0;
  let invalid = 0;

  for (const { q } of raw) {
    const exams = toArrayExam(q.exam);
    for (const exam of exams) {
      const fileExam = EXAMS.includes(exam) ? exam : "JAMB";
      const c = canonicalize(q, counters, fileExam);
      // Validation (mirrors validate-bank.js core rules)
      const okOptions = ["A", "B", "C", "D"].every((k) => c.options[k].trim().length > 0);
      const ok =
        c.question.trim() && c.explanation.trim() && c.subject.trim() &&
        ["A", "B", "C", "D"].includes(c.correctAnswer) && okOptions && c.year > 0;
      if (!ok) { invalid++; continue; }

      const bucket = files[fileExam] || files.JAMB;
      const h = `${fileExam}:${hashText(c.question)}`;
      if (seen.has(h)) { dupes++; continue; }
      seen.add(h);
      bucket.push(c);
    }
  }

  fs.mkdirSync(OUT, { recursive: true });
  const names = { JAMB: "jamb.json", WAEC: "waec.json", NECO: "neco.json", NABTEB: "nabteb.json", "POST-UTME": "postutme.json" };
  let total = 0;
  for (const [exam, list] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUT, names[exam]), JSON.stringify(list, null, 1));
    total += list.length;
    console.log(`${names[exam]}: ${list.length} questions`);
  }
  console.log(`\nMigrated ${total} entries (${dupes} cross-file dupes skipped, ${invalid} invalid skipped)`);
  console.log(`Output: ${OUT}`);
}

main().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
