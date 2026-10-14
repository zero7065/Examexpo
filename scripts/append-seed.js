// scripts/append-seed.js — appends hand-authored seed batches (no ids needed)
// into the master bank with dedupe + per-file id assignment + validation.
//
// Usage: node scripts/append-seed.js --file scripts/seed-data/batch-01.json [--dry-run]
// Batch format: [{ subject, topic, exam, year, difficulty, question,
//                  options: {A,B,C,D}, correctAnswer, explanation, hint? }]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BANK_DIR = path.join(ROOT, "src", "data", "questions", "master-bank");
const FILE_FOR = { JAMB: "jamb.json", WAEC: "waec.json", NECO: "neco.json", NABTEB: "nabteb.json", "POST-UTME": "postutme.json", IELTS: "ielts.json" };

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

async function main() {
  const argv = process.argv.slice(2);
  const get = (k) => {
    const i = argv.indexOf(`--${k}`);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
  };
  const file = get("file");
  const dryRun = argv.includes("--dry-run");
  if (!file) {
    console.error("Usage: node scripts/append-seed.js --file scripts/seed-data/batch-01.json [--dry-run]");
    process.exit(1);
  }

  const batch = JSON.parse(fs.readFileSync(path.resolve(ROOT, file), "utf8"));
  if (!Array.isArray(batch)) throw new Error("Batch must be a JSON array");
  console.log(`${batch.length} seed questions from ${file}${dryRun ? " (DRY RUN)" : ""}`);

  // Load banks + counters + hashes
  const banks = {};
  const counters = {};
  const seen = new Set();
  for (const [exam, fname] of Object.entries(FILE_FOR)) {
    const full = path.join(BANK_DIR, fname);
    const list = JSON.parse(fs.readFileSync(full, "utf8"));
    banks[exam] = list;
    for (const q of list) {
      seen.add(`${exam}:${hashText(q.question)}`);
      const m = String(q.id).match(/^(.*)-(\d{3})$/);
      if (m) counters[m[1]] = Math.max(counters[m[1]] || 0, Number(m[2]));
    }
  }

  let added = 0, skipped = 0;
  const errors = [];
  batch.forEach((s, i) => {
    const where = `batch[${i}]`;
    const exam = String(s.exam || "JAMB").toUpperCase();
    if (!FILE_FOR[exam]) { errors.push(`${where}: bad exam ${s.exam}`); return; }
    const kind = s.kind === "theory" ? "theory" : "objective";
    const okOptions = kind === "theory" || ["A", "B", "C", "D"].every((k) => String(s.options?.[k] || "").trim());
    const okAnswer = kind === "theory" || ["A", "B", "C", "D"].includes(String(s.correctAnswer || "").toUpperCase());
    const ok = String(s.question || "").trim() && String(s.explanation || "").trim()
      && String(s.subject || "").trim() && okAnswer
      && okOptions && Number(s.year) > 0
      && (kind === "objective" || String(s.modelAnswer || "").trim());
    if (!ok) { errors.push(`${where}: invalid entry (fields/answer/options/year)`); return; }
    const h = `${exam}:${hashText(s.question)}`;
    if (seen.has(h)) { skipped++; return; }
    seen.add(h);

    const prefix = `${exam.toLowerCase()}-${s.year}-${slug3(s.subject)}`;
    counters[prefix] = (counters[prefix] || 0) + 1;
    banks[exam].push({
      id: `${prefix}-${String(counters[prefix]).padStart(3, "0")}`,
      subject: String(s.subject),
      topic: String(s.topic || "General"),
      exam: [exam],
      year: Number(s.year),
      difficulty: ["easy", "medium", "hard"].includes(s.difficulty) ? s.difficulty : "medium",
      ...(kind === "theory" ? { kind: "theory" } : {}),
      question: String(s.question),
      ...(kind === "theory"
        ? { modelAnswer: String(s.modelAnswer) }
        : {
            options: { A: String(s.options.A), B: String(s.options.B), C: String(s.options.C), D: String(s.options.D) },
            correctAnswer: String(s.correctAnswer).toUpperCase(),
          }),
      explanation: String(s.explanation),
      ...(s.hint ? { hint: String(s.hint) } : {}),
      source: "seed",
      createdAt: new Date().toISOString(),
    });
    added++;
  });

  console.log(`+${added} added, ${skipped} dupes skipped, ${errors.length} invalid`);
  errors.slice(0, 10).forEach((e) => console.log(`  ! ${e}`));
  if (errors.length > 0) process.exit(1);
  if (!dryRun) {
    for (const [exam, fname] of Object.entries(FILE_FOR)) {
      fs.writeFileSync(path.join(BANK_DIR, fname), JSON.stringify(banks[exam], null, 1));
    }
    console.log("Wrote master-bank files.");
  } else {
    console.log("Dry run — nothing written.");
  }
}

main().catch((e) => {
  console.error("Append failed:", e.message);
  process.exit(1);
});
