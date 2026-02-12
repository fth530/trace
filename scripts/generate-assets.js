/**
 * Generate Trace app icon and splash PNG assets
 * Pure Node.js — no external dependencies
 * Draws a stylized "T" letter on dark background
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// --- PNG ENCODER (Pure JS) ---

function createPNG(width, height, pixels) {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;   // bit depth
    ihdrData[9] = 6;   // color type: RGBA
    ihdrData[10] = 0;
    ihdrData[11] = 0;
    ihdrData[12] = 0;
    const ihdr = createChunk('IHDR', ihdrData);

    // IDAT
    const rowSize = 1 + width * 4; // filter byte + RGBA
    const rawData = Buffer.alloc(rowSize * height);

    for (let y = 0; y < height; y++) {
        const rowOffset = y * rowSize;
        rawData[rowOffset] = 0; // no filter
        for (let x = 0; x < width; x++) {
            const srcIdx = (y * width + x) * 4;
            const dstIdx = rowOffset + 1 + x * 4;
            rawData[dstIdx] = pixels[srcIdx];       // R
            rawData[dstIdx + 1] = pixels[srcIdx + 1]; // G
            rawData[dstIdx + 2] = pixels[srcIdx + 2]; // B
            rawData[dstIdx + 3] = pixels[srcIdx + 3]; // A
        }
    }

    const compressed = zlib.deflateSync(rawData, { level: 9 });
    const idat = createChunk('IDAT', compressed);
    const iend = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? ((c >>> 1) ^ 0xEDB88320) : (c >>> 1);
        }
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
}

// --- DRAWING HELPERS ---

function createPixelBuffer(w, h) {
    return new Uint8Array(w * h * 4);
}

function fillRect(pixels, W, x1, y1, w, h, r, g, b, a) {
    for (let y = y1; y < y1 + h && y < W; y++) {
        for (let x = x1; x < x1 + w; x++) {
            const idx = (y * W + x) * 4;
            pixels[idx] = r;
            pixels[idx + 1] = g;
            pixels[idx + 2] = b;
            pixels[idx + 3] = a;
        }
    }
}

function fillBackground(pixels, W, H, r, g, b) {
    for (let i = 0; i < W * H; i++) {
        pixels[i * 4] = r;
        pixels[i * 4 + 1] = g;
        pixels[i * 4 + 2] = b;
        pixels[i * 4 + 3] = 255;
    }
}

// Draw circle (filled)
function fillCircle(pixels, W, cx, cy, radius, r, g, b, a) {
    const r2 = radius * radius;
    for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
        for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
            const dx = x - cx;
            const dy = y - cy;
            const dist2 = dx * dx + dy * dy;
            if (dist2 <= r2) {
                const idx = (y * W + x) * 4;
                // Anti-alias: blend at edges
                const edgeDist = Math.sqrt(dist2) - radius + 1.5;
                if (edgeDist > 0 && edgeDist < 1.5) {
                    const blend = 1 - edgeDist / 1.5;
                    const alpha = Math.round(a * blend);
                    pixels[idx] = r;
                    pixels[idx + 1] = g;
                    pixels[idx + 2] = b;
                    pixels[idx + 3] = Math.max(pixels[idx + 3], alpha);
                } else if (edgeDist <= 0) {
                    pixels[idx] = r;
                    pixels[idx + 1] = g;
                    pixels[idx + 2] = b;
                    pixels[idx + 3] = a;
                }
            }
        }
    }
}

// Glow effect around a region
function addGlow(pixels, W, H, cx, cy, glowRadius, r, g, b) {
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < glowRadius && dist > 0) {
                const idx = (y * W + x) * 4;
                const intensity = Math.pow(1 - dist / glowRadius, 2) * 0.3;
                pixels[idx] = Math.min(255, pixels[idx] + Math.round(r * intensity));
                pixels[idx + 1] = Math.min(255, pixels[idx + 1] + Math.round(g * intensity));
                pixels[idx + 2] = Math.min(255, pixels[idx + 2] + Math.round(b * intensity));
            }
        }
    }
}

// Draw rounded rect
function fillRoundedRect(pixels, W, x1, y1, w, h, radius, r, g, b, a) {
    for (let y = y1; y < y1 + h; y++) {
        for (let x = x1; x < x1 + w; x++) {
            let inside = false;
            // Check corners
            const inXCenter = x >= x1 + radius && x < x1 + w - radius;
            const inYCenter = y >= y1 + radius && y < y1 + h - radius;
            if (inXCenter || inYCenter) {
                inside = true;
            } else {
                // Check corner circles
                let cornerX, cornerY;
                if (x < x1 + radius) cornerX = x1 + radius;
                else cornerX = x1 + w - radius;
                if (y < y1 + radius) cornerY = y1 + radius;
                else cornerY = y1 + h - radius;
                const dx = x - cornerX;
                const dy = y - cornerY;
                if (dx * dx + dy * dy <= radius * radius) inside = true;
            }
            if (inside) {
                const idx = (y * W + x) * 4;
                pixels[idx] = r;
                pixels[idx + 1] = g;
                pixels[idx + 2] = b;
                pixels[idx + 3] = a;
            }
        }
    }
}

// --- GENERATE ICON (1024x1024) ---

function generateIcon(size) {
    console.log(`  Drawing icon ${size}x${size}...`);
    const pixels = createPixelBuffer(size, size);

    // Background: #0A0A0A
    fillBackground(pixels, size, size, 10, 10, 10);

    // Blue accent: #0A84FF -> RGB(10, 132, 255)
    const blue = { r: 10, g: 132, b: 255 };

    // Center glow
    addGlow(pixels, size, size, size / 2, size / 2, size * 0.45, blue.r, blue.g, blue.b);

    // Draw "T" letter
    const margin = Math.round(size * 0.2);  // 20% margin
    const letterW = size - margin * 2;      // letter width
    const letterH = size - margin * 2;      // letter height
    const startX = margin;
    const startY = margin;

    // T horizontal bar (top)
    const barHeight = Math.round(letterH * 0.15);
    const barRadius = Math.round(barHeight * 0.3);
    fillRoundedRect(pixels, size, startX, startY, letterW, barHeight, barRadius, blue.r, blue.g, blue.b, 255);

    // T vertical stem (center)
    const stemWidth = Math.round(letterW * 0.22);
    const stemX = Math.round(startX + (letterW - stemWidth) / 2);
    const stemY = startY + barHeight;
    const stemHeight = letterH - barHeight;
    const stemRadius = Math.round(stemWidth * 0.2);
    fillRoundedRect(pixels, size, stemX, stemY, stemWidth, stemHeight, stemRadius, blue.r, blue.g, blue.b, 255);

    // Small accent dot (bottom right)
    const dotRadius = Math.round(size * 0.03);
    const dotX = Math.round(size * 0.75);
    const dotY = Math.round(size * 0.78);
    fillCircle(pixels, size, dotX, dotY, dotRadius, blue.r, blue.g, blue.b, 200);

    return createPNG(size, size, pixels);
}

// --- GENERATE SPLASH (1284x2778) ---

function generateSplash(w, h) {
    console.log(`  Drawing splash ${w}x${h}...`);
    const pixels = createPixelBuffer(w, h);

    // Background
    fillBackground(pixels, w, h, 10, 10, 10);

    const blue = { r: 10, g: 132, b: 255 };

    // Center glow (subtle)
    addGlow(pixels, w, h, w / 2, h * 0.4, Math.min(w, h) * 0.4, blue.r, blue.g, blue.b);

    // Draw smaller "T" in center
    const tSize = Math.round(w * 0.35);
    const tX = Math.round((w - tSize) / 2);
    const tY = Math.round(h * 0.35);

    // T horizontal bar
    const barH = Math.round(tSize * 0.15);
    const barR = Math.round(barH * 0.3);
    fillRoundedRect(pixels, w, tX, tY, tSize, barH, barR, blue.r, blue.g, blue.b, 255);

    // T vertical stem
    const stemW = Math.round(tSize * 0.22);
    const stemX = Math.round(tX + (tSize - stemW) / 2);
    const stemY = tY + barH;
    const stemH = tSize - barH;
    const stemR = Math.round(stemW * 0.2);
    fillRoundedRect(pixels, w, stemX, stemY, stemW, stemH, stemR, blue.r, blue.g, blue.b, 255);

    // "Trace" text as dots (pixel art style) below the T
    // Simple underline accent
    const lineY = tY + tSize + Math.round(h * 0.04);
    const lineW = Math.round(w * 0.2);
    const lineX = Math.round((w - lineW) / 2);
    const lineH = 4;
    fillRoundedRect(pixels, w, lineX, lineY, lineW, lineH, 2, blue.r, blue.g, blue.b, 150);

    return createPNG(w, h, pixels);
}

// --- MAIN ---

const assetsDir = path.join(__dirname, '..', 'assets');

console.log('🎨 Generating Trace app assets...\n');

// Icon (1024x1024)
console.log('📱 icon.png');
const icon = generateIcon(1024);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);
console.log('  ✅ Saved!\n');

// Adaptive Icon (1024x1024) — same as icon
console.log('🤖 adaptive-icon.png');
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), icon);
console.log('  ✅ Saved!\n');

// Splash (1284x2778)
console.log('🌊 splash.png');
const splash = generateSplash(1284, 2778);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash);
console.log('  ✅ Saved!\n');

console.log('🚀 All assets generated! Replace with real designs later.');
