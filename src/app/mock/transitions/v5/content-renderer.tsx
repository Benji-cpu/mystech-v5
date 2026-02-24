"use client";

import * as THREE from "three";
import {
  MOCK_DECKS,
  MOCK_ART_STYLES,
  MOCK_USER,
  MOCK_STATS,
  MOCK_ACTIVITY,
  MOCK_READING_INTERPRETATION,
  getAllCards,
  shuffleArray,
} from "../../full/_shared/mock-data-v1";
import {
  CONTENT_WIDTH_DESKTOP,
  CONTENT_HEIGHT_DESKTOP,
  CONTENT_WIDTH_MOBILE,
  CONTENT_HEIGHT_MOBILE,
  MIRROR_THEME,
} from "./theme";

// ─── Content Rendering Engine ─────────────────────────────────────────────────
// Renders various content types to an off-screen Canvas2D, then returns a CanvasTexture
// All sizes are calibrated for 1024×1536 (desktop) / 768×1152 (mobile) resolution

interface RenderOpts {
  isMobile: boolean;
}

export function renderContentToTexture(
  contentType: string,
  opts: RenderOpts
): THREE.CanvasTexture {
  const w = opts.isMobile ? CONTENT_WIDTH_MOBILE : CONTENT_WIDTH_DESKTOP;
  const h = opts.isMobile ? CONTENT_HEIGHT_MOBILE : CONTENT_HEIGHT_DESKTOP;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Dark background
  ctx.fillStyle = "#0a0118";
  ctx.fillRect(0, 0, w, h);

  const renderers: Record<string, () => void> = {
    "single-card": () => renderSingleCard(ctx, w, h),
    "three-spread": () => renderThreeSpread(ctx, w, h),
    "five-spread": () => renderFiveSpread(ctx, w, h),
    "deck-cover": () => renderDeckCover(ctx, w, h),
    "reading-text": () => renderReadingText(ctx, w, h),
    "user-profile": () => renderUserProfile(ctx, w, h),
    "art-style": () => renderArtStyle(ctx, w, h),
    "activity-feed": () => renderActivityFeed(ctx, w, h),
    "card-grid": () => renderCardGrid(ctx, w, h),
    "guidance-quote": () => renderGuidanceQuote(ctx, w, h),
    "deck-collection": () => renderDeckCollection(ctx, w, h),
    "spread-diagram": () => renderSpreadDiagram(ctx, w, h),
  };

  const renderer = renderers[contentType] || renderers["single-card"];
  renderer();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ─── Shared drawing helpers ───────────────────────────────────────────────────

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = "normal", family = "system-ui, sans-serif") {
  ctx.font = `${weight} ${size}px ${family}`;
}

function drawCenteredText(ctx: CanvasRenderingContext2D, text: string, y: number, color: string, size: number, weight = "bold") {
  setFont(ctx, size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(text, ctx.canvas.width / 2, y, ctx.canvas.width - 80);
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, color: string, size: number, weight = "normal"): number {
  setFont(ctx, size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function drawCardPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string, _imageUrl: string) {
  // Card background
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 16);
  ctx.stroke();

  // Inner gradient area (simulating image)
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "rgba(123, 104, 238, 0.15)");
  grad.addColorStop(0.5, "rgba(201, 169, 78, 0.1)");
  grad.addColorStop(1, "rgba(123, 104, 238, 0.15)");
  ctx.fillStyle = grad;
  roundRect(ctx, x + 8, y + 8, w - 16, h * 0.6, 12);
  ctx.fill();

  // Star symbol
  setFont(ctx, Math.min(w * 0.3, 48), "normal");
  ctx.fillStyle = MIRROR_THEME.gold;
  ctx.textAlign = "center";
  ctx.fillText("\u2726", x + w / 2, y + h * 0.35);

  // Title
  const fontSize = Math.min(w * 0.14, 26);
  setFont(ctx, fontSize, "bold");
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.textAlign = "center";
  ctx.fillText(title, x + w / 2, y + h * 0.78, w - 16);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawGoldDivider(ctx: CanvasRenderingContext2D, y: number, w: number) {
  const grad = ctx.createLinearGradient(w * 0.2, y, w * 0.8, y);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.5, MIRROR_THEME.gold);
  grad.addColorStop(1, "transparent");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, y);
  ctx.lineTo(w * 0.8, y);
  ctx.stroke();
}

