/**
 * Icon Generation Script
 *
 * This script helps generate icons for the app.
 * For production, you'll need to:
 *
 * 1. Use the SVG file at src/assets/icon.svg
 * 2. Convert to PNG at various sizes using a tool like:
 *    - Inkscape (CLI): inkscape -w 256 -h 256 icon.svg -o icon.png
 *    - ImageMagick: convert -background none icon.svg -resize 256x256 icon.png
 *    - Online tools: realfavicongenerator.net, convertio.co
 *
 * 3. Convert PNG to ICO for Windows using:
 *    - png2ico: png2ico icon.ico icon-256.png icon-128.png icon-64.png icon-32.png icon-16.png
 *    - ImageMagick: convert icon-256.png icon-128.png icon-64.png icon-32.png icon-16.png icon.ico
 *    - Online tools: convertico.com, icoconvert.com
 *
 * Required sizes for Windows ICO:
 * - 16x16
 * - 32x32
 * - 48x48
 * - 64x64
 * - 128x128
 * - 256x256
 *
 * For development/testing, a simple PNG at 256x256 works fine.
 */

console.log('Icon generation instructions:');
console.log('1. Open src/assets/icon.svg in a browser or Inkscape');
console.log('2. Export as PNG at 256x256 (and other sizes)');
console.log('3. Convert to ICO for Windows builds');
console.log('');
console.log('Quick online tools:');
console.log('- SVG to PNG: https://svgtopng.com/');
console.log('- PNG to ICO: https://convertico.com/');
