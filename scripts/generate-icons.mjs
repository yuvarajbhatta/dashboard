import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const iconDir = join(root, 'public', 'icons');
const splashDir = join(root, 'public', 'splash');
mkdirSync(iconDir, { recursive: true });
mkdirSync(splashDir, { recursive: true });

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function png(width, height, pixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = row + 1 + x * 4;
      const [r, g, b, a] = pixel(x, y, width, height);
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function iconPixel(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const radius = Math.sqrt(dx * dx + dy * dy) / (width / 2);
  const angle = Math.atan2(dy, dx);
  const sweep = (angle + Math.PI) / (Math.PI * 2);
  const ring = radius > 0.58 && radius < 0.86;
  const needle = Math.abs(dy + dx * 0.35) < width * 0.025 && dx > -width * 0.05 && dx < width * 0.32;
  const base = 6 + Math.round(18 * (1 - radius));
  let r = base;
  let g = base + 8;
  let b = base + 18;
  if (ring) {
    r = sweep > 0.72 ? 244 : sweep > 0.48 ? 163 : 34;
    g = sweep > 0.72 ? 63 : sweep > 0.48 ? 230 : 211;
    b = sweep > 0.72 ? 94 : sweep > 0.48 ? 53 : 238;
  }
  if (needle || radius < 0.08) {
    r = 226;
    g = 252;
    b = 255;
  }
  return [r, g, b, 255];
}

function splashPixel(x, y, width, height) {
  const v = y / height;
  const h = x / width;
  const scan = y % 18 === 0 ? 18 : 0;
  const beam = Math.max(0, 1 - Math.abs(h - 0.5) * 5) * Math.max(0, 1 - Math.abs(v - 0.42) * 3);
  return [
    Math.round(3 + beam * 31 + scan),
    Math.round(7 + beam * 180 + scan),
    Math.round(18 + beam * 210 + scan),
    255
  ];
}

writeFileSync(join(iconDir, 'icon-192.png'), png(192, 192, iconPixel));
writeFileSync(join(iconDir, 'icon-512.png'), png(512, 512, iconPixel));
writeFileSync(join(iconDir, 'apple-touch-icon.png'), png(180, 180, iconPixel));
writeFileSync(join(splashDir, 'iphone-splash.png'), png(1170, 2532, splashPixel));