// ─── Content Type Renderers ───────────────────────────────────────────────────

function renderSingleCard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const card = MOCK_DECKS[0].cards[0];
  const cardW = w * 0.55, cardH = h * 0.5;
  const cx = (w - cardW) / 2, cy = h * 0.08;

  drawCardPlaceholder(ctx, cx, cy, cardW, cardH, card.title, card.imageUrl);

  // Title below
  drawCenteredText(ctx, card.title, cy + cardH + 70, MIRROR_THEME.gold, 44, "bold");

  // Meaning
  drawCenteredText(ctx, card.meaning, cy + cardH + 120, "rgba(255,255,255,0.7)", 28);

  // Guidance
  drawGoldDivider(ctx, cy + cardH + 160, w);
  drawWrappedText(ctx, card.guidance, 60, cy + cardH + 200, w - 120, 40, "rgba(255,255,255,0.6)", 26, "italic");
}

function renderThreeSpread(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cards = shuffleArray(getAllCards()).slice(0, 3);
  const labels = ["Past", "Present", "Future"];
  const cardW = w * 0.27, cardH = h * 0.4;
  const gap = (w - cardW * 3) / 4;

  drawCenteredText(ctx, "Three-Card Spread", 70, MIRROR_THEME.gold, 36, "bold");
  drawGoldDivider(ctx, 100, w);

  cards.forEach((card, i) => {
    const x = gap + i * (cardW + gap);
    const y = h * 0.12;
    drawCardPlaceholder(ctx, x, y, cardW, cardH, card.title, card.imageUrl);

    // Position label
    setFont(ctx, 22, "bold");
    ctx.fillStyle = MIRROR_THEME.gold;
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + cardW / 2, y + cardH + 40);
  });

  // Spread message
  drawWrappedText(ctx, "The cards reveal a journey from past through present into future.", 50, h * 0.72, w - 100, 36, "rgba(255,255,255,0.5)", 24, "italic");
}

function renderFiveSpread(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cards = shuffleArray(getAllCards()).slice(0, 5);
  const labels = ["Past", "Present", "Future", "Above", "Below"];
  const cardW = w * 0.22, cardH = h * 0.28;

  drawCenteredText(ctx, "Five-Card Spread", 60, MIRROR_THEME.gold, 32, "bold");

  // Top row: 3 cards
  const gap3 = (w - cardW * 3) / 4;
  for (let i = 0; i < 3; i++) {
    const x = gap3 + i * (cardW + gap3);
    drawCardPlaceholder(ctx, x, h * 0.08, cardW, cardH, cards[i].title, cards[i].imageUrl);
    setFont(ctx, 20, "bold");
    ctx.fillStyle = MIRROR_THEME.gold;
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + cardW / 2, h * 0.08 + cardH + 30);
  }

  // Bottom row: 2 cards
  const gap2 = (w - cardW * 2) / 3;
  for (let i = 0; i < 2; i++) {
    const x = gap2 + i * (cardW + gap2);
    const y = h * 0.55;
    drawCardPlaceholder(ctx, x, y, cardW, cardH, cards[i + 3].title, cards[i + 3].imageUrl);
    setFont(ctx, 20, "bold");
    ctx.fillStyle = MIRROR_THEME.gold;
    ctx.textAlign = "center";
    ctx.fillText(labels[i + 3], x + cardW / 2, y + cardH + 30);
  }
}

