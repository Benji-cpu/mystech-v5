"use client";

import { useRef, useEffect, useCallback } from "react";
import type { ContentStateIndex } from "./morph-explorer-state";
import { morphTheme } from "./morph-theme";

const t = morphTheme;

/**
 * Draws a simplified visual representation of each content state to a canvas.
 * Used by GL-based morphers that need texture inputs.
 */
export function drawContentState(
  ctx: CanvasRenderingContext2D,
  state: ContentStateIndex,
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);

  switch (state) {
    case 0:
      drawOracleCard(ctx, w, h);
      break;
    case 1:
      drawStarChart(ctx, w, h);
      break;
    case 2:
      drawRuneReading(ctx, w, h);
      break;
    case 3:
      drawCrystalVision(ctx, w, h);
      break;
    case 4:
      drawPotionRecipe(ctx, w, h);
      break;
    case 5:
      drawTarotSpread(ctx, w, h);
      break;
    case 6:
      drawMoonPhase(ctx, w, h);
      break;
    case 7:
      drawSigilGrid(ctx, w, h);
      break;
  }
}

function drawOracleCard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark gradient bg
  const grad = ctx.createLinearGradient(0, 0, w * 0.6, h);
  grad.addColorStop(0, "#1a0a30");
  grad.addColorStop(0.55, "#0d1b3e");
  grad.addColorStop(1, "#110826");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Gold glow
  const glow = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, w * 0.3);
  glow.addColorStop(0, "rgba(212,168,67,0.3)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // 8-pointed star
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const cx = w / 2, cy = h * 0.35, r = w * 0.15;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const inner = r * 0.35;
    const outerR = r;
    const ax = cx + Math.cos(angle) * outerR;
    const ay = cy + Math.sin(angle) * outerR;
    const nextAngle = angle + Math.PI / 8;
    const bx = cx + Math.cos(nextAngle) * inner;
    const by = cy + Math.sin(nextAngle) * inner;
    if (i === 0) ctx.moveTo(ax, ay);
    else ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
  }
  ctx.closePath();
  ctx.stroke();

  // Center dot
  ctx.fillStyle = t.accent;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Title
  ctx.fillStyle = t.text;
  ctx.font = `bold ${w * 0.05}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("The Guiding Star", w / 2, h * 0.78);

  ctx.fillStyle = "rgba(232,230,240,0.5)";
  ctx.font = `${w * 0.035}px sans-serif`;
  ctx.fillText("Illumination & Purpose", w / 2, h * 0.85);
}

function drawStarChart(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#04040f";
  ctx.fillRect(0, 0, w, h);

  // Astrolabe ring
  ctx.strokeStyle = "rgba(212,168,67,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Star dots
  const dots = [
    [0.18, 0.22], [0.26, 0.18], [0.34, 0.24], [0.29, 0.32], [0.22, 0.35],
    [0.58, 0.20], [0.68, 0.28], [0.74, 0.40], [0.65, 0.50], [0.56, 0.44],
    [0.20, 0.62], [0.30, 0.56], [0.40, 0.65], [0.28, 0.72], [0.16, 0.70],
  ];

  const lines: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
    [5, 6], [6, 7], [7, 8], [8, 9], [9, 5],
    [10, 11], [11, 12], [12, 13], [13, 14], [14, 10],
  ];

  ctx.strokeStyle = "rgba(212,168,67,0.3)";
  ctx.lineWidth = 1;
  for (const [a, b] of lines) {
    ctx.beginPath();
    ctx.moveTo(dots[a][0] * w, dots[a][1] * h);
    ctx.lineTo(dots[b][0] * w, dots[b][1] * h);
    ctx.stroke();
  }

  ctx.fillStyle = t.accent;
  for (const [x, y] of dots) {
    ctx.beginPath();
    ctx.arc(x * w, y * h, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Labels
  ctx.fillStyle = "rgba(212,168,67,0.7)";
  ctx.font = `${w * 0.03}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("ORION'S GATE", w * 0.14, h * 0.15);
  ctx.fillStyle = "rgba(196,206,255,0.6)";
  ctx.fillText("THE WEAVER", w * 0.6, h * 0.14);
}

