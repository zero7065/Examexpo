// scripts/ingest-questions.js — OCR past-paper photos into the master bank.
//
// Usage:
//   node scripts/ingest-questions.js --dir raw-papers/JAMB_2024_English [--exam JAMB] [--year 2024] [--subject "English Language"] [--dry-run]
//
// Folder names matching {EXAM}_{YEAR}_{Subject words} auto-fill missing flags.
// Reads GROQ key from .env (VITE_GROQ_API_KEY). 600ms spacing + 429 backoff.
// Appends canonical entries to src/data/questions/master-bank/{exam}.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BANK_DIR = path.join(ROOT, "src", "data", "questions", "master-bank");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "allam-2-7b"];
const VISION_MODEL = "qwen/qwen3.8-27b";

function loadDotEnv() {
  try {
    const text = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      if (!(k in process.env)) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  } catch { /* .env optional */ }
}

function args() {
  const out = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      out[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    }
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function groqText(system, user, maxTokens, temperature = 0.4) {
  const key = process.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("VITE_GROQ_API_KEY missing in .env");
  let lastErr;
  for (const model of MODELS) {
    const tokens = model.startsWith("openai/gpt-oss") ? maxTokens + 2000 : maxTokens;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(GROQ_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }], max_tokens: tokens, temperature }),
        });
        if (res.status === 429) {
          console.log(`  429 on ${model} — backing off 10s`);
          await sleep(10000);
          continue;
        }
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.choices[0]?.message?.content?.trim() || "";
      } catch (e) {
        lastErr = e;
        if (String(e.message).includes("429")) await sleep(10000);
        else break;
      }
    }
    await sleep(600);
  }
  throw lastErr || new Error("All models failed");
}

async function groqVision(system, text, imageDataUrl) {
  const key = process.env.VITE_GROQ_API_KEY;
  const body = {
    model: VISION_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: [{ type: "text", text }, { type: "image_url", image_url: { url: imageDataUrl } }] },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    if (res.status === 429) {
      console.log("  429 on vision — backing off 10s");
      await sleep(10000);
      continue;
    }
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.choices[0]?.message?.content?.trim() || "";
  }
  throw new Error("Vision failed after retries");
}