function renderDeckCover(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const deck = MOCK_DECKS[0];

  // Cover placeholder area
  const coverW = w * 0.6, coverH = h * 0.45;
  const cx = (w - coverW) / 2;

  const grad = ctx.createLinearGradient(cx, 100, cx + coverW, 100 + coverH);
  grad.addColorStop(0, "rgba(123, 104, 238, 0.2)");
  grad.addColorStop(1, "rgba(201, 169, 78, 0.15)");
  ctx.fillStyle = grad;
  roundRect(ctx, cx, 100, coverW, coverH, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  roundRect(ctx, cx, 100, coverW, coverH, 24);
  ctx.stroke();

  // Deck icon
  setFont(ctx, 96, "normal");
  ctx.fillStyle = MIRROR_THEME.gold;
  ctx.textAlign = "center";
  ctx.fillText("\u2726", w / 2, 100 + coverH * 0.45);

  // Deck info
  const infoY = 100 + coverH + 60;
  drawCenteredText(ctx, deck.name, infoY, MIRROR_THEME.gold, 44, "bold");
  drawWrappedText(ctx, deck.description, 60, infoY + 50, w - 120, 36, "rgba(255,255,255,0.6)", 26);

  // Stats
  const statsY = infoY + 160;
  drawGoldDivider(ctx, statsY, w);
  drawCenteredText(ctx, `${deck.cardCount} Cards  \u00B7  ${deck.artStyleId}  \u00B7  ${deck.createdAt}`, statsY + 40, "rgba(255,255,255,0.4)", 24);
}

function renderReadingText(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawCenteredText(ctx, "Reading Interpretation", 70, MIRROR_THEME.gold, 36, "bold");
  drawGoldDivider(ctx, 100, w);

  const paragraphs = MOCK_READING_INTERPRETATION.split("\n\n");
  let y = 150;

  // Only render first 3 paragraphs to reduce density
  const maxParas = Math.min(paragraphs.length, 3);
  for (let i = 0; i < maxParas; i++) {
    const para = paragraphs[i];
    const clean = para.replace(/\*\*/g, "");
    const isBold = para.startsWith("**");
    y = drawWrappedText(ctx, clean, 50, y, w - 100, 36, isBold ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)", isBold ? 26 : 24, isBold ? "bold" : "normal");
    y += 16;
  }
}

function renderUserProfile(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Avatar circle
  const avatarR = 70;
  const avatarCx = w / 2, avatarCy = 140;
  ctx.beginPath();
  ctx.arc(avatarCx, avatarCy, avatarR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(123, 104, 238, 0.3)";
  ctx.fill();
  ctx.strokeStyle = MIRROR_THEME.gold;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Initials
  setFont(ctx, 48, "bold");
  ctx.fillStyle = MIRROR_THEME.gold;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("LS", avatarCx, avatarCy);
  ctx.textBaseline = "alphabetic";

  // Name & email
  drawCenteredText(ctx, MOCK_USER.name, avatarCy + avatarR + 50, "#ffffff", 40, "bold");
  drawCenteredText(ctx, MOCK_USER.email, avatarCy + avatarR + 90, "rgba(255,255,255,0.5)", 24);
  drawCenteredText(ctx, `${MOCK_USER.plan.toUpperCase()} Plan`, avatarCy + avatarR + 130, MIRROR_THEME.gold, 26, "bold");

  // Stats
  const statsY = avatarCy + avatarR + 190;
  drawGoldDivider(ctx, statsY, w);

  const stats = [
    { label: "Decks", value: MOCK_STATS.totalDecks },
    { label: "Cards", value: MOCK_STATS.totalCards },
    { label: "Readings", value: MOCK_STATS.totalReadings },
  ];

  const statW = w / stats.length;
  stats.forEach((stat, i) => {
    const x = statW * i + statW / 2;
    setFont(ctx, 56, "bold");
    ctx.fillStyle = MIRROR_THEME.gold;
    ctx.textAlign = "center";
    ctx.fillText(stat.value.toString(), x, statsY + 80);
    setFont(ctx, 22, "normal");
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(stat.label, x, statsY + 114);
  });

  // Credits bar
  const barY = statsY + 160;
  const barW = w * 0.6, barH = 16;
  const barX = (w - barW) / 2;
  roundRect(ctx, barX, barY, barW, barH, 8);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  const fillW = barW * (MOCK_STATS.creditsUsed / MOCK_STATS.creditsTotal);
  roundRect(ctx, barX, barY, fillW, barH, 8);
  ctx.fillStyle = MIRROR_THEME.gold;
  ctx.fill();
  drawCenteredText(ctx, `${MOCK_STATS.creditsUsed}/${MOCK_STATS.creditsTotal} Credits`, barY + 50, "rgba(255,255,255,0.4)", 22);
}

function renderArtStyle(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const style = MOCK_ART_STYLES[0];

  // Gradient background area
  const gradH = h * 0.3;
  const grad = ctx.createLinearGradient(0, 0, w, gradH);
  grad.addColorStop(0, "rgba(123, 104, 238, 0.3)");
  grad.addColorStop(0.5, "rgba(201, 169, 78, 0.2)");
  grad.addColorStop(1, "rgba(123, 104, 238, 0.3)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, gradH);

  // Style name
  drawCenteredText(ctx, style.name, gradH * 0.5, "#ffffff", 48, "bold");
  drawCenteredText(ctx, style.description, gradH * 0.7, "rgba(255,255,255,0.6)", 24);

  // Sample thumbnails (2x2 grid)
  const thumbW = w * 0.35, thumbH = h * 0.22;
  const gapX = (w - thumbW * 2) / 3;
  const gapY = 30;
  const startY = gradH + 40;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const x = gapX + col * (thumbW + gapX);
      const y = startY + row * (thumbH + gapY);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      roundRect(ctx, x, y, thumbW, thumbH, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, thumbW, thumbH, 16);
      ctx.stroke();

      // Small star icon
      setFont(ctx, 40, "normal");
      ctx.fillStyle = "rgba(201, 169, 78, 0.4)";
      ctx.textAlign = "center";
      ctx.fillText("\u2726", x + thumbW / 2, y + thumbH / 2 + 14);
    }
  }
}

function renderActivityFeed(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawCenteredText(ctx, "Recent Activity", 70, MIRROR_THEME.gold, 36, "bold");
  drawGoldDivider(ctx, 100, w);

  const iconMap: Record<string, string> = {
    sparkles: "\u2728",
    layers: "\u25A6",
    plus: "+",
    palette: "\u25C9",
  };

  // Only show 3 items for reduced density
  let y = 150;
  const maxItems = Math.min(MOCK_ACTIVITY.length, 3);
  for (let i = 0; i < maxItems; i++) {
    const activity = MOCK_ACTIVITY[i];
    // Icon circle
    ctx.beginPath();
    ctx.arc(70, y + 8, 28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(123, 104, 238, 0.2)";
    ctx.fill();

    setFont(ctx, 28, "normal");
    ctx.fillStyle = MIRROR_THEME.gold;
    ctx.textAlign = "center";
    ctx.fillText(iconMap[activity.icon] || "\u2726", 70, y + 18);

    // Title & subtitle
    setFont(ctx, 28, "bold");
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.textAlign = "left";
    ctx.fillText(activity.title, 120, y + 4, w - 160);
    setFont(ctx, 22, "normal");
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(activity.subtitle, 120, y + 36, w - 160);

    // Timestamp
    setFont(ctx, 20, "normal");
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "right";
    ctx.fillText(activity.timestamp, w - 40, y + 4);

    y += 110;

    // Divider
    if (i < maxItems - 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(120, y - 30);
      ctx.lineTo(w - 40, y - 30);
      ctx.stroke();
    }
  }
}

function renderCardGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cards = MOCK_DECKS[0].cards;
  drawCenteredText(ctx, MOCK_DECKS[0].name, 60, MIRROR_THEME.gold, 32, "bold");

  // Reduced grid: 2×3 instead of 3×4
  const cols = 2, rows = Math.min(3, Math.ceil(cards.length / cols));
  const cardW = (w - 80 - (cols - 1) * 16) / cols;
  const cardH = cardW * 1.4;
  const startY = 100;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= cards.length) break;
      const x = 40 + c * (cardW + 16);
      const y = startY + r * (cardH + 16);
      drawCardPlaceholder(ctx, x, y, cardW, cardH, cards[idx].title, cards[idx].imageUrl);
    }
  }
}

