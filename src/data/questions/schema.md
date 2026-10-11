# Master Question Bank — Schema

Canonical shape for every question in `src/data/questions/master-bank/*.json`.
Superset of the two legacy shapes (`questionBank.js`, `questions/index.js`)
so migration loses nothing.

```json
{
  "id": "jamb-2024-eng-001",
  "subject": "English Language",
  "topic": "Concord",
  "exam": ["JAMB"],
  "year": 2024,
  "difficulty": "easy | medium | hard",
  "question": "Full question text…",
  "options": { "A": "…", "B": "…", "C": "…", "D": "…" },
  "correctAnswer": "B",
  "explanation": "Why B is right…",
  "hint": "Optional nudge shown before answering",
  "commonMistake": "What students usually pick wrongly and why",
  "syllabusCode": "ENG-04",
  "highYield": true,
  "repeatedFrom": [2019, 2021, 2024],
  "source": "past | seed",
  "createdAt": "2026-10-01T00:00:00.000Z"
}
```

## Field rules (enforced by `scripts/validate-bank.js`)

| Field | Required | Rule |
|---|---|---|
| `id` | yes | kebab-case, unique **within its exam file** (`{exam}-{year}-{slug}-{nnn}`); cross-file identity is by normalized-text hash |
| `subject` | yes | Canonical subject name (see aliases in `compat.js`) |
| `topic` | yes | Non-empty; normalized for repetition grouping (trim, collapse spaces) |
| `exam` | yes | Non-empty array; values ⊆ `JAMB, WAEC, NECO, NABTEB, POST-UTME` |
| `year` | yes | Integer 1990–2030 |
| `difficulty` | yes | `easy \| medium \| hard` |
| `question` | yes | Non-empty text |
| `options` | yes | Exactly keys A,B,C,D, all non-empty strings |
| `correctAnswer` | yes | One of `A,B,C,D` |
| `explanation` | yes | Non-empty |
| `hint` | no | Short nudge |
| `commonMistake` | no | Enrichment output |
| `syllabusCode` | no | Enrichment output |
| `highYield` | no | Set by `analyze-repetition.js` (default false) |
| `repeatedFrom` | no | Sorted unique years, set by `analyze-repetition.js` |
| `source` | no | `past` (real paper) or `seed` (curated) |
| `createdAt` | no | ISO timestamp of ingestion |

## Files

- `master-bank/jamb.json`, `waec.json`, `neco.json`, `nabteb.json` — arrays of questions.
- A question appearing in two exams has **one entry per file** sharing the same
  `id` stem with an exam suffix is NOT used — instead each file holds full
  entries and cross-file duplicates are detected by normalized-text hash
  (see `ingest-questions.js`), keeping per-file reads simple.
- Files are loaded lazily per exam via `master.js` (`loadBank(exam)`).

## Legacy mapping

| Legacy (`questionBank.js`) | Legacy (`questions/index.js`) | Canonical |
|---|---|---|
| `correctAnswer` | `answer` | `correctAnswer` |
| `exam: "JAMB"` (string) | `exam: ["JAMB"]` (array) | `exam: [...]` (array) |
| — | `hint` | `hint` (optional) |
| `id` ad-hoc | `id` ad-hoc | re-keyed, old id kept in nothing (ids are internal) |
