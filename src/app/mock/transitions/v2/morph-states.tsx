"use client";

import { morphTheme } from "./morph-theme";

const t = morphTheme;

// ─── State 1: Oracle Card ────────────────────────────────────────────────────

export function OracleCardState() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
      {/* Deep gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #1a0a30 0%, #0d1b3e 55%, #110826 100%)",
        }}
      />

      {/* Radial gold glow behind star */}
      <div
        className="absolute"
        style={{
          top: "28%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 140,
          height: 140,
          background: `radial-gradient(circle, ${t.accentDim} 0%, transparent 70%)`,
        }}
      />

      {/* Corner ornaments */}
      {(
        [
          { top: 8, left: 8, deg: 0 },
          { top: 8, right: 8, deg: 90 },
          { bottom: 8, right: 8, deg: 180 },
          { bottom: 8, left: 8, deg: 270 },
        ] as Array<{ top?: number; bottom?: number; left?: number; right?: number; deg: number }>
      ).map((pos, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="absolute"
          style={{
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            right: pos.right,
            transform: `rotate(${pos.deg}deg)`,
            opacity: 0.4,
          }}
        >
          <path
            d="M2 14 L2 2 L14 2"
            fill="none"
            stroke={t.accent}
            strokeWidth="1.5"
          />
        </svg>
      ))}

      {/* Roman numeral */}
      <div className="absolute top-5 inset-x-0 flex justify-center">
        <span
          className="text-xs tracking-[0.3em] font-light"
          style={{ color: t.accent, opacity: 0.85 }}
        >
          VII
        </span>
      </div>

      {/* Center: 8-pointed star */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 28 }}>
        <div className="relative flex items-center justify-center">
          {/* Subtle ring glow behind star */}
          <div
            className="absolute rounded-full"
            style={{
              width: 96,
              height: 96,
              background: `radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%)`,
              border: `1px solid rgba(212,168,67,0.15)`,
            }}
          />
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {/* 8-pointed star: two overlapping squares rotated 45deg */}
            <path
              d="M40 4 L44 36 L76 40 L44 44 L40 76 L36 44 L4 40 L36 36 Z"
              fill="none"
              stroke={t.accent}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M40 10 L47 33 L70 33 L52 50 L59 73 L40 58 L21 73 L28 50 L10 33 L33 33 Z"
              fill="none"
              stroke={t.accent}
              strokeWidth="0.6"
              opacity="0.4"
              strokeLinejoin="round"
            />
            {/* Center dot */}
            <circle cx="40" cy="40" r="3" fill={t.accent} opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Card name + subtitle */}
      <div className="absolute inset-x-0 bottom-0" style={{ paddingBottom: 16 }}>
        {/* Decorative gold line */}
        <div className="flex justify-center mb-3">
          <div
            style={{
              width: 60,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
              opacity: 0.6,
            }}
          />
        </div>
        <p
          className="text-center text-sm font-semibold tracking-wider"
          style={{ color: t.text }}
        >
          The Guiding Star
        </p>
        <p
          className="text-center text-xs mt-1 tracking-widest"
          style={{ color: t.textMuted, fontSize: 10 }}
        >
          Illumination &amp; Purpose
        </p>
      </div>
    </div>
  );
}

// ─── State 2: Star Chart ─────────────────────────────────────────────────────

const CONSTELLATION_DOTS: { x: number; y: number; size?: number }[] = [
  // Orion's Gate cluster (top-left region)
  { x: 18, y: 22 },
  { x: 26, y: 18 },
  { x: 34, y: 24 },
  { x: 29, y: 32 },
  { x: 22, y: 35 },
  // The Weaver (center-right)
  { x: 58, y: 20 },
  { x: 68, y: 28 },
  { x: 74, y: 40 },
  { x: 65, y: 50 },
  { x: 56, y: 44 },
  // Crown of Thorns (lower-left)
  { x: 20, y: 62 },
  { x: 30, y: 56 },
  { x: 40, y: 65 },
  { x: 28, y: 72 },
  { x: 16, y: 70 },
];

const CONSTELLATION_LINES: [number, number][] = [
  // Orion's Gate
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
  // The Weaver
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 5],
  // Crown of Thorns
  [10, 11], [11, 12], [12, 13], [13, 14], [14, 10],
];