function renderGuidanceQuote(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const card = MOCK_DECKS[2].cards[0]; // Star Map

  // Decorative border
  ctx.strokeStyle = `rgba(${MIRROR_THEME.goldRgb}, 0.3)`;
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 60, w - 120, h - 120, 32);
  ctx.stroke();

  // Inner border
  ctx.strokeStyle = `rgba(${MIRROR_THEME.goldRgb}, 0.15)`;
  roundRect(ctx, 80, 80, w - 160, h - 160, 24);
  ctx.stroke();

  // Corner ornaments
  const ornament = "\u2726";
  setFont(ctx, 32, "normal");
  ctx.fillStyle = MIRROR_THEME.gold;
  ctx.textAlign = "center";
  ctx.fillText(ornament, 90, 100);
  ctx.fillText(ornament, w - 90, 100);
  ctx.fillText(ornament, 90, h - 76);
  ctx.fillText(ornament, w - 90, h - 76);

  // Quote text
  const quoteY = h * 0.25;
  setFont(ctx, 28, "italic");
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.textAlign = "center";

  const lines = wrapTextToLines(ctx, `"${card.guidance}"`, w - 240);
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, quoteY + i * 44);
  });

  // Attribution
  const attrY = quoteY + lines.length * 44 + 60;
  drawGoldDivider(ctx, attrY, w);
  drawCenteredText(ctx, `\u2014 ${card.title}`, attrY + 44, MIRROR_THEME.gold, 28, "italic");
  drawCenteredText(ctx, card.meaning, attrY + 84, "rgba(255,255,255,0.4)", 22);
}

