import sharp from "sharp";
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "brand");
mkdirSync(OUT_DIR, { recursive: true });

const CHARCOAL = "#15110E";
const GOLD = "#C9A94E";
const CREAM = "#F2EAD9";

// Master SVG — italic Fraunces M on charcoal, with the editorial hair-rule
// underneath (mirrors src/components/editorial/hair-rule.tsx). Designed at
// 1024×1024, scales down legibly to 16×16.
const svg = ({ size } = {}) => {
  const s = size;
  const cx = s / 2;
  const cornerR = s * 0.18;

  // Visual centring of italic capital M — empirically the optical centre of
  // a serif italic M sits a hair below the geometric centre, so y = baseline
  // and we lift the baseline to put the cap-mid line at ~0.55*s.
  const monogramSize = s * 0.62;
  const monogramY = s * 0.5 + monogramSize * 0.32;

  // Single hair-rule below the monogram — the editorial signal.
  const ruleY = s * 0.78;
  const ruleHalfW = s * 0.18;
  const strokeW = Math.max(1, s * 0.0055);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${cornerR}" ry="${cornerR}" fill="${CHARCOAL}"/>
  <text x="${cx}" y="${monogramY}"
        font-family="Fraunces, 'EB Garamond', Georgia, 'Times New Roman', serif"
        font-style="italic"
        font-weight="500"
        font-size="${monogramSize}"
        fill="${GOLD}"
        text-anchor="middle">M</text>
  <line x1="${cx - ruleHalfW}" y1="${ruleY}" x2="${cx + ruleHalfW}" y2="${ruleY}"
        stroke="${GOLD}" stroke-width="${strokeW}" stroke-linecap="round" opacity="0.4"/>
</svg>`;
};

const renders = [
  { name: "logo-1024.png", size: 1024 },
  { name: "logo-512.png", size: 512 },
  { name: "logo-192.png", size: 192 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-32.png", size: 32 },
  { name: "icon-16.png", size: 16 },
];

for (const { name, size } of renders) {
  const out = join(OUT_DIR, name);
  await sharp(Buffer.from(svg({ size })))
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`wrote ${out}`);
}

writeFileSync(join(OUT_DIR, "logo.svg"), svg({ size: 1024 }));
console.log(`wrote ${join(OUT_DIR, "logo.svg")}`);

// OpenGraph / social share image — 1200×630.
const ogSvg = () => {
  const w = 1200;
  const h = 630;
  const markSize = 380;
  const markX = 120;
  const markY = (h - markSize) / 2;
  const cornerR = markSize * 0.18;

  const monogramSize = markSize * 0.62;
  const monogramCx = markX + markSize / 2;
  const monogramY = markY + markSize / 2 + monogramSize * 0.32;
  const ruleY = markY + markSize * 0.78;
  const ruleHalfW = markSize * 0.18;
  const strokeW = Math.max(1, markSize * 0.0055);

  const textX = markX + markSize + 80;
  const wordmarkY = h / 2 - 10;
  const taglineY = h / 2 + 60;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${CHARCOAL}"/>
  <rect x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" rx="${cornerR}" ry="${cornerR}" fill="${CHARCOAL}" stroke="${GOLD}" stroke-width="2" opacity="0.95"/>
  <text x="${monogramCx}" y="${monogramY}"
        font-family="Fraunces, 'EB Garamond', Georgia, 'Times New Roman', serif"
        font-style="italic"
        font-weight="500"
        font-size="${monogramSize}"
        fill="${GOLD}"
        text-anchor="middle">M</text>
  <line x1="${monogramCx - ruleHalfW}" y1="${ruleY}" x2="${monogramCx + ruleHalfW}" y2="${ruleY}"
        stroke="${GOLD}" stroke-width="${strokeW}" stroke-linecap="round" opacity="0.4"/>
  <text x="${textX}" y="${wordmarkY}"
        font-family="Fraunces, Georgia, 'Times New Roman', serif"
        font-weight="500"
        font-size="96"
        fill="${GOLD}"
        text-anchor="start">MysTech</text>
  <text x="${textX}" y="${taglineY}"
        font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
        font-weight="400"
        font-size="26"
        letter-spacing="3"
        fill="${CREAM}"
        text-anchor="start" opacity="0.85">PERSONAL ORACLES &amp; AI READINGS</text>
</svg>`;
};

const ogBuffer = await sharp(Buffer.from(ogSvg()))
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(join(OUT_DIR, "og-image.png"), ogBuffer);
console.log(`wrote ${join(OUT_DIR, "og-image.png")}`);

const APP_DIR = join(process.cwd(), "src", "app");
writeFileSync(join(APP_DIR, "opengraph-image.png"), ogBuffer);
console.log(`wrote ${join(APP_DIR, "opengraph-image.png")}`);

copyFileSync(join(OUT_DIR, "icon-32.png"), join(APP_DIR, "icon.png"));
console.log(`wrote ${join(APP_DIR, "icon.png")}`);
copyFileSync(join(OUT_DIR, "apple-touch-icon.png"), join(APP_DIR, "apple-icon.png"));
console.log(`wrote ${join(APP_DIR, "apple-icon.png")}`);