const BACKGROUND_STARS: { x: number; y: number; r: number }[] = [
  { x: 8, y: 8, r: 0.8 }, { x: 45, y: 12, r: 0.6 }, { x: 82, y: 6, r: 1 },
  { x: 90, y: 25, r: 0.7 }, { x: 52, y: 55, r: 0.9 }, { x: 78, y: 68, r: 0.6 },
  { x: 10, y: 48, r: 0.8 }, { x: 48, y: 80, r: 0.7 }, { x: 88, y: 82, r: 1 },
  { x: 38, y: 38, r: 0.5 }, { x: 62, y: 15, r: 0.6 }, { x: 15, y: 88, r: 0.8 },
];

export function StarChartState() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
      {/* Space background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #04040f 0%, #07091a 100%)" }}
      />

      {/* SVG chart layer — uses percentage coordinates */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Background star field */}
        {BACKGROUND_STARS.map((s, i) => (
          <circle
            key={`bg-${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r * 0.4}
            fill="white"
            opacity="0.25"
          />
        ))}

        {/* Astrolabe center ring */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke={t.accent}
          strokeWidth="0.3"
          opacity="0.2"
        />
        <circle
          cx="50"
          cy="50"
          r="22"
          fill="none"
          stroke={t.secondary}
          strokeWidth="0.2"
          opacity="0.12"
        />
        {/* Degree tick marks on outer ring */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const inner = 29;
          const outer = i % 6 === 0 ? 31.5 : 30.5;
          return (
            <line
              key={`tick-${i}`}
              x1={50 + Math.cos(angle) * inner}
              y1={50 + Math.sin(angle) * inner}
              x2={50 + Math.cos(angle) * outer}
              y2={50 + Math.sin(angle) * outer}
              stroke={t.accent}
              strokeWidth="0.3"
              opacity="0.3"
            />
          );
        })}

        {/* Constellation connection lines */}
        {CONSTELLATION_LINES.map(([a, b], i) => {
          const da = CONSTELLATION_DOTS[a];
          const db = CONSTELLATION_DOTS[b];
          return (
            <line
              key={`line-${i}`}
              x1={da.x}
              y1={da.y}
              x2={db.x}
              y2={db.y}
              stroke={t.accent}
              strokeWidth="0.4"
              opacity="0.3"
            />
          );
        })}

        {/* Constellation dots */}
        {CONSTELLATION_DOTS.map((dot, i) => (
          <circle
            key={`dot-${i}`}
            cx={dot.x}
            cy={dot.y}
            r="1.2"
            fill={t.accent}
            opacity="0.85"
          />
        ))}
      </svg>

      {/* Constellation labels */}
      <div className="absolute" style={{ top: "13%", left: "14%" }}>
        <span style={{ color: t.accent, fontSize: 7, opacity: 0.7, letterSpacing: "0.05em" }}>
          ORION'S GATE
        </span>
      </div>
      <div className="absolute" style={{ top: "10%", right: "12%" }}>
        <span style={{ color: t.secondary, fontSize: 7, opacity: 0.6, letterSpacing: "0.05em" }}>
          THE WEAVER
        </span>
      </div>
      <div className="absolute" style={{ bottom: "20%", left: "10%" }}>
        <span style={{ color: t.textMuted, fontSize: 7, opacity: 0.6, letterSpacing: "0.05em" }}>
          CROWN OF THORNS
        </span>
      </div>
    </div>
  );
}

// ─── State 3: Rune Reading ───────────────────────────────────────────────────

const RUNES = [
  {
    name: "Raido",
    meaning: "Journey",
    // ᚱ — angular R-like shape
    path: "M10 28 L10 2 M10 2 L20 10 M20 10 L10 16 M10 16 L22 28",
  },
  {
    name: "Thurisaz",
    meaning: "Gateway",
    // ᚦ — thorn shape
    path: "M10 2 L10 28 M10 8 L20 14 M20 14 L10 20",
  },
  {
    name: "Fehu",
    meaning: "Wealth",
    // ᚠ — F-like with angled arms
    path: "M10 28 L10 2 M10 2 L22 8 M10 14 L20 10",
  },
];

export function RuneReadingState() {
  return (
    <div
      className="relative h-full w-full flex flex-col items-center justify-center gap-2"
      style={{ background: "linear-gradient(160deg, #0d0820 0%, #0a0b1e 100%)" }}
    >
      {/* Title */}
      <p
        className="text-xs tracking-[0.25em] uppercase mb-1"
        style={{ color: t.textMuted }}
      >
        Today's Cast
      </p>

      {/* Horizontal connector line */}
      <div className="relative w-full flex items-center justify-center" style={{ height: 2 }}>
        <div
          style={{
            position: "absolute",
            width: "55%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${t.accent}55, transparent)`,
            top: "50%",
          }}
        />
      </div>

      {/* Rune row */}
      <div className="flex items-center justify-center gap-6 px-4">
        {RUNES.map((rune, i) => (
          <div key={rune.name} className="flex flex-col items-center gap-2">
            {/* Rune glyph with ring */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: 56, height: 56 }}
            >
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${t.accent}`,
                  opacity: 0.25,
                }}
              />
              {/* Inner faint fill */}
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  background: t.accentDim,
                  opacity: 0.15,
                }}
              />
              {/* Rune SVG */}
              <svg
                width="32"
                height="30"
                viewBox="0 0 32 30"
                fill="none"
                className="relative"
              >
                <path
                  d={rune.path}
                  stroke={t.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Subtle glow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${t.accentDim} 0%, transparent 65%)`,
                  opacity: 0.6,
                }}
              />
            </div>
            {/* Rune name */}
            <span
              className="text-xs font-semibold tracking-wider"
              style={{
                color: t.text,
                textTransform: "uppercase",
                fontSize: 9,
                letterSpacing: "0.12em",
              }}
            >
              {rune.name}
            </span>
            {/* Meaning */}
            <span
              className="text-xs"
              style={{ color: t.textMuted, fontSize: 9 }}
            >
              {rune.meaning}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom connector */}
      <div className="relative w-full flex items-center justify-center" style={{ height: 2 }}>
        <div
          style={{
            position: "absolute",
            width: "55%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${t.accent}55, transparent)`,
          }}
        />
      </div>

      {/* Footer note */}
      <p
        className="text-xs mt-1"
        style={{ color: t.textMuted, fontSize: 9, fontStyle: "italic" }}
      >
        Three runes drawn at dawn
      </p>
    </div>
  );
}

