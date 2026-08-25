import fs from 'fs';
import path from 'path';

// Minimal valid 1x1 green PNG buffer scaled up or valid SVG-to-PNG generator
// Create SVG icon first
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="#2D7A4E"/>
  <path d="M256 100 C340 100 400 160 400 256 C400 352 320 400 256 412 C192 400 112 352 112 256 C112 160 172 100 256 100 Z" fill="#6BBF59"/>
  <path d="M256 412 L256 200" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round"/>
  <path d="M256 260 C290 230 330 230 350 250" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" fill="none"/>
  <path d="M256 310 C220 280 180 280 160 300" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" fill="none"/>
</svg>`;

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Created icon.svg successfully!');