function renderDeckCollection(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawCenteredText(ctx, "Your Decks", 70, MIRROR_THEME.gold, 36, "bold");
  drawGoldDivider(ctx, 100, w);

  const cols = 2;
  const deckW = (w - 100) / cols;
  const deckH = deckW * 1.3;
  const gap = 20;
  const startY = 130;

  MOCK_DECKS.forEach((deck, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 40 + col * (deckW + gap);
    const y = startY + row * (deckH + gap + 40);

    // Deck card
    const grad = ctx.createLinearGradient(x, y, x + deckW, y + deckH);
    grad.addColorStop(0, "rgba(123, 104, 238, 0.15)");
    grad.addColorStop(1, "rgba(201, 169, 78, 0.1)");
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, deckW, deckH, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, deckW, deckH, 20);
    ctx.stroke();

    // Star
    setFont(ctx, 56, "normal");
    ctx.fillStyle = `rgba(${MIRROR_THEME.goldRgb}, 0.5)`;
    ctx.textAlign = "center";
    ctx.fillText("\u2726", x + deckW / 2, y + deckH * 0.4);

    // Name
    setFont(ctx, 24, "bold");
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(deck.name, x + deckW / 2, y + deckH * 0.7, deckW - 20);

    // Count
    setFont(ctx, 20, "normal");
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(`${deck.cardCount} cards`, x + deckW / 2, y + deckH * 0.85);
  });
}

function renderSpreadDiagram(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawCenteredText(ctx, "Spread Layouts", 70, MIRROR_THEME.gold, 36, "bold");
  drawGoldDivider(ctx, 100, w);

  const cardW = 60, cardH = 90;

  // Single card
  const s1Y = 160;
  drawCenteredText(ctx, "Single Card", s1Y, "rgba(255,255,255,0.6)", 24);
  drawSpreadCard(ctx, w / 2 - cardW / 2, s1Y + 20, cardW, cardH);

  // Three-card
  const s3Y = s1Y + cardH + 80;
  drawCenteredText(ctx, "Three-Card Spread", s3Y, "rgba(255,255,255,0.6)", 24);
  for (let i = 0; i < 3; i++) {
    drawSpreadCard(ctx, w / 2 - cardW * 1.5 - 10 + i * (cardW + 20), s3Y + 20, cardW, cardH);
  }

  // Five-card
  const s5Y = s3Y + cardH + 80;
  drawCenteredText(ctx, "Five-Card Spread", s5Y, "rgba(255,255,255,0.6)", 24);
  // Cross pattern
  drawSpreadCard(ctx, w / 2 - cardW / 2, s5Y + 20, cardW, cardH); // center
  drawSpreadCard(ctx, w / 2 - cardW * 1.5 - 10, s5Y + 20, cardW, cardH); // left
  drawSpreadCard(ctx, w / 2 + cardW / 2 + 10, s5Y + 20, cardW, cardH); // right
  drawSpreadCard(ctx, w / 2 - cardW / 2, s5Y + 20 - cardH * 0.6, cardW, cardH); // top
  drawSpreadCard(ctx, w / 2 - cardW / 2, s5Y + 20 + cardH * 0.6, cardW, cardH); // bottom

  // Celtic cross hint
  const ccY = s5Y + cardH * 2 + 60;
  drawCenteredText(ctx, "Celtic Cross (10 cards)", ccY, "rgba(255,255,255,0.4)", 22);
  setFont(ctx, 20, "normal");
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.textAlign = "center";
  ctx.fillText("Pro feature \u2014 upgrade to unlock", w / 2, ccY + 36);
}

function drawSpreadCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "rgba(201, 169, 78, 0.15)";
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = `rgba(${MIRROR_THEME.goldRgb}, 0.4)`;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
}

// Helper: wrap text into lines
function wrapTextToLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current + word + " ";
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current.trim());
      current = word + " ";
    } else {
      current = test;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}
