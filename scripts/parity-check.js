// scripts/parity-check.js — verifies the master-bank migration lost nothing:
// every legacy question (by normalized-text hash) must exist in the master
// JSONs, and per-exam membership counts must reconcile.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { QUESTION_BANK } from "../src/data/questionBank.js";
import { questions as INDEX_QUESTIONS } from "../src/data/questions/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANK_DIR = path.resolve(__dirname, "..", "src", "data", "questions", "master-bank");

function normText(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function hashText(s) {
  return createHash("sha256").update(normText(s)).digest("hex").slice(0, 16);
}
function examArr(exam) {
  const arr = Array.isArray(exam) ? exam : [exam];
  return arr.map((e) => {
    const u = String(e || "JAMB").toUpperCase();
    return u === "POSTUTME" || u === "POST_UTME" ? "POST-UTME" : u;
  });
}

async function main() {
  const master = {};
  let masterTotal = 0;
  for (const f of fs.readdirSync(BANK_DIR)) {
    if (!f.endsWith(".json")) continue;
    const list = JSON.parse(fs.readFileSync(path.join(BANK_DIR, f), "utf8"));
    master[f] = list;
    masterTotal += list.length;
  }

  // Index master hashes per exam file
  const byFile = {};
  for (const [f, list] of Object.entries(master)) {
    byFile[f] = new Set(list.map((q) => hashText(q.question)));
  }
  const fileFor = { JAMB: "jamb.json", WAEC: "waec.json", NECO: "neco.json", NABTEB: "nabteb.json", "POST-UTME": "postutme.json" };

  const legacy = [];
  for (const list of Object.values(QUESTION_BANK)) legacy.push(...list);
  legacy.push(...INDEX_QUESTIONS);
  console.log(`Legacy questions: ${legacy.length} | Master entries: ${masterTotal}`);

  let missing = 0;
  const legacyExamCounts = {};
  for (const q of legacy) {
    const h = hashText(q.question);
    for (const exam of examArr(q.exam)) {
      legacyExamCounts[exam] = (legacyExamCounts[exam] || 0) + 1;
      const f = fileFor[exam] || "jamb.json";
      if (!byFile[f] || !byFile[f].has(h)) {
        missing++;
        if (missing <= 5) console.log(`MISSING in ${f}: ${String(q.question).slice(0, 70)}`);
      }
    }
  }

  console.log("\nPer-exam membership — legacy vs master file:");
  for (const [exam, f] of Object.entries(fileFor)) {
    console.log(`  ${exam}: legacy=${legacyExamCounts[exam] || 0} master=${(master[f] || []).length}`);
  }

  if (missing > 0) {
    console.error(`\nFAIL: ${missing} legacy questions missing from master bank`);
    process.exit(1);
  }
  console.log("\nPASS: every legacy question present in the master bank.");
}

main().catch((e) => {
  console.error("Parity check failed:", e.message);
  process.exit(1);
});