function stripFences(s) {
  return String(s || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
}

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

const FILE_FOR = { JAMB: "jamb.json", WAEC: "waec.json", NECO: "neco.json", NABTEB: "nabteb.json", "POST-UTME": "postutme.json" };

async function main() {
  loadDotEnv();
  const a = args();
  if (!a.dir) {
    console.error("Usage: node scripts/ingest-questions.js --dir raw-papers/JAMB_2024_English [--exam JAMB] [--year 2024] [--subject \"English Language\"] [--dry-run]");
    process.exit(1);
  }

  // Auto-detect from folder name: {EXAM}_{YEAR}_{Subject...}
  const base = path.basename(path.resolve(a.dir));
  const m = base.match(/^([A-Za-z-]+)_(\d{4})_(.+)$/);
  const exam = String(a.exam || (m && m[1]) || "JAMB").toUpperCase().replace("POSTUTME", "POST-UTME");
  const year = Number(a.year || (m && m[2]) || 0);
  const subject = String(a.subject || (m && m[3]?.replace(/_/g, " ")) || "General");
  const dryRun = !!a["dry-run"];

  if (!year) {
    console.error("Could not determine year — pass --year YYYY");
    process.exit(1);
  }
  console.log(`Ingesting ${exam} ${year} ${subject} from ${a.dir}${dryRun ? " (DRY RUN)" : ""}`);

  const files = fs.readdirSync(a.dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  if (files.length === 0) {
    console.error("No images found in folder");
    process.exit(1);
  }
  console.log(`${files.length} image(s)`);

  const bankFile = path.join(BANK_DIR, FILE_FOR[exam] || "jamb.json");
  const bank = JSON.parse(fs.readFileSync(bankFile, "utf8"));
  const seen = new Set(bank.map((q) => hashText(q.question)));
  const counters = {};
  for (const q of bank) {
    const mm = String(q.id).match(/^(.*-(\d{3}))$/);
    if (mm) {
      const prefix = String(q.id).slice(0, -4);
      counters[prefix] = Math.max(counters[prefix] || 0, Number(mm[2]));
    }
  }

  let added = 0, skipped = 0;
  for (const file of files) {
    const full = path.join(a.dir, file);
    const stat = fs.statSync(full);
    if (stat.size > 6 * 1024 * 1024) console.log(`  ⚠ ${file} is large (${(stat.size / 1048576).toFixed(1)}MB) — OCR may be slow`);
    console.log(`\n[${file}] OCR…`);
    const ext = path.extname(file).slice(1).toLowerCase() === "png" ? "png" : "jpeg";
    const dataUrl = `data:image/${ext};base64,${fs.readFileSync(full).toString("base64")}`;

    let transcript;
    try {
      transcript = await groqVision(
        "You transcribe Nigerian exam past-paper photos. Return ONLY the transcribed text, preserving question numbers, options A-D, and instructions. No commentary.",
        "Transcribe every question and option letter in this photo exactly.",
        dataUrl
      );
    } catch (e) {
      console.log(`  OCR failed: ${e.message} — skipping`);
      skipped++;
      continue;
    }
    await sleep(600);

    let parsed;
    try {
      const raw = await groqText(
        "You extract exam questions into JSON. Return ONLY valid JSON, no markdown fences.",
        `Extract every complete question into a JSON array. Each item exactly: {"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A|B|C|D"}. Omit questions whose answer is unknown. Transcript:\n\n${transcript}`,
        3000, 0.3
      );
      const p = JSON.parse(stripFences(raw));
      parsed = Array.isArray(p) ? p : p.questions;
      if (!Array.isArray(parsed)) throw new Error("no array");
    } catch (e) {
      console.log(`  Parse failed: ${e.message} — skipping`);
      skipped++;
      continue;
    }
    await sleep(600);

    for (const q of parsed) {
      if (!q?.question || !["A", "B", "C", "D"].includes(String(q.answer || "").toUpperCase())) { skipped++; continue; }
      if (!["A", "B", "C", "D"].every((k) => String(q.options?.[k] || "").trim())) { skipped++; continue; }
      const h = hashText(q.question);
      if (seen.has(h)) { skipped++; continue; }
      seen.add(h);

      let en = { topic: "General", difficulty: "medium", explanation: "", commonMistake: undefined, syllabusCode: undefined };
      try {
        const raw = await groqText(
          "You are a Nigerian curriculum expert. Return ONLY valid JSON, no markdown fences.",
          `Return JSON exactly: {"topic":"<short>","difficulty":"easy|medium|hard","explanation":"<2-3 sentences>","commonMistake":"<...>","syllabusCode":"<CODE-nn or null>"}. Subject: ${subject}. Question: ${q.question} Options: ${JSON.stringify(q.options)} Answer: ${q.answer}`,
          600, 0.4
        );
        const e = JSON.parse(stripFences(raw));
        en = {
          topic: String(e.topic || "General").slice(0, 60),
          difficulty: ["easy", "medium", "hard"].includes(e.difficulty) ? e.difficulty : "medium",
          explanation: String(e.explanation || "").slice(0, 600),
          commonMistake: String(e.commonMistake || "").slice(0, 300) || undefined,
          syllabusCode: e.syllabusCode || undefined,
        };
      } catch {
        console.log(`  Enrichment failed for one question — using defaults`);
      }
      await sleep(600);

      const prefix = `${exam.toLowerCase()}-${year}-${slug3(subject)}`;
      counters[prefix] = (counters[prefix] || 0) + 1;
      bank.push({
        id: `${prefix}-${String(counters[prefix]).padStart(3, "0")}`,
        subject,
        topic: en.topic,
        exam: [exam],
        year,
        difficulty: en.difficulty,
        question: String(q.question),
        options: { A: String(q.options.A), B: String(q.options.B), C: String(q.options.C), D: String(q.options.D) },
        correctAnswer: String(q.answer).toUpperCase(),
        explanation: en.explanation,
        ...(en.commonMistake ? { commonMistake: en.commonMistake } : {}),
        ...(en.syllabusCode ? { syllabusCode: en.syllabusCode } : {}),
        source: "past",
        createdAt: new Date().toISOString(),
      });
      added++;
    }
  }

  console.log(`\nDone: +${added} questions, ${skipped} skipped`);
  if (!dryRun) {
    fs.writeFileSync(bankFile, JSON.stringify(bank, null, 1));
    console.log(`Wrote ${bankFile} (${bank.length} total)`);
    console.log("Next: node scripts/analyze-repetition.js && node scripts/validate-bank.js");
  } else {
    console.log("Dry run — nothing written.");
  }
}

main().catch((e) => {
  console.error("Ingest failed:", e.message);
  process.exit(1);
});