// ─── State 4: Crystal Vision ─────────────────────────────────────────────────

const PROPHECY_LINES = [
  { text: "The path divides ahead...", opacity: 1.0 },
  { text: "Two doors, one key...", opacity: 0.68 },
  { text: "Trust the silence between...", opacity: 0.38 },
  { text: "Dawn follows the longest night.", opacity: 0.18 },
];

export function CrystalVisionState() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[inherit] flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(160deg, #080a1c 0%, #0e0520 100%)" }}
    >
      {/* Misty gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(100,60,160,0.18) 0%, transparent 65%)",
        }}
      />

      {/* Orb: nested radial gradients */}
      <div className="relative flex items-center justify-center mb-5">
        {/* Outer atmospheric halo */}
        <div
          className="absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            background:
              "radial-gradient(circle, rgba(160,120,230,0.06) 0%, transparent 70%)",
          }}
        />
        {/* Mid glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: 80,
            height: 80,
            background: `radial-gradient(circle, rgba(212,168,67,0.2) 0%, rgba(130,80,200,0.25) 50%, transparent 75%)`,
          }}
        />
        {/* Core orb */}
        <div
          className="relative rounded-full"
          style={{
            width: 52,
            height: 52,
            background: `radial-gradient(circle at 35% 35%, rgba(255,225,140,0.9) 0%, ${t.accent} 30%, rgba(90,40,160,0.8) 70%, rgba(30,10,60,0.95) 100%)`,
            boxShadow: `0 0 24px rgba(212,168,67,0.35), 0 0 8px rgba(212,168,67,0.6)`,
          }}
        >
          {/* Specular highlight */}
          <div
            className="absolute rounded-full"
            style={{
              width: 14,
              height: 10,
              background: "rgba(255,255,220,0.6)",
              top: 10,
              left: 10,
              filter: "blur(3px)",
            }}
          />
        </div>
      </div>

      {/* Prophecy text */}
      <div className="relative flex flex-col items-center gap-1.5 px-6">
        {PROPHECY_LINES.map((line, i) => (
          <p
            key={i}
            className="text-center text-xs italic"
            style={{
              color: t.text,
              opacity: line.opacity,
              fontSize: 11,
              letterSpacing: "0.04em",
            }}
          >
            {line.text}
          </p>
        ))}
      </div>

      {/* Bottom mist fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-12"
        style={{
          background: "linear-gradient(transparent, rgba(8,10,28,0.7))",
        }}
      />
    </div>
  );
}

// ─── State 5: Potion Recipe ──────────────────────────────────────────────────

const INGREDIENTS = [
  "Moonpetal essence — 3 drops",
  "Crushed starlight — 1 pinch",
  "Dreamweaver silk — 2 threads",
  "Phoenix tear — 1 drop",
];

export function PotionRecipeState() {
  return (
    <div
      className="relative h-full w-full flex flex-col px-5 py-5 gap-3"
      style={{ background: "linear-gradient(160deg, #091218 0%, #0a0b1e 100%)" }}
    >
      {/* Decorative flask icon */}
      <div className="flex items-center gap-2 mb-1">
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path
            d="M6 2 L6 9 L1 18 Q0 20 2 21 L16 21 Q18 20 17 18 L12 9 L12 2"
            stroke={t.accent}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line
            x1="5"
            y1="2"
            x2="13"
            y2="2"
            stroke={t.accent}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Liquid fill inside flask */}
          <path
            d="M4 17 Q3 19 4 20 L14 20 Q15 19 14 17 L10 11 L8 11 Z"
            fill="rgba(20,200,180,0.25)"
            stroke="none"
          />
          <path
            d="M3.5 18.5 L14.5 18.5"
            stroke="rgba(20,200,180,0.5)"
            strokeWidth="0.8"
          />
        </svg>
        <div>
          <p
            className="text-sm font-semibold tracking-wide"
            style={{ color: t.accent }}
          >
            Elixir of Clarity
          </p>
          <p style={{ color: t.textMuted, fontSize: 9, letterSpacing: "0.1em" }}>
            BREWING FORMULA
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, ${t.accent}60, transparent)`,
        }}
      />

      {/* Ingredient list */}
      <div className="flex flex-col gap-2 flex-1 justify-center">
        {INGREDIENTS.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {/* Gold bullet dot */}
            <div
              className="mt-1.5 shrink-0 rounded-full"
              style={{
                width: 5,
                height: 5,
                background: t.accent,
                boxShadow: `0 0 4px ${t.accent}`,
              }}
            />
            <span className="text-xs leading-relaxed" style={{ color: t.text, fontSize: 11 }}>
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* Brew strength bar */}
      <div className="mt-1">
        <div className="flex justify-between mb-1.5">
          <span style={{ color: t.textMuted, fontSize: 9, letterSpacing: "0.1em" }}>
            POTENCY
          </span>
          <span style={{ color: t.accent, fontSize: 9, fontWeight: 600 }}>
            Strong
          </span>
        </div>
        <div
          className="rounded-full overflow-hidden"
          style={{ height: 6, background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: "65%",
              background:
                "linear-gradient(90deg, rgba(20,200,180,0.9) 0%, rgba(100,180,100,0.9) 40%, #d4a843 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── State 6: Tarot Spread ───────────────────────────────────────────────────

const SPREAD_CARDS = [
  {
    label: "Past",
    symbol: (
      // Crescent moon
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M14 4 A9 9 0 1 0 14 18 A6 6 0 1 1 14 4"
          stroke="rgba(196,206,255,0.7)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
    scale: 0.92,
    offsetY: 2,
  },
  {
    label: "Present",
    symbol: (
      // Eye
      <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
        <path
          d="M2 11 Q13 2 24 11 Q13 20 2 11 Z"
          stroke={t.accent}
          strokeWidth="1.2"
          fill="none"
        />
        <circle cx="13" cy="11" r="3.5" stroke={t.accent} strokeWidth="1.2" fill="none" />
        <circle cx="13" cy="11" r="1.2" fill={t.accent} />
      </svg>
    ),
    scale: 1.08,
    offsetY: -4,
  },
  {
    label: "Future",
    symbol: (
      // Sun with rays
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.5" stroke={t.accent} strokeWidth="1.2" fill="none" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={12 + Math.cos(rad) * 6.5}
              y1={12 + Math.sin(rad) * 6.5}
              x2={12 + Math.cos(rad) * 9}
              y2={12 + Math.sin(rad) * 9}
              stroke={t.accent}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    ),
    scale: 0.92,
    offsetY: 2,
  },
];

export function TarotSpreadState() {
  return (
    <div
      className="relative h-full w-full flex flex-col items-center justify-center gap-4"
      style={{ background: "linear-gradient(160deg, #0e0820 0%, #0a0b1e 100%)" }}
    >
      {/* Title */}
      <p
        className="text-xs tracking-[0.2em] uppercase"
        style={{ color: t.textMuted }}
      >
        Three-Card Spread
      </p>

      {/* Cards row */}
      <div className="flex items-end justify-center gap-3">
        {SPREAD_CARDS.map((card, i) => (
          <div
            key={card.label}
            className="flex flex-col items-center gap-2"
            style={{
              transform: `scale(${card.scale}) translateY(${card.offsetY}px)`,
              transformOrigin: "bottom center",
            }}
          >
            {/* Card outline */}
            <div
              className="relative flex items-center justify-center rounded-lg"
              style={{
                width: 52,
                height: 78,
                border: `1.5px solid ${i === 1 ? t.accent : t.border}`,
                background:
                  i === 1
                    ? "rgba(212,168,67,0.07)"
                    : "rgba(255,255,255,0.03)",
                boxShadow:
                  i === 1 ? `0 0 16px rgba(212,168,67,0.2)` : "none",
              }}
            >
              {/* Corner marks on present card */}
              {i === 1 && (
                <>
                  {[
                    { top: 4, left: 4, r: 0 },
                    { top: 4, right: 4, r: 90 },
                    { bottom: 4, right: 4, r: 180 },
                    { bottom: 4, left: 4, r: 270 },
                  ].map((c, ci) => (
                    <svg
                      key={ci}
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      className="absolute"
                      style={{
                        top: c.top,
                        left: c.left,
                        right: c.right,
                        bottom: c.bottom,
                        transform: `rotate(${c.r}deg)`,
                        opacity: 0.5,
                      }}
                    >
                      <path d="M1 7 L1 1 L7 1" fill="none" stroke={t.accent} strokeWidth="1" />
                    </svg>
                  ))}
                </>
              )}
              {/* Symbol */}
              <div className="opacity-85">{card.symbol}</div>
            </div>
            {/* Label */}
            <span
              className="text-xs tracking-wider"
              style={{
                color: i === 1 ? t.accent : t.textMuted,
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {card.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <p
        className="text-xs italic"
        style={{ color: t.textMuted, fontSize: 9, opacity: 0.7 }}
      >
        Touch any card to reveal
      </p>
    </div>
  );
}

// ─── State 7: Moon Phase ─────────────────────────────────────────────────────

// 7 lunar cycle indicators: 0=new, 0.5=half, 1=full
const LUNAR_CYCLE = [0, 0.2, 0.5, 1, 0.5, 0.2, 0];

export function MoonPhaseState() {
  return (
    <div
      className="relative h-full w-full flex flex-col items-center justify-center gap-3 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #060912 0%, #0a0c20 100%)" }}
    >
      {/* Background blue-silver glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 160,
          height: 160,
          background:
            "radial-gradient(circle, rgba(160,170,230,0.1) 0%, rgba(80,90,180,0.06) 50%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
        }}
      />

      {/* Night label */}
      <p
        className="text-xs tracking-widest"
        style={{ color: t.textMuted, fontSize: 9, letterSpacing: "0.2em" }}
      >
        NIGHT 11 OF 29
      </p>

      {/* Moon: waxing gibbous using SVG */}
      <div className="relative flex items-center justify-center">
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none">
          {/* Outer subtle ring */}
          <circle
            cx="42"
            cy="42"
            r="40"
            fill="none"
            stroke="rgba(160,170,230,0.12)"
            strokeWidth="1"
          />
          {/* Full circle — the lit side base */}
          <circle cx="42" cy="42" r="34" fill="rgba(220,225,255,0.15)" />
          {/* Waxing gibbous: the shadow mask (left portion) */}
          {/* We draw the lit portion as an arc shape */}
          <path
            d="M42 8 A34 34 0 1 1 42 76 A20 34 0 1 0 42 8 Z"
            fill="rgba(210,200,160,0.85)"
          />
          {/* Rim highlight */}
          <circle
            cx="42"
            cy="42"
            r="34"
            fill="none"
            stroke="rgba(220,200,140,0.4)"
            strokeWidth="0.8"
          />
          {/* Moon surface texture: subtle craters */}
          <circle cx="52" cy="30" r="3" fill="rgba(0,0,0,0.1)" />
          <circle cx="58" cy="48" r="2" fill="rgba(0,0,0,0.08)" />
          <circle cx="46" cy="56" r="1.5" fill="rgba(0,0,0,0.07)" />
        </svg>
      </div>

      {/* Phase label */}
      <p
        className="text-sm font-medium tracking-wider"
        style={{ color: t.text, letterSpacing: "0.1em" }}
      >
        Waxing Gibbous
      </p>

      {/* Lunar cycle mini-row */}
      <div className="flex items-center gap-2 mt-1">
        {LUNAR_CYCLE.map((fill, i) => (
          <div key={i} className="relative" style={{ width: 10, height: 10 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              {/* Empty circle outline */}
              <circle
                cx="5"
                cy="5"
                r="4"
                fill="none"
                stroke={i === 3 ? t.accent : "rgba(160,170,230,0.35)"}
                strokeWidth="0.8"
              />
              {/* Fill based on phase */}
              {fill === 1 && (
                <circle cx="5" cy="5" r="3.5" fill="rgba(212,168,67,0.7)" />
              )}
              {fill === 0.5 && (
                <path d="M5 1.5 A3.5 3.5 0 0 1 5 8.5 Z" fill="rgba(200,190,150,0.5)" />
              )}
              {fill === 0.2 && (
                <path d="M5 2 A3.5 3.5 0 0 1 5 8 A2.5 3.5 0 0 0 5 2 Z" fill="rgba(160,150,120,0.3)" />
              )}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── State 8: Sigil Grid ─────────────────────────────────────────────────────

const SIGIL_CELLS = [
  {
    element: "Fire",
    property: "Passion",
    tint: "rgba(180,60,20,0.07)",
    symbol: (
      // Upward triangle (flame)
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 4 L25 24 L3 24 Z"
          stroke="rgba(220,100,50,0.85)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="rgba(180,60,20,0.12)"
        />
        <path
          d="M14 10 L20 22 L8 22 Z"
          stroke="rgba(220,100,50,0.4)"
          strokeWidth="0.8"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    labelColor: "rgba(220,120,70,0.75)",
  },
  {
    element: "Water",
    property: "Flow",
    tint: "rgba(20,80,180,0.07)",
    symbol: (
      // Wavy lines
      <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
        <path
          d="M2 6 Q7 2 12 6 Q17 10 22 6 Q27 2 30 6"
          stroke="rgba(80,140,220,0.85)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M2 13 Q7 9 12 13 Q17 17 22 13 Q27 9 30 13"
          stroke="rgba(80,140,220,0.6)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M2 19 Q7 15 12 19 Q17 23 22 19 Q27 15 30 19"
          stroke="rgba(80,140,220,0.3)"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
    labelColor: "rgba(100,160,230,0.75)",
  },
  {
    element: "Air",
    property: "Thought",
    tint: "rgba(200,200,220,0.05)",
    symbol: (
      // Parallel curves
      <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
        <path
          d="M3 11 Q10 4 20 8 Q26 10 27 11"
          stroke="rgba(200,210,230,0.75)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M3 14 Q10 7 20 11 Q26 13 27 14"
          stroke="rgba(200,210,230,0.5)"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M3 17 Q10 10 20 14 Q26 16 27 17"
          stroke="rgba(200,210,230,0.25)"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
    labelColor: "rgba(190,200,225,0.65)",
  },
  {
    element: "Earth",
    property: "Stability",
    tint: "rgba(30,120,30,0.06)",
    symbol: (
      // Downward triangle with crossbar
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M3 4 L25 4 L14 24 Z"
          stroke="rgba(80,160,90,0.8)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="rgba(30,120,30,0.1)"
        />
        <line
          x1="7"
          y1="12"
          x2="21"
          y2="12"
          stroke="rgba(80,160,90,0.5)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
    labelColor: "rgba(100,170,110,0.7)",
  },
];

export function SigilGridState() {
  return (
    <div
      className="relative h-full w-full flex flex-col p-3 gap-2"
      style={{ background: "linear-gradient(160deg, #090a1c 0%, #0a0b1e 100%)" }}
    >
      {/* Title */}
      <p
        className="text-xs tracking-[0.2em] text-center"
        style={{ color: t.textMuted, fontSize: 9 }}
      >
        ELEMENTAL SIGILS
      </p>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {SIGIL_CELLS.map((cell) => (
          <div
            key={cell.element}
            className="relative flex flex-col items-center justify-center gap-1.5 rounded-lg"
            style={{
              background: cell.tint,
              border: `1px solid ${t.border}`,
              minHeight: 0,
            }}
          >
            {/* Symbol */}
            <div className="flex items-center justify-center" style={{ height: 32 }}>
              {cell.symbol}
            </div>
            {/* Element name */}
            <span
              className="font-semibold"
              style={{
                color: cell.labelColor,
                fontSize: 9,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {cell.element}
            </span>
            {/* Property */}
            <span
              style={{
                color: t.textMuted,
                fontSize: 8,
                letterSpacing: "0.05em",
                opacity: 0.8,
              }}
            >
              {cell.property}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Paths for Flubber Morpher ──────────────────────────────────────────

/** 8-pointed star */
export const SVG_PATH_STAR =
  "M 150 10 L 165 110 L 290 150 L 165 190 L 150 290 L 135 190 L 10 150 L 135 110 Z";

/** Constellation (5-point irregular) */
export const SVG_PATH_CONSTELLATION =
  "M 80 40 L 140 20 L 200 60 L 260 30 L 240 120 L 280 200 L 220 240 L 150 200 L 80 250 L 60 180 L 20 120 Z";

/** Rune (angular R shape) */
export const SVG_PATH_RUNE =
  "M 100 30 L 100 270 M 100 30 L 200 80 L 200 130 L 100 150 L 200 270";

/** Eye shape */
export const SVG_PATH_EYE =
  "M 20 150 Q 150 30 280 150 Q 150 270 20 150 Z";

/** Flask / potion bottle */
export const SVG_PATH_FLASK =
  "M 120 30 L 120 120 L 50 250 Q 40 280 70 290 L 230 290 Q 260 280 250 250 L 180 120 L 180 30 Z";

/** Tarot card (3 stacked rectangles) */
export const SVG_PATH_TAROT =
  "M 60 40 L 240 40 L 240 260 L 60 260 Z";

/** Crescent moon */
export const SVG_PATH_CRESCENT =
  "M 200 30 A 120 120 0 1 0 200 270 A 80 80 0 1 1 200 30 Z";

/** Diamond / gem */
export const SVG_PATH_DIAMOND =
  "M 150 20 L 260 120 L 150 280 L 40 120 Z";

export const SVG_PATHS = [
  SVG_PATH_STAR,
  SVG_PATH_CONSTELLATION,
  SVG_PATH_RUNE,
  SVG_PATH_EYE,
  SVG_PATH_FLASK,
  SVG_PATH_TAROT,
  SVG_PATH_CRESCENT,
  SVG_PATH_DIAMOND,
] as const;

// ─── Exports ─────────────────────────────────────────────────────────────────

export const CONTENT_STATES = [
  OracleCardState,
  StarChartState,
  RuneReadingState,
  CrystalVisionState,
  PotionRecipeState,
  TarotSpreadState,
  MoonPhaseState,
  SigilGridState,
] as const;

export const STATE_LABELS = [
  "Oracle Card",
  "Star Chart",
  "Runes",
  "Vision",
  "Potion",
  "Tarot",
  "Moon",
  "Sigils",
] as const;
