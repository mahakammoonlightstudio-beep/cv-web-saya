// =============================================================
// generate-icons.mjs — pembuat icon PWA/favicon monogram "F."
// Pure Node (zlib bawaan), tanpa dependensi eksternal.
// Output: assets/icons/*.png + apple-touch-icon.png
// =============================================================
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "icons");
mkdirSync(OUT, { recursive: true });

// ---------- Palet (senada design system) ----------
const INK = [16, 16, 20]; // #101014
const PAPER = [246, 245, 241]; // #f6f5f1
const TEAL = [45, 212, 191]; // #2dd4bf

// ---------- Util geometri (koordinat ruang 512) ----------
const inRect = (x, y, x1, y1, x2, y2) => x >= x1 && x <= x2 && y >= y1 && y <= y2;

// Monogram "F." — batang + dua palang + titik aksen
function glyphF(x, y) {
  return (
    inRect(x, y, 150, 120, 214, 392) || // batang vertikal
    inRect(x, y, 150, 120, 362, 184) || // palang atas
    inRect(x, y, 150, 248, 314, 304) || // palang tengah
    ((x - 398) ** 2 + (y - 360) ** 2) <= 36 ** 2 // titik "."
  );
}

function dotAccent(x, y) {
  return (x - 398) ** 2 + (y - 360) ** 2 <= 36 ** 2;
}

// Sampling warna satu piksel output (dengan supersampling anti-alias)
function samplePixel(px, py, size, scale, bg, fg) {
  const SS = 3;
  let r = 0, g = 0, b = 0;
  const step = size / px;

  for (let sy = 0; sy < SS; sy++) {
    for (let sx = 0; sx < SS; sx++) {
      const x = ((px + (sx + 0.5) / SS) * step);
      const y = ((py + (sy + 0.5) / SS) * step);

      // transformasi untuk maskable (scale di sekitar pusat)
      const xs = 256 + (x - 256) / scale;
      const ys = 256 + (y - 256) / scale;

      let c = bg;
      if (glyphF(xs, ys)) c = fg;
      if (dotAccent(xs, ys)) c = TEAL;

      r += c[0]; g += c[1]; b += c[2];
    }
  }
  const n = SS * SS;
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

// ---------- PNG Encoder minimal (RGBA, filter 0) ----------
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
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // tambah filter byte 0 di awal tiap scanline
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function renderIcon(size, { bg, fg, scale = 1 }) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const [r, g, b] = samplePixel(px, py, size, scale, bg, fg);
      const i = (py * size + px) * 4;
      rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = 255;
    }
  }
  return encodePNG(size, size, rgba);
}

function save(name, buf) {
  writeFileSync(join(OUT, name), buf);
  console.log("  ✓", name, `(${(buf.length / 1024).toFixed(1)} KB)`);
}

// ---------- Ekspor ----------
console.log("Generating icons...");

// Favicon & PWA "any" — latar ink, monogram paper
for (const s of [16, 32, 48, 192, 512]) {
  save(`icon-${s}.png`, renderIcon(s, { bg: INK, fg: PAPER }));
}

// Varian maskable — glyph diskala 0.78 agar aman di safe-zone launcher
for (const s of [192, 512]) {
  save(`icon-maskable-${s}.png`, renderIcon(s, { bg: INK, fg: PAPER, scale: 0.78 }));
}

// Apple touch — latar paper, monogram ink (terang, khas iOS)
save(join("..", "..", "apple-touch-icon.png").normalize(), renderIcon(180, { bg: PAPER, fg: INK }));

console.log("Done.");