function drawRuneReading(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#0d0820";
  ctx.fillRect(0, 0, w, h);

  // Title
  ctx.fillStyle = "rgba(232,230,240,0.5)";
  ctx.font = `${w * 0.035}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("TODAY'S CAST", w / 2, h * 0.22);

  // Three rune circles
  const runeNames = ["Raido", "Thurisaz", "Fehu"];
  const meanings = ["Journey", "Gateway", "Wealth"];
  const spacing = w / 4;

  for (let i = 0; i < 3; i++) {
    const cx = spacing + i * spacing;
    const cy = h * 0.48;

    // Circle
    ctx.strokeStyle = "rgba(212,168,67,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.09, 0, Math.PI * 2);
    ctx.stroke();

    // Rune symbol (simplified lines)
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (i === 0) { // Raido
      ctx.moveTo(cx - 6, cy + 12); ctx.lineTo(cx - 6, cy - 12);
      ctx.moveTo(cx - 6, cy - 12); ctx.lineTo(cx + 6, cy - 4);
      ctx.moveTo(cx + 6, cy - 4); ctx.lineTo(cx - 6, cy + 2);
    } else if (i === 1) { // Thurisaz
      ctx.moveTo(cx - 4, cy - 12); ctx.lineTo(cx - 4, cy + 12);
      ctx.moveTo(cx - 4, cy - 6); ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx + 8, cy); ctx.lineTo(cx - 4, cy + 6);
    } else { // Fehu
      ctx.moveTo(cx - 4, cy + 12); ctx.lineTo(cx - 4, cy - 12);
      ctx.moveTo(cx - 4, cy - 12); ctx.lineTo(cx + 8, cy - 6);
      ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx + 6, cy - 7);
    }
    ctx.stroke();

    // Name
    ctx.fillStyle = t.text;
    ctx.font = `bold ${w * 0.03}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(runeNames[i], cx, cy + w * 0.14);

    ctx.fillStyle = "rgba(232,230,240,0.5)";
    ctx.font = `${w * 0.025}px sans-serif`;
    ctx.fillText(meanings[i], cx, cy + w * 0.18);
  }
}

function drawCrystalVision(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#080a1c";
  ctx.fillRect(0, 0, w, h);

  // Orb
  const cx = w / 2, cy = h * 0.38;
  const grad = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, w * 0.1);
  grad.addColorStop(0, "rgba(255,225,140,0.9)");
  grad.addColorStop(0.3, t.accent);
  grad.addColorStop(0.7, "rgba(90,40,160,0.8)");
  grad.addColorStop(1, "rgba(30,10,60,0.95)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Outer glow
  const outerGlow = ctx.createRadialGradient(cx, cy, w * 0.05, cx, cy, w * 0.2);
  outerGlow.addColorStop(0, "rgba(212,168,67,0.2)");
  outerGlow.addColorStop(1, "transparent");
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Text lines
  const lines = ["The path divides ahead...", "Two doors, one key...", "Trust the silence between..."];
  const opacities = [1, 0.68, 0.38];
  ctx.textAlign = "center";
  for (let i = 0; i < lines.length; i++) {
    ctx.fillStyle = `rgba(232,230,240,${opacities[i]})`;
    ctx.font = `italic ${w * 0.038}px sans-serif`;
    ctx.fillText(lines[i], w / 2, h * 0.62 + i * h * 0.06);
  }
}

