// scripts/capture-screenshots.js — captures landing screenshots with Playwright.
// Uses system Edge (channel: "msedge") to avoid the Playwright browser download.
// Serves the production build via `vite preview`, signs in with a test account,
// and captures 390×844 shots into public/images/.
//
// Required env: TEST_USER_EMAIL + TEST_USER_PASSWORD (a real Firebase account).
// Usage: npm run build && node scripts/capture-screenshots.js
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "images");
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

const SHOTS = [
  { name: "app-practice.png", route: "/select" },
  { name: "app-cbt.png", route: "/mock-exam" },
  { name: "app-dashboard.png", route: "/dashboard" },
  { name: "app-aitutor.png", route: "/ai-tutor" },
];

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
  } catch (_) {}
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Preview server did not start in time");
}

async function main() {
  loadDotEnv();
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email || !password) {
    console.error(
      "Missing TEST_USER_EMAIL / TEST_USER_PASSWORD in .env — create a Firebase test account and add them."
    );
    process.exit(1);
  }
  if (!fs.existsSync(path.join(ROOT, "dist", "index.html"))) {
    console.error("dist/ missing — run `npm run build` first.");
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    cwd: ROOT,
    shell: true,
    stdio: "ignore",
  });
  const kill = () => { try { server.kill(); } catch (_) {} };
  process.on("exit", kill);
  process.on("SIGINT", () => { kill(); process.exit(1); });

  try {
    await waitForServer();
    const browser = await chromium.launch({ channel: "msedge", headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

    // Sign in
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle" });
    await page.getByPlaceholder("Email address").fill(email);
    await page.getByPlaceholder("Password").fill(password);
    await page.getByRole("button", { name: /sign in|log in/i }).first().click();
    await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);

    for (const shot of SHOTS) {
      await page.goto(`${BASE}${shot.route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2500);
      // Hide the floating diagnostic button for clean shots
      await page.evaluate(() => {
        document.querySelectorAll("button").forEach((b) => {
          if (b.textContent && b.textContent.includes("Network Diagnostic")) b.style.display = "none";
        });
      });
      const out = path.join(OUT, shot.name);
      await page.screenshot({ path: out });
      const kb = Math.round(fs.statSync(out).size / 1024);
      console.log(`✓ ${shot.name} (${kb} KB)`);
      if (kb > 400) console.warn(`  ⚠ ${shot.name} is large — compress before shipping`);
    }

    await browser.close();
    console.log("\nDone. Review images in public/images/ before committing.");
  } finally {
    kill();
  }
}

main().catch((e) => {
  console.error("Screenshot capture failed:", e.message);
  process.exit(1);
});
