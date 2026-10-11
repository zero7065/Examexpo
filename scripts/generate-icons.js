// scripts/generate-icons.js — renders futuristic PWA icons (192 + 512px)
// with zero dependencies (raw RGBA PNG encoder via node:zlib).
// Usage: node scripts/generate-icons.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "public", "icons");

// ─── CRC32 ───
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([td, data])));
  return Buffer.concat([len, td, data, crc]);
}

function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (1 + w * 4) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

// ─── Painter ───
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function mix(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

function paint(size) {
  const S = size;
  const u = S / 512; // design units
  const px = new Uint8ClampedArray(S * S * 4);

  const BG_TOP = [11, 11, 22];
  const BG_MID = [20, 17, 39];
  const BG_BOT = [10, 26, 34];
  const PURPLE = [108, 60, 233];
  const VIOLET = [155, 89, 182];
  const TEAL = [0, 229, 160];
  const GOLD_HI = [255, 233, 168];
  const GOLD = [212, 168, 83];

  const set = (x, y, r, g, b, a) => {
    if (x < 0 || y < 0 || x >= S || y >= S) return;
    const i = (y * S + x) * 4;
    const sa = a / 255;
    const da = px[i + 3] / 255;
    const out = sa + da * (1 - sa);
    if (out <= 0) return;
    px[i] = (r * sa + px[i] * da * (1 - sa)) / out;
    px[i + 1] = (g * sa + px[i + 1] * da * (1 - sa)) / out;
    px[i + 2] = (b * sa + px[i + 2] * da * (1 - sa)) / out;
    px[i + 3] = out * 255;
  };

  const rect = (x0, y0, x1, y1, c, a = 255) => {
    for (let y = Math.max(0, Math.floor(y0)); y < Math.min(S, Math.ceil(y1)); y++)
      for (let x = Math.max(0, Math.floor(x0)); x < Math.min(S, Math.ceil(x1)); x++)
        set(x, y, c[0], c[1], c[2], a);
  };

  const rrect = (x0, y0, x1, y1, r, fill) => {
    // fill: fn(x, y) => [R,G,B,A]
    for (let y = Math.max(0, Math.floor(y0)); y < Math.min(S, Math.ceil(y1)); y++) {
      for (let x = Math.max(0, Math.floor(x0)); x < Math.min(S, Math.ceil(x1)); x++) {
        const dx = Math.min(x - x0, x1 - 1 - x);
        const dy = Math.min(y - y0, y1 - 1 - y);
        let alpha = 255;
        if (dx < r && dy < r) {
          const d = Math.hypot(r - dx, r - dy);
          if (d > r) continue;
          if (d > r - 1) alpha = Math.round(255 * (r - d));
        }
        const c = fill(x, y);
        set(x, y, c[0], c[1], c[2], Math.min(alpha, c[3] === undefined ? 255 : c[3]));
      }
    }
  };

  const disc = (cx, cy, r, c, a = 255) => {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= r) set(x, y, c[0], c[1], c[2], d > r - 1 ? Math.round(a * (r - d)) : a);
      }
  };

  const ring = (cx, cy, r, w, c, a) => {
    for (let y = Math.floor(cy - r - w); y <= Math.ceil(cy + r + w); y++)
      for (let x = Math.floor(cx - r - w); x <= Math.ceil(cx + r + w); x++) {
        const d = Math.abs(Math.hypot(x - cx, y - cy) - r);
        if (d <= w) set(x, y, c[0], c[1], c[2], Math.round(a * (1 - d / (w + 0.001))));
      }
  };

  const R = 116 * u;

  // 1) backdrop with rounded corners + vertical gradient + glow
  rrect(0, 0, S, S, R, (x, y) => {
    const t = y / S;
    let c = t < 0.55 ? mix(BG_TOP, BG_MID, t / 0.55) : mix(BG_MID, BG_BOT, (t - 0.55) / 0.45);
    const gd = Math.hypot(x - S * 0.5, y - S * 0.42) / (S * 0.55);
    const glow = Math.max(0, 1 - gd);
    c = mix(c, PURPLE, glow * glow * 0.45);
    return [c[0], c[1], c[2], 255];
  });

  // clip helper: rounded-rect mask test
  const inside = (x, y) => {
    if (x < 0 || y < 0 || x >= S || y >= S) return false;
    const dx = Math.min(x, S - 1 - x);
    const dy = Math.min(y, S - 1 - y);
    if (dx >= R || dy >= R) return true;
    return Math.hypot(R - dx, R - dy) <= R;
  };

  // 2) open-book base (dark slab + neon top edge)
  const book = (x, y) => {
    if (!inside(x, y)) return;
    // curved top edge: dips at center
    const edge = 368 * u - Math.abs(x - S / 2) * 0.06;
    if (y < edge - 14 * u || y > 394 * u) return;
    if (y < edge) set(x, y, 155, 89, 182, 220); // neon rim
    else set(x, y, 30, 27, 51, 255); // slab
  };
  for (let y = Math.floor(340 * u); y < Math.ceil(400 * u); y++)
    for (let x = Math.floor(120 * u); x < Math.ceil(392 * u); x++) book(x, y);

  // 3) E letterform (spine + bars, purple→teal; middle bar gold)
  const bar = (x0, y0, x1, y1, c0, c1, vertical = false) => {
    for (let y = Math.floor(y0); y < Math.ceil(y1); y++)
      for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
        if (!inside(x, y)) continue;
        const t = vertical ? (y - y0) / (y1 - y0) : (x - x0) / (x1 - x0);
        const c = mix(c0, c1, Math.max(0, Math.min(1, t)));
        set(x, y, c[0], c[1], c[2], 255);
      }
  };
  const rBar = 22 * u;
  const ebar = (x0, y0, x1, y1, c0, c1) => {
    // rounded bar via disc caps + rect body
    bar(x0 + rBar, y0, x1 - rBar, y1, c0, c1);
    const cy = (y0 + y1) / 2;
    const rr = (y1 - y0) / 2;
    for (let y = Math.floor(y0); y < Math.ceil(y1); y++)
      for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
        if (!inside(x, y)) continue;
        const dl = Math.hypot(x - (x0 + rBar), y - cy);
        const dr = Math.hypot(x - (x1 - rBar), y - cy);
        if (dl <= rr || dr <= rr || (x >= x0 + rBar && x <= x1 - rBar)) {
          const t = (x - x0) / (x1 - x0);
          const c = mix(c0, c1, Math.max(0, Math.min(1, t)));
          set(x, y, c[0], c[1], c[2], 255);
        }
      }
  };
  // spine (vertical gradient purple→violet)
  bar(148 * u, 108 * u, 192 * u, 320 * u, PURPLE, VIOLET, true);
  disc(170 * u, 108 * u, 22 * u, PURPLE);
  disc(170 * u, 320 * u, 22 * u, VIOLET);
  // bars
  ebar(148 * u, 108 * u, 344 * u, 152 * u, PURPLE, TEAL);
  ebar(148 * u, 204 * u, 380 * u, 248 * u, GOLD_HI, GOLD);
  ebar(148 * u, 300 * u, 320 * u, 320 * u, PURPLE, VIOLET);
  // scan sheen on middle bar
  for (let y = Math.floor(214 * u); y < Math.ceil(238 * u); y++)
    for (let x = Math.floor(160 * u); x < Math.ceil(368 * u); x++) {
      if (!inside(x, y)) continue;
      set(x, y, 255, 255, 255, 40);
    }

  // 4) bot eye + ripples
  const ex = 392 * u, ey = 130 * u;
  ring(ex, ey, 54 * u, 4 * u, TEAL, 140);
  ring(ex, ey, 78 * u, 4 * u, TEAL, 70);
  ring(ex, ey, 102 * u, 4 * u, TEAL, 32);
  disc(ex, ey, 34 * u, [11, 11, 22]);
  ring(ex, ey, 34 * u, 5 * u, GOLD, 255);
  disc(ex, ey, 12 * u, GOLD_HI);

  return px;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const size of [192, 512]) {
    const px = paint(size);
    const png = encodePNG(size, size, px);
    const file = path.join(OUT, `icon-${size}.png`);
    fs.writeFileSync(file, png);
    console.log(`✓ icon-${size}.png (${(png.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((e) => {
  console.error("Icon generation failed:", e.message);
  process.exit(1);
});