function drawPotionRecipe(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#091218";
  ctx.fillRect(0, 0, w, h);

  // Flask icon (simplified)
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.08); ctx.lineTo(w * 0.15, h * 0.2);
  ctx.lineTo(w * 0.06, h * 0.35); ctx.lineTo(w * 0.24, h * 0.35);
  ctx.lineTo(w * 0.15, h * 0.2);
  ctx.stroke();

  // Title
  ctx.fillStyle = t.accent;
  ctx.font = `bold ${w * 0.05}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("Elixir of Clarity", w * 0.3, h * 0.14);

  ctx.fillStyle = "rgba(232,230,240,0.5)";
  ctx.font = `${w * 0.03}px sans-serif`;
  ctx.fillText("BREWING FORMULA", w * 0.3, h * 0.2);

  // Divider
  const divGrad = ctx.createLinearGradient(w * 0.05, 0, w * 0.6, 0);
  divGrad.addColorStop(0, "rgba(212,168,67,0.6)");
  divGrad.addColorStop(1, "transparent");
  ctx.fillStyle = divGrad;
  ctx.fillRect(w * 0.05, h * 0.26, w * 0.6, 1);

  // Ingredients
  const items = ["Moonpetal essence - 3 drops", "Crushed starlight - 1 pinch", "Dreamweaver silk - 2 threads", "Phoenix tear - 1 drop"];
  ctx.fillStyle = t.text;
  ctx.font = `${w * 0.038}px sans-serif`;
  for (let i = 0; i < items.length; i++) {
    const y = h * 0.36 + i * h * 0.1;
    // Bullet
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.arc(w * 0.08, y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = t.text;
    ctx.fillText(items[i], w * 0.13, y);
  }

  // Progress bar
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fillRect(w * 0.05, h * 0.85, w * 0.9, h * 0.025);
  const barGrad = ctx.createLinearGradient(w * 0.05, 0, w * 0.63, 0);
  barGrad.addColorStop(0, "rgba(20,200,180,0.9)");
  barGrad.addColorStop(0.4, "rgba(100,180,100,0.9)");
  barGrad.addColorStop(1, t.accent);
  ctx.fillStyle = barGrad;
  ctx.fillRect(w * 0.05, h * 0.85, w * 0.585, h * 0.025);
}

function drawTarotSpread(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#0e0820";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(232,230,240,0.5)";
  ctx.font = `${w * 0.03}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("THREE-CARD SPREAD", w / 2, h * 0.15);

  // Three cards
  const labels = ["Past", "Present", "Future"];
  const cardW = w * 0.2;
  const cardH = h * 0.4;
  const gap = w * 0.06;
  const startX = (w - (3 * cardW + 2 * gap)) / 2;

  for (let i = 0; i < 3; i++) {
    const x = startX + i * (cardW + gap);
    const y = i === 1 ? h * 0.28 : h * 0.32;
    const isCenter = i === 1;

    ctx.strokeStyle = isCenter ? t.accent : "#2a2b5a";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, cardW, cardH);

    if (isCenter) {
      ctx.fillStyle = "rgba(212,168,67,0.07)";
      ctx.fillRect(x, y, cardW, cardH);
    }

    // Symbol (simplified)
    ctx.strokeStyle = isCenter ? t.accent : "rgba(196,206,255,0.7)";
    ctx.lineWidth = 1.5;
    const sx = x + cardW / 2;
    const sy = y + cardH / 2;
    if (i === 0) { // Moon crescent
      ctx.beginPath();
      ctx.arc(sx + 4, sy, 10, 0.5, 5.8);
      ctx.stroke();
    } else if (i === 1) { // Eye
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy); ctx.quadraticCurveTo(sx, sy - 10, sx + 12, sy);
      ctx.quadraticCurveTo(sx, sy + 10, sx - 12, sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.stroke();
    } else { // Sun
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.stroke();
      for (let r = 0; r < 8; r++) {
        const a = (r / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * 11, sy + Math.sin(a) * 11);
        ctx.lineTo(sx + Math.cos(a) * 15, sy + Math.sin(a) * 15);
        ctx.stroke();
      }
    }

    // Label
    ctx.fillStyle = isCenter ? t.accent : "rgba(232,230,240,0.5)";
    ctx.font = `${w * 0.03}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + cardW / 2, y + cardH + h * 0.06);
  }
}

function drawMoonPhase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#060912";
  ctx.fillRect(0, 0, w, h);

  // Background glow
  const glow = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.3);
  glow.addColorStop(0, "rgba(160,170,230,0.1)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Night label
  ctx.fillStyle = "rgba(232,230,240,0.5)";
  ctx.font = `${w * 0.03}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("NIGHT 11 OF 29", w / 2, h * 0.2);

  // Moon
  const cx = w / 2, cy = h * 0.45, r = w * 0.15;

  // Full circle base
  ctx.fillStyle = "rgba(220,225,255,0.15)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Waxing gibbous (lit portion)
  ctx.fillStyle = "rgba(210,200,160,0.85)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2);
  ctx.bezierCurveTo(cx - r * 0.6, cy + r * 0.5, cx - r * 0.6, cy - r * 0.5, cx, cy - r);
  ctx.fill();

  // Phase label
  ctx.fillStyle = t.text;
  ctx.font = `${w * 0.045}px sans-serif`;
  ctx.fillText("Waxing Gibbous", w / 2, h * 0.72);

  // Lunar cycle dots
  const phases = [0, 0.2, 0.5, 1, 0.5, 0.2, 0];
  const dotSpacing = w * 0.04;
  const startDot = w / 2 - (phases.length / 2) * dotSpacing;
  for (let i = 0; i < phases.length; i++) {
    const dx = startDot + i * dotSpacing;
    const dy = h * 0.82;
    ctx.strokeStyle = i === 3 ? t.accent : "rgba(160,170,230,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(dx, dy, 4, 0, Math.PI * 2);
    ctx.stroke();
    if (phases[i] > 0.5) {
      ctx.fillStyle = "rgba(212,168,67,0.7)";
      ctx.beginPath();
      ctx.arc(dx, dy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSigilGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#090a1c";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(232,230,240,0.5)";
  ctx.font = `${w * 0.03}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("ELEMENTAL SIGILS", w / 2, h * 0.08);

  const cells = [
    { name: "Fire", color: "rgba(220,100,50,0.85)", tint: "rgba(180,60,20,0.07)" },
    { name: "Water", color: "rgba(80,140,220,0.85)", tint: "rgba(20,80,180,0.07)" },
    { name: "Air", color: "rgba(200,210,230,0.75)", tint: "rgba(200,200,220,0.05)" },
    { name: "Earth", color: "rgba(80,160,90,0.8)", tint: "rgba(30,120,30,0.06)" },
  ];

  const pad = w * 0.06;
  const cellW = (w - pad * 3) / 2;
  const cellH = (h * 0.82 - pad * 3) / 2;
  const topY = h * 0.13;

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = pad + col * (cellW + pad);
    const y = topY + row * (cellH + pad);

    ctx.fillStyle = cells[i].tint;
    ctx.fillRect(x, y, cellW, cellH);
    ctx.strokeStyle = "#2a2b5a";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cellW, cellH);

    // Simple symbol
    ctx.strokeStyle = cells[i].color;
    ctx.lineWidth = 2;
    const cx = x + cellW / 2;
    const cy = y + cellH * 0.4;
    ctx.beginPath();
    if (i === 0) { // Fire - triangle
      ctx.moveTo(cx, cy - 12); ctx.lineTo(cx + 12, cy + 10); ctx.lineTo(cx - 12, cy + 10); ctx.closePath();
    } else if (i === 1) { // Water - waves
      ctx.moveTo(cx - 14, cy - 4); ctx.quadraticCurveTo(cx - 7, cy - 10, cx, cy - 4);
      ctx.quadraticCurveTo(cx + 7, cy + 2, cx + 14, cy - 4);
      ctx.moveTo(cx - 14, cy + 6); ctx.quadraticCurveTo(cx - 7, cy, cx, cy + 6);
      ctx.quadraticCurveTo(cx + 7, cy + 12, cx + 14, cy + 6);
    } else if (i === 2) { // Air - curved lines
      ctx.moveTo(cx - 14, cy); ctx.quadraticCurveTo(cx, cy - 10, cx + 14, cy);
      ctx.moveTo(cx - 14, cy + 6); ctx.quadraticCurveTo(cx, cy - 4, cx + 14, cy + 6);
    } else { // Earth - triangle down with line
      ctx.moveTo(cx - 12, cy - 10); ctx.lineTo(cx + 12, cy - 10); ctx.lineTo(cx, cy + 12); ctx.closePath();
    }
    ctx.stroke();

    // Name
    ctx.fillStyle = cells[i].color;
    ctx.font = `bold ${w * 0.03}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(cells[i].name.toUpperCase(), cx, y + cellH * 0.78);
  }
}

/**
 * Hook that provides canvas textures for content states.
 * Returns a function to draw any content state to a given canvas.
 */
export function useContentTexture(width = 512, height = 768) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    canvasRef.current.width = width;
    canvasRef.current.height = height;
  }, [width, height]);

  const render = useCallback(
    (state: ContentStateIndex): HTMLCanvasElement | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      drawContentState(ctx, state, width, height);
      return canvas;
    },
    [width, height]
  );

  return render;
}
