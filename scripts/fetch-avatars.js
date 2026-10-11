// scripts/fetch-avatars.js — downloads 24 DiceBear "avataaars" SVGs into
// public/avatars/ (one-off; committed assets afterward, fully offline-safe).
// Usage: node scripts/fetch-avatars.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "public", "avatars");

const SEEDS = [
  "Ada", "Chidi", "Emeka", "Aisha", "Tunde", "Ngozi",
  "Ibrahim", "Funke", "Yusuf", "Amara", "Olumide", "Zainab",
  "Kelechi", "Hadiza", "Segun", "Ifeoma", "Musa", "Blessing",
  "Fatima", "Damilola", "Chiamaka", "Abubakar", "Nafisa", "Olawale",
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let ok = 0;
  for (let i = 0; i < SEEDS.length; i++) {
    const seed = SEEDS[i];
    const file = path.join(OUT, `avatar-${String(i + 1).padStart(2, "0")}.svg`);
    if (fs.existsSync(file) && fs.statSync(file).size > 1000) {
      console.log(`skip ${file} (exists)`);
      ok++;
      continue;
    }
    const url = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for seed ${seed}`);
    const svg = await res.text();
    if (!svg.startsWith("<svg")) throw new Error(`Bad SVG for seed ${seed}`);
    fs.writeFileSync(file, svg);
    console.log(`✓ avatar-${String(i + 1).padStart(2, "0")}.svg (${seed}, ${(svg.length / 1024).toFixed(1)} KB)`);
    ok++;
  }
  console.log(`\nDone: ${ok}/${SEEDS.length} avatars in public/avatars/`);
}

main().catch((e) => {
  console.error("Avatar fetch failed:", e.message);
  process.exit(1);
});
