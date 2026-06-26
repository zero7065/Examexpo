const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BG = [108, 60, 233];    // #6C3CE9 purple
const GOLD = [212, 168, 83];  // #D4A853 gold

function createPNG(size) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const cx = x / width, cy = y / height;

      // Round icon (circle)
      const dx = cx - 0.5, dy = cy - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.5) {
        rawData[i] = 0; rawData[i+1] = 0; rawData[i+2] = 0; rawData[i+3] = 0;
        continue;
      }

      // Background - purple with slight gradient
      rawData[i] = BG[0]; rawData[i+1] = BG[1]; rawData[i+2] = BG[2]; rawData[i+3] = 255;

      // Draw "E" letter
      const letterW = 0.5, letterH = 0.6;
      const lx = (cx - 0.25) / letterW, ly = (cy - 0.2) / letterH;
      if (lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1) {
        const thick = 0.18;
        // Vertical bar of E
        if (lx < thick) { rawData[i] = GOLD[0]; rawData[i+1] = GOLD[1]; rawData[i+2] = GOLD[2]; }
        // Top bar
        else if (ly < thick) { rawData[i] = GOLD[0]; rawData[i+1] = GOLD[1]; rawData[i+2] = GOLD[2]; }
        // Middle bar
        else if (ly > 0.42 && ly < 0.58) { rawData[i] = GOLD[0]; rawData[i+1] = GOLD[1]; rawData[i+2] = GOLD[2]; }
        // Bottom bar
        else if (ly > 1 - thick) { rawData[i] = GOLD[0]; rawData[i+1] = GOLD[1]; rawData[i+2] = GOLD[2]; }
      }
    }
  }

  // Build PNG with proper IHDR, IDAT, IEND
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Filter bytes (each row: filter byte 0 + RGBA pixels)
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // no filter
    rawData.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const deflated = zlib.deflateSync(raw);

  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let n = 0; n < buf.length; n++) {
      c ^= buf[n];
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const t = Buffer.from(type);
    const c = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(c));
    return Buffer.concat([len, c, crc]);
  }

  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  return Buffer.concat([header, chunk("IHDR", ihdr), chunk("IDAT", deflated), chunk("IEND", Buffer.alloc(0))]);
}

const dir = path.join(__dirname, "..", "public", "icons");
fs.writeFileSync(path.join(dir, "icon-192.png"), createPNG(192));
fs.writeFileSync(path.join(dir, "icon-512.png"), createPNG(512));
console.log("✅ Generated valid 192x192 and 512x512 PNG icons with purple background + gold 'E'.");
