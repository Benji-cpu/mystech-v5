"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  LYRA_STARS,
  LYRA_LINES,
  ELEMENT_STYLES,
  THEME_CONSTELLATIONS,
} from "./lyra-v3-data";
import type {
  ZodiacConstellation,
  ZodiacElement,
  ThemeConstellation,
} from "./lyra-v3-data";
import type { AnchorStar, ReadingStar, LyraState } from "./lyra-v3-state";

// ── Types ───────────────────────────────────────────────────────────────

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
}

interface ParticleBurst {
  x: number;
  y: number;
  particles: { dx: number; dy: number; life: number }[];
}

interface BackgroundStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  hue: number;
  alpha: number;
}

interface ElementParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

// ── Props ───────────────────────────────────────────────────────────────

interface StarMapProps {
  zodiacSign?: ZodiacConstellation | null;
  element?: ZodiacElement | null;
  anchors?: AnchorStar[];
  ghostStarPositions?: { x: number; y: number }[];
  constellations?: ThemeConstellation[];
  readingStars?: ReadingStar[];
  readingLinesDrawn?: boolean;
  lyraState?: LyraState;
  lyraPosition?: { x: number; y: number };
  lyraPointingTarget?: { x: number; y: number } | null;
  highlightId?: string | null;
  shootingStarsEnabled?: boolean;
  showNebulae?: boolean;
  showBackgroundStars?: boolean;
  showElementParticles?: boolean;
  mini?: boolean; // Reduced rendering for mini map strip
  onConstellationTap?: (id: string) => void;
  onEmptyTap?: () => void;
  onStarLongPress?: (anchor: AnchorStar) => void;
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function pseudoNoise(t: number, seed: number): number {
  return (
    Math.sin(t * 1.0 + seed) * 0.5 +
    Math.sin(t * 2.3 + seed * 1.7) * 0.25 +
    Math.sin(t * 0.7 + seed * 3.1) * 0.25
  );
}

function generateBackgroundStars(count: number): BackgroundStar[] {
  const stars: BackgroundStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      twinkleSpeed: Math.random() * 0.5 + 0.3,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

function generateNebulae(): Nebula[] {
  return [
    { x: 0.15, y: 0.25, radius: 0.18, hue: 270, alpha: 0.04 },
    { x: 0.8, y: 0.7, radius: 0.22, hue: 240, alpha: 0.03 },
    { x: 0.5, y: 0.85, radius: 0.15, hue: 280, alpha: 0.035 },
    { x: 0.85, y: 0.2, radius: 0.12, hue: 260, alpha: 0.03 },
  ];
}

// ── Star Map Component ──────────────────────────────────────────────────

export function StarMap({
  zodiacSign,
  element,
  anchors = [],
  ghostStarPositions = [],
  constellations = [],
  readingStars = [],
  readingLinesDrawn = false,
  lyraState = "dormant",
  lyraPosition = { x: 0.5, y: 0.15 },
  lyraPointingTarget,
  highlightId,
  shootingStarsEnabled = false,
  showNebulae = true,
  showBackgroundStars = true,
  showElementParticles = true,
  mini = false,
  onConstellationTap,
  onEmptyTap,
  className,
}: StarMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const bgStarsRef = useRef<BackgroundStar[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const lastShootingRef = useRef(0);
  const burstsRef = useRef<ParticleBurst[]>([]);
  const elementParticlesRef = useRef<ElementParticle[]>([]);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const prevAnchorsLenRef = useRef(0);

  // Initialize static elements
  useEffect(() => {
    const starCount = mini ? 40 : isMobile ? 100 : 200;
    bgStarsRef.current = generateBackgroundStars(starCount);
    nebulaeRef.current = generateNebulae();
  }, [mini, isMobile]);

  // Trigger particle burst when new anchor is born
  useEffect(() => {
    const born = anchors.filter((a) => a.born);
    if (born.length > prevAnchorsLenRef.current) {
      const newest = born[born.length - 1];
      burstsRef.current.push({
        x: newest.x,
        y: newest.y,
        particles: Array.from({ length: mini ? 6 : 14 }, () => ({
          dx: (Math.random() - 0.5) * 0.06,
          dy: (Math.random() - 0.5) * 0.06,
          life: 1,
        })),
      });
    }
    prevAnchorsLenRef.current = born.length;
  }, [anchors, mini]);

  // Handle canvas tap/click
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Check constellation hit areas (44px min = ~0.1 normalized)
      const hitRadius = 0.08;
      for (const c of constellations) {
        const cx = c.stars.reduce((s, st) => s + st.x, 0) / c.stars.length;
        const cy = c.stars.reduce((s, st) => s + st.y, 0) / c.stars.length;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist < hitRadius) {
          onConstellationTap?.(c.id);
          return;
        }
      }

      onEmptyTap?.();
    },
    [constellations, onConstellationTap, onEmptyTap]
  );

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Use buffer dimensions for clearing
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // ── Layer 1: Deep space nebulae ──
      if (showNebulae && !mini) {
        nebulaeRef.current.forEach((n) => {
          const nx = n.x * w;
          const ny = n.y * h;
          const nr = n.radius * Math.min(w, h);
          const hueShift = Math.sin(t * 0.05) * 10;
          const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
          grad.addColorStop(0, `hsla(${n.hue + hueShift}, 60%, 30%, ${n.alpha})`);
          grad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
          ctx.beginPath();
          ctx.arc(nx, ny, nr, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      }

      // ── Layer 2: Background star field ──
      if (showBackgroundStars) {
        bgStarsRef.current.forEach((star) => {
          const sx = star.x * w;
          const sy = star.y * h;
          const twinkle = mini
            ? star.alpha
            : star.alpha * (0.6 + 0.4 * Math.sin(t * star.twinkleSpeed + star.twinklePhase));
          ctx.beginPath();
          ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
          ctx.fill();
        });
      }

      // ── Layer 3: Ghost stars ──
      ghostStarPositions.forEach((gs, i) => {
        const isActivated = anchors.some((a) => a.ghostStarIndex === i && a.born);
        if (isActivated) return; // Don't draw ghost if it's been activated
        const gx = gs.x * w;
        const gy = gs.y * h;
        const ghostAlpha = 0.04 + 0.04 * Math.sin(t * 0.3 + i * 1.2);
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 78, ${ghostAlpha})`;
        ctx.fill();
      });

      // ── Layer 4: Zodiac constellation ──
      if (zodiacSign) {
        const elemStyle = element ? ELEMENT_STYLES[element] : null;
        const haloColor = elemStyle?.haloColor || "#c9a94e";

        // Lines
        zodiacSign.lines.forEach(([from, to], li) => {
          const s1 = zodiacSign.stars[from];
          const s2 = zodiacSign.stars[to];
          const x1 = s1.x * w;
          const y1 = s1.y * h;
          const x2 = s2.x * w;
          const y2 = s2.y * h;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `${haloColor}44`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Stars with halos
        zodiacSign.stars.forEach((star, si) => {
          const sx = star.x * w;
          const sy = star.y * h;
          const pulse = 1 + 0.15 * Math.sin(t * 0.5 + si * 0.8);
          const r = (star.brightness > 0.7 ? 4 : 3) * pulse;

          // Halo
          const haloGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
          haloGrad.addColorStop(0, `${haloColor}33`);
          haloGrad.addColorStop(1, `${haloColor}00`);
          ctx.beginPath();
          ctx.arc(sx, sy, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = "#c9a94e";
          ctx.fill();
        });
      }

      // ── Layer 5: Theme constellations ──
      constellations.forEach((c) => {
        const isHighlighted = highlightId === c.id;
        const alpha = isHighlighted ? 1 : 0.6;

        // Lines with string vibration
        c.lines.forEach(([from, to], li) => {
          const s1 = c.stars[from];
          const s2 = c.stars[to];
          const x1 = s1.x * w;
          const y1 = s1.y * h;
          const x2 = s2.x * w;
          const y2 = s2.y * h;

          // Vibration perpendicular to line
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const px = -dy / len;
          const py = dx / len;
          const vib = Math.sin(t * 1.5 + li * 1.1) * (isHighlighted ? 3 : 1);
          const cpx = mx + px * vib;
          const cpy = my + py * vib;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cpx, cpy, x2, y2);
          ctx.strokeStyle = isHighlighted
            ? `${c.themeColor}aa`
            : `${c.themeColor}44`;
          ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
          ctx.stroke();
        });

        // Stars
        c.stars.forEach((star, si) => {
          const sx = star.x * w;
          const sy = star.y * h;
          const r = isHighlighted ? 6 : 4;

          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = `${c.themeColor}${isHighlighted ? "cc" : "88"}`;
          ctx.fill();
        });

        // Constellation name
        if (isHighlighted || !mini) {
          const cx = c.stars.reduce((s, st) => s + st.x, 0) / c.stars.length;
          const cy = Math.min(...c.stars.map((s) => s.y));
          ctx.font = `${isHighlighted ? 14 : 11}px serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = `rgba(201, 169, 78, ${isHighlighted ? 0.7 : 0.5})`;
          ctx.fillText(c.name, cx * w, cy * h - 8);
        }
      });

      // ── Layer 5b: Anchor stars (born from ghost positions) ──
      anchors.forEach((anchor) => {
        if (!anchor.born) return;
        const ax = anchor.x * w;
        const ay = anchor.y * h;
        const pulse = 1 + 0.1 * Math.sin(t * 0.8);

        // Glow
        const aGrad = ctx.createRadialGradient(ax, ay, 0, ax, ay, 18 * pulse);
        aGrad.addColorStop(0, "rgba(201, 169, 78, 0.3)");
        aGrad.addColorStop(1, "rgba(201, 169, 78, 0)");
        ctx.beginPath();
        ctx.arc(ax, ay, 18 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = aGrad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#c9a94e";
        ctx.fill();

        // Label
        ctx.font = "9px serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(201, 169, 78, 0.5)";
        ctx.fillText(anchor.name, ax, ay + 16);
      });

      // ── Layer 6: Connection threads ──
      if (constellations.length > 1 && !mini) {
        for (let i = 0; i < constellations.length - 1; i++) {
          const c1 = constellations[i];
          const c2 = constellations[i + 1];
          const cx1 = c1.stars.reduce((s, st) => s + st.x, 0) / c1.stars.length;
          const cy1 = c1.stars.reduce((s, st) => s + st.y, 0) / c1.stars.length;
          const cx2 = c2.stars.reduce((s, st) => s + st.x, 0) / c2.stars.length;
          const cy2 = c2.stars.reduce((s, st) => s + st.y, 0) / c2.stars.length;

          ctx.beginPath();
          ctx.setLineDash([2, 6]);
          ctx.moveTo(cx1 * w, cy1 * h);
          ctx.lineTo(cx2 * w, cy2 * h);
          ctx.strokeStyle = "rgba(201, 169, 78, 0.08)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── Layer 7: Lyra constellation ──
      if (!mini) {
        const lx = lyraPosition.x * w;
        const ly = lyraPosition.y * h;
        const lyraSize = 40;
        const breathSpeed = lyraState === "dormant" ? 0.3 : lyraState === "attentive" ? 0.6 : 0.9;
        const baseOp = lyraState === "dormant" ? 0.4 : lyraState === "attentive" ? 0.7 : 1.0;

        // Draw Lyra's stars
        const lyraStarPositions = LYRA_STARS.map((star, i) => {
          const noise = pseudoNoise(t * breathSpeed, i * 2.7);
          return {
            x: lx + (star.x - 0.5) * lyraSize + noise * 1.5,
            y: ly + (star.y - 0.5) * lyraSize + pseudoNoise(t * breathSpeed + 1.5, i * 2.7) * 2,
          };
        });

        // Lines
        LYRA_LINES.forEach(([fi, ti], li) => {
          const f = lyraStarPositions[fi];
          const to = lyraStarPositions[ti];
          const mx = (f.x + to.x) / 2;
          const my = (f.y + to.y) / 2;
          const dx = to.x - f.x;
          const dy = to.y - f.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const px = -dy / len;
          const py = dx / len;
          const vib = Math.sin(t * (lyraState === "speaking" ? 3 : 1.5) + li * 1.3) *
            (lyraState === "speaking" ? 2 : 0.5);

          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.quadraticCurveTo(mx + px * vib, my + py * vib, to.x, to.y);
          ctx.strokeStyle = `rgba(201, 169, 78, ${baseOp * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });

        // Stars
        lyraStarPositions.forEach((pos, i) => {
          const r = i === 0 ? 3 : 2;
          const speakPulse = lyraState === "speaking" ? 1 + Math.sin(t * 3 + i) * 0.3 : 1;

          // Glow
          const gGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 4 * speakPulse);
          gGrad.addColorStop(0, `rgba(201, 169, 78, ${baseOp * 0.25})`);
          gGrad.addColorStop(1, "rgba(201, 169, 78, 0)");
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r * 4 * speakPulse, 0, Math.PI * 2);
          ctx.fillStyle = gGrad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r * speakPulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201, 169, 78, ${baseOp})`;
          ctx.fill();
        });
      }

      // ── Layer 8: Lyra's pointing line ──
      if (lyraPointingTarget && !mini) {
        const fx = lyraPosition.x * w;
        const fy = lyraPosition.y * h;
        const tx = lyraPointingTarget.x * w;
        const ty = lyraPointingTarget.y * h;
        const midX = (fx + tx) / 2;
        const midY = Math.min(fy, ty) - 20;

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(midX, midY, tx, ty);
        ctx.strokeStyle = "rgba(201, 169, 78, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target circle
        const gr = 4 + Math.sin(t * 2) * 1;
        ctx.beginPath();
        ctx.arc(tx, ty, gr, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(201, 169, 78, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Layer 8b: Reading stars ──
      readingStars.forEach((rs, i) => {
        if (!rs.born || rs.absorbed) return;
        const rx = rs.x * w;
        const ry = rs.y * h;

        const rGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, 10);
        rGrad.addColorStop(0, "rgba(201, 169, 78, 0.4)");
        rGrad.addColorStop(1, "rgba(201, 169, 78, 0)");
        ctx.beginPath();
        ctx.arc(rx, ry, 10, 0, Math.PI * 2);
        ctx.fillStyle = rGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(rx, ry, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#c9a94e";
        ctx.fill();

        // Label
        if (rs.label) {
          ctx.font = "8px serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(201, 169, 78, 0.5)";
          ctx.fillText(rs.label, rx, ry + 14);
        }
      });

      // Reading constellation lines
      if (readingLinesDrawn && readingStars.filter((r) => r.born && !r.absorbed).length >= 3) {
        const bornStars = readingStars.filter((r) => r.born && !r.absorbed);
        for (let i = 0; i < bornStars.length; i++) {
          const next = bornStars[(i + 1) % bornStars.length];
          const cur = bornStars[i];
          const mx = (cur.x + next.x) / 2 * w;
          const my = (cur.y + next.y) / 2 * h;
          const dx = next.x * w - cur.x * w;
          const dy = next.y * h - cur.y * h;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const px = -dy / len;
          const py = dx / len;
          const vib = Math.sin(t * 2 + i * 1.5) * 2;

          ctx.beginPath();
          ctx.moveTo(cur.x * w, cur.y * h);
          ctx.quadraticCurveTo(mx + px * vib, my + py * vib, next.x * w, next.y * h);
          ctx.strokeStyle = "rgba(201, 169, 78, 0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // ── Layer 9: Shooting stars ──
      if (shootingStarsEnabled && !mini) {
        // Spawn new shooting star
        if (t - lastShootingRef.current > 25 + Math.random() * 15) {
          lastShootingRef.current = t;
          const edge = Math.random();
          shootingStarsRef.current.push({
            x: edge < 0.5 ? Math.random() : edge < 0.75 ? 0 : 1,
            y: edge < 0.5 ? 0 : Math.random() * 0.3,
            dx: (Math.random() - 0.3) * 0.015,
            dy: Math.random() * 0.008 + 0.005,
            life: 1,
            maxLife: 0.8 + Math.random() * 0.4,
          });
        }

        shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
          ss.x += ss.dx;
          ss.y += ss.dy;
          ss.life -= 0.016 / ss.maxLife;

          if (ss.life <= 0) return false;

          const sx = ss.x * w;
          const sy = ss.y * h;
          const tailLen = 30 * ss.life;
          const grad = ctx.createLinearGradient(
            sx, sy,
            sx - ss.dx * w * 3, sy - ss.dy * h * 3
          );
          grad.addColorStop(0, `rgba(201, 169, 78, ${ss.life * 0.6})`);
          grad.addColorStop(1, "rgba(201, 169, 78, 0)");

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - ss.dx * tailLen * 10, sy - ss.dy * tailLen * 10);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5 * ss.life;
          ctx.stroke();

          return true;
        });
      }

      // ── Layer 10: Element particles ──
      if (showElementParticles && element && !mini) {
        const es = ELEMENT_STYLES[element];
        const maxParticles = isMobile ? 8 : 16;

        // Spawn particles
        if (elementParticlesRef.current.length < maxParticles && Math.random() < 0.08) {
          const p: ElementParticle = {
            x: Math.random(),
            y: element === "fire" ? 0.9 + Math.random() * 0.1 : Math.random(),
            vx: element === "air" ? 0.002 + Math.random() * 0.002 : (Math.random() - 0.5) * 0.001,
            vy: element === "fire" ? -(0.002 + Math.random() * 0.003) :
              element === "water" ? 0.001 + Math.random() * 0.001 :
              (Math.random() - 0.5) * 0.001,
            life: 1,
            maxLife: 2 + Math.random() * 3,
            size: 1 + Math.random() * 2,
          };
          elementParticlesRef.current.push(p);
        }

        elementParticlesRef.current = elementParticlesRef.current.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.016 / p.maxLife;

          if (p.life <= 0 || p.y < -0.05 || p.y > 1.05 || p.x < -0.05 || p.x > 1.05) {
            return false;
          }

          const px = p.x * w;
          const py = p.y * h;

          ctx.beginPath();
          ctx.arc(px, py, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `${es.particleColor}${Math.round(p.life * 80).toString(16).padStart(2, "0")}`;
          ctx.fill();

          return true;
        });
      }

      // ── Layer 11: Particle bursts ──
      burstsRef.current = burstsRef.current.filter((burst) => {
        let alive = false;
        burst.particles.forEach((p) => {
          if (p.life <= 0) return;
          alive = true;
          p.life -= 0.025;

          const px = (burst.x + p.dx * (1 - p.life) * 5) * w;
          const py = (burst.y + p.dy * (1 - p.life) * 5) * h;

          const bRadius = Math.max(0.01, 4 * p.life);
          const bGrad = ctx.createRadialGradient(px, py, 0, px, py, bRadius);
          bGrad.addColorStop(0, `rgba(201, 169, 78, ${p.life * 0.8})`);
          bGrad.addColorStop(1, "rgba(201, 169, 78, 0)");
          ctx.beginPath();
          ctx.arc(px, py, bRadius, 0, Math.PI * 2);
          ctx.fillStyle = bGrad;
          ctx.fill();
        });
        return alive;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [
    zodiacSign, element, anchors, ghostStarPositions, constellations,
    readingStars, readingLinesDrawn, lyraState, lyraPosition, lyraPointingTarget,
    highlightId, shootingStarsEnabled, showNebulae, showBackgroundStars,
    showElementParticles, mini, isMobile,
  ]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className={cn("w-full h-full", className)}
      style={{ display: "block" }}
    />
  );
}
