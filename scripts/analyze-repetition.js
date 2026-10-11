// scripts/analyze-repetition.js — flags high-yield topics per subject.
// Adaptive rule: within each subject, rank topics by distinct-year count;
// topics in the TOP 15% with at least MIN_YEARS distinct years get
// highYield: true + repeatedFrom: [sorted years]. Thresholds tighten
// automatically as the bank grows. Re-run after every ingest batch:
//   node scripts/analyze-repetition.js [--min-years 3] [--top-pct 0.15]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANK_DIR = path.resolve(__dirname, "..", "src", "data", "questions", "master-bank");

function normTopic(t) {
  return String(t || "General").trim().replace(/\s+/g, " ").toLowerCase();
}

async function main() {
  const argv = process.argv.slice(2);
  const minYears = Number((argv[argv.indexOf("--min-years") + 1] ?? 3)) || 3;
  const topPct = Number((argv[argv.indexOf("--top-pct") + 1] ?? 0.15)) || 0.15;

  for (const f of fs.readdirSync(BANK_DIR)) {
    if (!f.endsWith(".json")) continue;
    const full = path.join(BANK_DIR, f);
    const bank = JSON.parse(fs.readFileSync(full, "utf8"));

    // Group by subject + normalized topic → distinct years
    const groups = new Map(); // key -> {subject, topic(display), years:Set}
    for (const q of bank) {
      const key = `${q.subject}::${normTopic(q.topic)}`;
      if (!groups.has(key)) groups.set(key, { subject: q.subject, topic: q.topic, years: new Set() });
      if (q.year) groups.get(key).years.add(q.year);
    }

    // Per subject: rank by year count, take top topPct with >= minYears
    const bySubject = new Map();
    for (const g of groups.values()) {
      if (!bySubject.has(g.subject)) bySubject.set(g.subject, []);
      bySubject.get(g.subject).push(g);
    }
    const flagged = new Set();
    for (const [subject, list] of bySubject) {
      list.sort((a, b) => b.years.size - a.years.size);
      const cutoff = Math.max(1, Math.ceil(list.length * topPct));
      list.slice(0, cutoff).forEach((g) => {
        if (g.years.size >= minYears) flagged.add(`${subject}::${normTopic(g.topic)}`);
      });
      const flaggedCount = list.filter((g) => flagged.has(`${subject}::${normTopic(g.topic)}`)).length;
      console.log(`${f} / ${subject}: ${list.length} topics, ${flaggedCount} high-yield (min ${minYears} yrs)`);
    }

    let changed = 0;
    for (const q of bank) {
      const key = `${q.subject}::${normTopic(q.topic)}`;
      const group = groups.get(key);
      const years = group ? [...group.years].sort((a, b) => a - b) : [];
      const isHY = flagged.has(key);
      if ((q.highYield || false) !== isHY || JSON.stringify(q.repeatedFrom || []) !== JSON.stringify(years)) {
        q.highYield = isHY;
        q.repeatedFrom = years;
        changed++;
      }
    }
    fs.writeFileSync(full, JSON.stringify(bank, null, 1));
    console.log(`  → ${f}: ${changed} entries updated\n`);
  }
  console.log("Done. Run node scripts/validate-bank.js to verify.");
}

main().catch((e) => {
  console.error("Analysis failed:", e.message);
  process.exit(1);
});
