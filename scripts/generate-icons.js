import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // School brand gradient: #0f766e (15, 118, 110) to #047857 (4, 120, 87)
      let r = Math.round(15 + ny * (4 - 15));
      let g = Math.round(118 + ny * (120 - 118));
      let b = Math.round(110 + ny * (87 - 110));
      let a = 255;

      if (!isMaskable) {
        // Rounded corners
        const cornerRadius = 0.22;
        const cornerDistX = Math.max(0, Math.abs(dx) - (0.5 - cornerRadius));
        const cornerDistY = Math.max(0, Math.abs(dy) - (0.5 - cornerRadius));
        const cornerDist = Math.hypot(cornerDistX, cornerDistY);
        if (cornerDist > cornerRadius) {
          a = 0;
        }
      }

      // Draw stylized book/badge in center
      // Book center around y=0.3 to 0.65, x=0.25 to 0.75
      if (a > 0) {
        if (ny > 0.28 && ny < 0.68 && nx > 0.22 && nx < 0.78) {
          // Inside emblem area
          const emblemY = (ny - 0.28) / 0.4;
          const emblemX = (nx - 0.22) / 0.56;
          // Book spine at emblemX = 0.5
          const distToSpine = Math.abs(emblemX - 0.5);
          const bookBottomCurve = 0.75 + Math.sin(distToSpine * Math.PI) * 0.12;
          const bookTopCurve = 0.35 + Math.sin(distToSpine * Math.PI) * 0.12;

          if (emblemY >= bookTopCurve && emblemY <= bookBottomCurve) {
            // Book page white
            r = 255;
            g = 255;
            b = 255;
            // Spine line
            if (distToSpine < 0.02) {
              r = 15;
              g = 118;
              b = 110;
            }
          }

          // Gold star / checkmark badge at center
          const badgeDist = Math.hypot(emblemX - 0.5, emblemY - 0.55);
          if (badgeDist < 0.12) {
            r = 16;
            g = 185;
            b = 129; // emerald badge
          }
          if (badgeDist < 0.05) {
            r = 254;
            g = 240;
            b = 138; // yellow center
          }

          // Community teacher heads (dots)
          const head1 = Math.hypot(emblemX - 0.5, emblemY - 0.22);
          const head2 = Math.hypot(emblemX - 0.32, emblemY - 0.26);
          const head3 = Math.hypot(emblemX - 0.68, emblemY - 0.26);
          if (head1 < 0.07 || head2 < 0.055 || head3 < 0.055) {
            r = 254;
            g = 240;
            b = 138;
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Non-interlaced

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', generatePNG(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', generatePNG(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', generatePNG(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', generatePNG(180, 180, false));
console.log('Successfully generated PWA compliant icons!');
