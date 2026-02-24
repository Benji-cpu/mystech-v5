"use client";

import { useEffect, useRef, useCallback } from "react";
import type { StageContentProps } from "./index";

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleOffset: number;
  isConstellation: boolean;
  constellationIndex: number;
}

/**
 * Stage: Star Map
 * State A (dormant): Scattered dim stars, random positions, gentle twinkling.
 *   No visible pattern. Faint "Ask the Oracle" prompt at center.
 * State B (revealed): Constellation stars brighten gold, lines connect them
 *   tracing a card outline. Card fills with dark bg + oracle image + title.
 *
 * Technique: Canvas 2D with rAF loop. Progress lerps 0→1 when morphed changes.
 */
export function StarMap({ morphed, className }: StageContentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const progressRef = useRef(0);
  const morphedRef = useRef(morphed);
  const animRef = useRef(0);
  const oracleImgRef = useRef<HTMLImageElement | null>(null);

  morphedRef.current = morphed;

  useEffect(() => {
    const img = new Image();
    img.src = "/mock/cards/the-oracle.png";
    img.onload = () => {
      oracleImgRef.current = img;
    };
  }, []);

  const initStars = useCallback((w: number, h: number) => {
    const stars: Star[] = [];
    const cx = w / 2;
    const cy = h / 2;
    const cardW = w * 0.55;
    const cardH = h * 0.7;
    const cardL = cx - cardW / 2;
    const cardT = cy - cardH / 2;
    const cardR = cardL + cardW;
    const cardB = cardT + cardH;

    // Constellation stars tracing the card border — 20 points around the perimeter
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const perimeter = 2 * (cardW + cardH);
      const d = t * perimeter;
      let px: number, py: number;
      if (d < cardW) {
        px = cardL + d;
        py = cardT;
      } else if (d < cardW + cardH) {
        px = cardR;
        py = cardT + (d - cardW);
      } else if (d < 2 * cardW + cardH) {
        px = cardR - (d - cardW - cardH);
        py = cardB;
      } else {
        px = cardL;
        py = cardB - (d - 2 * cardW - cardH);
      }
      // Slight organic jitter
      px += (Math.random() - 0.5) * 10;
      py += (Math.random() - 0.5) * 10;
      stars.push({
        x: px,
        y: py,
        size: 1.5 + Math.random() * 1.5,
        baseAlpha: 0.25 + Math.random() * 0.25,
        twinkleOffset: Math.random() * Math.PI * 2,
        isConstellation: true,
        constellationIndex: i,
      });
    }

    // Scattered background stars
    for (let i = 0; i < 55; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.6 + Math.random() * 2,
        baseAlpha: 0.12 + Math.random() * 0.35,
        twinkleOffset: Math.random() * Math.PI * 2,
        isConstellation: false,
        constellationIndex: -1,
      });
    }

    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    initStars(rect.width, rect.height);

    const tick = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Smooth lerp toward target — faster when morphed, slightly slower reverting
      const target = morphedRef.current ? 1 : 0;
      const speed = morphedRef.current ? 0.035 : 0.045;
      progressRef.current += (target - progressRef.current) * speed;
      const p = progressRef.current;

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const cardW = rect.width * 0.55;
      const cardH = rect.height * 0.7;

      const constellationStars = starsRef.current
        .filter((s) => s.isConstellation)
        .sort((a, b) => a.constellationIndex - b.constellationIndex);

      // ── Draw all stars ──────────────────────────────────────────────────────
      for (const star of starsRef.current) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * 1.8 + star.twinkleOffset);

        if (star.isConstellation) {
          // Lerp color from white-blue to gold
          const alpha = star.baseAlpha * (1 - p) + p * (0.7 + 0.3 * twinkle);
          const r = Math.round(200 * (1 - p) + 201 * p);
          const g = Math.round(215 * (1 - p) + 169 * p);
          const b = Math.round(255 * (1 - p) + 78 * p);

          // Glow halo as morph progresses
          if (p > 0.25) {
            const glowRadius = star.size * (2.5 + p * 2);
            const grd = ctx.createRadialGradient(
              star.x, star.y, 0,
              star.x, star.y, glowRadius
            );
            grd.addColorStop(0, `rgba(201,169,78,${p * 0.25})`);
            grd.addColorStop(1, "rgba(201,169,78,0)");
            ctx.beginPath();
            ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * (1 + p * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        } else {
          // Background stars dim slightly as morph progresses
          const alpha = star.baseAlpha * twinkle * (1 - p * 0.4);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190,210,255,${alpha})`;
          ctx.fill();
        }
      }

      // ── Constellation connecting lines ─────────────────────────────────────
      if (p > 0.2) {
        const lineAlpha = Math.min((p - 0.2) / 0.35, 1) * 0.35;
        ctx.beginPath();
        constellationStars.forEach((s, i) => {
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.closePath();
        ctx.strokeStyle = `rgba(201,169,78,${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Card fill + content ────────────────────────────────────────────────
      if (p > 0.5) {
        const fillAlpha = (p - 0.5) / 0.5;
        const cardX = cx - cardW / 2;
        const cardY = cy - cardH / 2;
        const radius = 12;

        // Dark card background
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, radius);
        ctx.clip();
        ctx.fillStyle = `rgba(15,10,30,${fillAlpha * 0.88})`;
        ctx.fillRect(cardX, cardY, cardW, cardH);

        // Subtle gradient wash
        const grad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
        grad.addColorStop(0, `rgba(40,25,60,${fillAlpha * 0.4})`);
        grad.addColorStop(1, `rgba(10,1,24,${fillAlpha * 0.6})`);
        ctx.fillStyle = grad;
        ctx.fillRect(cardX, cardY, cardW, cardH);

        // Oracle image
        if (oracleImgRef.current && fillAlpha > 0.25) {
          const imgAlpha = Math.min((fillAlpha - 0.25) / 0.55, 1);
          ctx.globalAlpha = imgAlpha;
          const imgSize = Math.min(cardW, cardH) * 0.42;
          ctx.drawImage(
            oracleImgRef.current,
            cx - imgSize / 2,
            cy - imgSize / 2 - cardH * 0.07,
            imgSize,
            imgSize
          );
          ctx.globalAlpha = 1;
        }

        ctx.restore();

        // Inner gold border
        ctx.beginPath();
        ctx.roundRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12, radius - 3);
        ctx.strokeStyle = `rgba(201,169,78,${fillAlpha * 0.45})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Corner marks
        if (fillAlpha > 0.4) {
          const cornerAlpha = (fillAlpha - 0.4) / 0.6;
          const corners = [
            [cardX + 12, cardY + 12],
            [cardX + cardW - 12, cardY + 12],
            [cardX + 12, cardY + cardH - 12],
            [cardX + cardW - 12, cardY + cardH - 12],
          ] as [number, number][];
          const cornerLen = 10;
          const cornerDirs = [
            [1, 0, 0, 1],
            [-1, 0, 0, 1],
            [1, 0, 0, -1],
            [-1, 0, 0, -1],
          ] as [number, number, number, number][];
          ctx.strokeStyle = `rgba(201,169,78,${cornerAlpha * 0.7})`;
          ctx.lineWidth = 1.5;
          corners.forEach(([cx2, cy2], i) => {
            const [dx1, dy1, dx2, dy2] = cornerDirs[i];
            ctx.beginPath();
            ctx.moveTo(cx2 + dx1 * cornerLen, cy2);
            ctx.lineTo(cx2, cy2);
            ctx.lineTo(cx2, cy2 + dy2 * cornerLen);
            ctx.stroke();
          });
        }

        // "THE ORACLE" title
        if (fillAlpha > 0.55) {
          const titleAlpha = (fillAlpha - 0.55) / 0.45;
          ctx.fillStyle = `rgba(201,169,78,${titleAlpha})`;
          ctx.font = `bold ${Math.floor(cardW * 0.11)}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.letterSpacing = "0.2em";
          ctx.fillText("THE ORACLE", cx, cardY + cardH * 0.82);
          ctx.letterSpacing = "0";
        }
      }

      // ── Dormant state label ────────────────────────────────────────────────
      if (p < 0.45) {
        const labelAlpha = Math.max(0, 1 - p / 0.45) * 0.65;

        // Glyph
        ctx.fillStyle = `rgba(201,169,78,${labelAlpha * 0.8})`;
        ctx.font = "26px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("✦", cx, cy - 18);

        // Prompt text
        ctx.fillStyle = `rgba(220,220,255,${labelAlpha})`;
        ctx.font = "13px system-ui, sans-serif";
        ctx.fillText("Ask the Oracle", cx, cy + 8);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [initStars]);

  return (
    <div className={`relative w-full h-full ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
