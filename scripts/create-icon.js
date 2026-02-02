const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const icoPath = path.join(buildDir, 'icon.ico');
const pngPath = path.join(__dirname, '..', 'src', 'assets', 'icon.png');

// Create a simple 256x256 feather icon as PNG
function createFeatherIconPNG(size) {
  const width = size;
  const height = size;

  // Create raw pixel data (RGBA)
  const rawData = Buffer.alloc(width * height * 4);

  // Fill with transparent background and draw a simple feather shape
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Background color (dark purple/blue - #1a1a1f)
      const bgR = 0x1a, bgG = 0x1a, bgB = 0x1f;

      // Accent color (blue - #7c9cff)
      const acR = 0x7c, acG = 0x9c, acB = 0xff;

      // Normalize coordinates to 0-1
      const nx = x / width;
      const ny = y / height;

      // Draw a circular background
      const cx = 0.5, cy = 0.5;
      const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);

      if (dist < 0.45) {
        // Inside circle - draw background
        rawData[idx] = bgR;
        rawData[idx + 1] = bgG;
        rawData[idx + 2] = bgB;
        rawData[idx + 3] = 255;

        // Draw a simple feather quill shape
        // Diagonal line from top-right to bottom-left
        const featherX = 0.65 - ny * 0.5;
        const featherDist = Math.abs(nx - featherX);

        // Feather body width varies
        const featherWidth = 0.08 + ny * 0.04;

        if (featherDist < featherWidth && ny > 0.15 && ny < 0.85) {
          // Feather color with gradient
          const blend = ny;
          rawData[idx] = Math.floor(acR * (1 - blend * 0.3));
          rawData[idx + 1] = Math.floor(acG * (1 - blend * 0.2));
          rawData[idx + 2] = Math.floor(acB);
          rawData[idx + 3] = 255;
        }

        // Feather spine (white line)
        if (featherDist < 0.01 && ny > 0.15 && ny < 0.85) {
          rawData[idx] = 0xe8;
          rawData[idx + 1] = 0xe8;
          rawData[idx + 2] = 0xec;
          rawData[idx + 3] = 255;
        }
      } else {
        // Outside circle - transparent
        rawData[idx] = 0;
        rawData[idx + 1] = 0;
        rawData[idx + 2] = 0;
        rawData[idx + 3] = 0;
      }
    }
  }

  // Create PNG file
  // PNG filter: add filter byte (0 = None) at the start of each row
  const filteredData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    filteredData[y * (1 + width * 4)] = 0; // Filter type: None
    rawData.copy(filteredData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  // Compress with zlib
  const compressed = zlib.deflateSync(filteredData, { level: 9 });

  // Build PNG file
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // bit depth
  ihdrData.writeUInt8(6, 9);  // color type (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createPNGChunk('IHDR', ihdrData);
  const idatChunk = createPNGChunk('IDAT', compressed);
  const iendChunk = createPNGChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createPNGChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation for PNG
function crc32(data) {
  let crc = 0xffffffff;
  const table = getCRC32Table();

  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

let crcTable = null;
function getCRC32Table() {
  if (crcTable) return crcTable;

  crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }
  return crcTable;
}

// Create the PNG icon
const png256 = createFeatherIconPNG(256);

// Save PNG
fs.writeFileSync(pngPath, png256);
console.log('Created icon.png at:', pngPath);

// Create ICO file with PNG embedded
// ICO format: ICONDIR + ICONDIRENTRY + PNG data

const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0);      // Reserved
iconDir.writeUInt16LE(1, 2);      // Type (1 = icon)
iconDir.writeUInt16LE(1, 4);      // Number of images

const iconDirEntry = Buffer.alloc(16);
iconDirEntry.writeUInt8(0, 0);              // Width (0 = 256)
iconDirEntry.writeUInt8(0, 1);              // Height (0 = 256)
iconDirEntry.writeUInt8(0, 2);              // Color palette
iconDirEntry.writeUInt8(0, 3);              // Reserved
iconDirEntry.writeUInt16LE(1, 4);           // Color planes
iconDirEntry.writeUInt16LE(32, 6);          // Bits per pixel
iconDirEntry.writeUInt32LE(png256.length, 8);  // Size of image data
iconDirEntry.writeUInt32LE(22, 12);         // Offset to image data

const icoBuffer = Buffer.concat([iconDir, iconDirEntry, png256]);
fs.writeFileSync(icoPath, icoBuffer);
console.log('Created icon.ico at:', icoPath);
