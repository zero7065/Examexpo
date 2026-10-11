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

  const BG_TOP = [7, 18, 12];
  const BG_MID = [16, 36, 26];
  const BG_BOT = [10, 22, 30];
  const SAGE = [106, 154, 106];
  const SAGE_HI = [143, 206, 143];
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
    c = mix(c, SAGE, glow * glow * 0.45);
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
    if (y < edge) set(x, y, 106, 154, 106, 220); // sage rim
    else set(x, y, 18, 38, 26, 255); // slab
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
  // spine (vertical gradient sage)
  bar(148 * u, 108 * u, 192 * u, 320 * u, SAGE, SAGE_HI, true);
  disc(170 * u, 108 * u, 22 * u, SAGE);
  disc(170 * u, 320 * u, 22 * u, SAGE_HI);
  // bars: sage top, gold middle, sage bottom
  ebar(148 * u, 108 * u, 344 * u, 152 * u, SAGE, SAGE_HI);
  ebar(148 * u, 204 * u, 380 * u, 248 * u, GOLD_HI, GOLD);
  ebar(148 * u, 300 * u, 320 * u, 320 * u, SAGE, SAGE_HI);
  // scan sheen on middle bar
  for (let y = Math.floor(214 * u); y < Math.ceil(238 * u); y++)
    for (let x = Math.floor(160 * u); x < Math.ceil(368 * u); x++) {
      if (!inside(x, y)) continue;
      set(x, y, 255, 255, 255, 40);
    }

  // 4) bot eye + ripples
  const ex = 392 * u, ey = 130 * u;
  ring(ex, ey, 54 * u, 4 * u, SAGE_HI, 140);
  ring(ex, ey, 78 * u, 4 * u, SAGE_HI, 70);
  ring(ex, ey, 102 * u, 4 * u, SAGE_HI, 32);
  disc(ex, ey, 34 * u, [7, 18, 12]);
  ring(ex, ey, 34 * u, 5 * u, GOLD, 255);
  disc(ex, ey, 12 * u, GOLD_HI);

  return px;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const size of [180, 192, 512]) {
    const px = paint(size);
    const png = encodePNG(size, size, px);
    const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
    const file = path.join(OUT, name);
    fs.writeFileSync(file, png);
    console.log(`✓ ${name} (${(png.length / 1024).toFixed(1)} KB)`);
  }

  // Maskable icon: solid backdrop, art at 72% centered (safe zone)
  {
    const S = 512;
    const px = new Uint8ClampedArray(S * S * 4);
    for (let i = 0; i < S * S; i++) {
      px[i * 4] = 9; px[i * 4 + 1] = 20; px[i * 4 + 2] = 15; px[i * 4 + 3] = 255;
    }
    const art = paint(512);
    const scale = 0.72;
    const off = Math.floor(S * (1 - scale) / 2);
    const dst = Math.floor(S * scale);
    for (let y = 0; y < dst; y++) {
      for (let x = 0; x < dst; x++) {
        const sx = Math.min(511, Math.floor((x / dst) * 512));
        const sy = Math.min(511, Math.floor((y / dst) * 512));
        const s = (sy * 512 + sx) * 4;
        const sa = art[s + 3] / 255;
        // art is on transparent bg: blend only where opaque
        if (sa <= 0) continue;
        const d = ((y + off) * S + (x + off)) * 4;
        px[d] = art[s]; px[d + 1] = art[s + 1]; px[d + 2] = art[s + 2]; px[d + 3] = 255;
      }
    }
    const png = encodePNG(S, S, px);
    fs.writeFileSync(path.join(OUT, "icon-maskable-512.png"), png);
    console.log(`✓ icon-maskable-512.png (${(png.length / 1024).toFixed(1)} KB)`);
  }

  // Social share card 1200×630: seamless backdrop (same formula as art),
  // art placed left, gold orbit accents right.
  {
    const W = 1200, H = 630;
    const px = new Uint8ClampedArray(W * H * 4);
    // art-local backdrop formula (matches paint() step 1)
    const artBg = (lx, ly) => {
      const t = ly / 512;
      let c = t < 0.55
        ? [7 + (16 - 7) * (t / 0.55), 18 + (36 - 18) * (t / 0.55), 12 + (26 - 12) * (t / 0.55)]
        : [16 + (10 - 16) * ((t - 0.55) / 0.45), 36 + (22 - 36) * ((t - 0.55) / 0.45), 26 + (30 - 26) * ((t - 0.55) / 0.45)];
      const gd = Math.hypot(lx - 256, ly - 215) / (512 * 0.55);
      const glow = Math.max(0, 1 - gd);
      const k = glow * glow * 0.45;
      return [c[0] + (106 - c[0]) * k, c[1] + (154 - c[1]) * k, c[2] + (106 - c[2]) * k];
    };
    const art = paint(512);
    const dst = 460;
    const ox = 90, oy = Math.floor((H - dst) / 2);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const inArt = x >= ox && x < ox + dst && y >= oy && y < oy + dst;
        if (inArt) {
          const lx = Math.min(511, Math.floor(((x - ox) / dst) * 512));
          const ly = Math.min(511, Math.floor(((y - oy) / dst) * 512));
          const s = (ly * 512 + lx) * 4;
          if (art[s + 3] > 0) {
            px[i] = art[s]; px[i + 1] = art[s + 1]; px[i + 2] = art[s + 2]; px[i + 3] = 255;
            continue;
          }
          const b = artBg(lx, ly);
          px[i] = b[0]; px[i + 1] = b[1]; px[i + 2] = b[2]; px[i + 3] = 255;
          continue;
        }
        const t = y / H;
        px[i] = Math.round(7 + (10 - 7) * t);
        px[i + 1] = Math.round(18 + (22 - 18) * t);
        px[i + 2] = Math.round(12 + (30 - 12) * t);
        px[i + 3] = 255;
      }
    }
    // gold orbit arcs on the right
    const cx = 950, cy = 315;
    for (const [rr, a] of [[150, 160], [210, 90], [270, 45]]) {
      for (let deg = 0; deg < 360; deg += 1) {
        const rad = (deg * Math.PI) / 180;
        const x = Math.round(cx + rr * Math.cos(rad));
        const y = Math.round(cy + rr * Math.sin(rad));
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = (y * W + x) * 4;
        const sa = a / 255;
        px[i] = Math.round(212 * sa + px[i] * (1 - sa));
        px[i + 1] = Math.round(168 * sa + px[i + 1] * (1 - sa));
        px[i + 2] = Math.round(83 * sa + px[i + 2] * (1 - sa));
      }
    }
    const png = encodePNG(W, H, px);
    fs.writeFileSync(path.join(OUT, "..", "og-image.png"), png);
    console.log(`✓ og-image.png (${(png.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((e) => {
  console.error("Icon generation failed:", e.message);
  process.exit(1);
});
