"use client";

import type { StageContentProps } from "./index";

/**
 * Stage: Rune Stone
 * Tech: SVG + CSS transitions
 * State A (dormant): Dark stone slab with rough edges and subtle stone texture. No visible markings.
 * State B (revealed): Glowing runes carve themselves in via stroke-dashoffset animation. Gold glow emanates.
 */
export function RuneStone({ morphed, className }: StageContentProps) {
  // Rune paths: simple angular marks arranged around the border area
  // Each rune has a dasharray/dashoffset that animates to 0 when morphed
  const runeData = [
    // Top-left rune: vertical with cross-bar
    { d: "M 36 28 L 36 52 M 30 36 L 42 36 M 33 44 L 39 52", len: 56 },
    // Top-center rune: arrow/chevron up
    { d: "M 128 22 L 140 42 L 152 22 M 140 42 L 140 58", len: 58 },
    // Top-right rune: angular Z-like mark
    { d: "M 232 24 L 248 24 L 232 44 L 248 44", len: 60 },
    // Right rune: vertical stave with branches
    { d: "M 258 140 L 258 178 M 258 148 L 270 140 M 258 160 L 270 168 M 258 172 L 266 180", len: 72 },
    // Bottom-right rune: bind rune
    { d: "M 242 332 L 242 352 M 230 338 L 254 338 M 236 344 L 248 352", len: 54 },
    // Bottom-center rune: triple branch
    { d: "M 140 348 L 140 326 M 140 334 L 128 322 M 140 334 L 152 322 M 140 342 L 134 348", len: 68 },
    // Bottom-left rune: rune-like N shape
    { d: "M 30 332 L 30 356 M 30 332 L 48 356 M 48 332 L 48 356", len: 64 },
    // Left rune: vertical with diagonal
    { d: "M 20 140 L 20 178 M 20 150 L 32 140 M 20 158 L 10 170", len: 60 },
  ];

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className ?? ""}`}>
      <style>{`
        @keyframes runeCarve {
          from { stroke-dashoffset: var(--rune-len); }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes stoneGlow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        .rune-path-morphed {
          animation: runeCarve 0.8s ease-out forwards;
        }
        .stone-inner-glow {
          animation: stoneGlow 3s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 280 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      >
        {/* SVG Filters */}
        <defs>
          {/* Stone grain/noise texture */}
          <filter id="stoneTexture" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="grayNoise"
            />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended" />
            <feComposite in="blended" in2="SourceGraphic" operator="in" />
          </filter>

          {/* Rune glow */}
          <filter id="runeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Stone outer glow when revealed */}
          <filter id="warmGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="8" result="glow" />
            <feFlood floodColor="rgba(201,169,78,0.4)" result="goldFlood" />
            <feComposite in="goldFlood" in2="glow" operator="in" result="maskedGlow" />
            <feMerge>
              <feMergeNode in="maskedGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient fills */}
          <linearGradient id="stoneDormant" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1428" />
            <stop offset="40%" stopColor="#120e20" />
            <stop offset="100%" stopColor="#0d0918" />
          </linearGradient>

          <linearGradient id="stoneRevealed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1630" />
            <stop offset="40%" stopColor="#16102a" />
            <stop offset="100%" stopColor="#120e22" />
          </linearGradient>

          {/* Clip for card image area */}
          <clipPath id="cardImageClip">
            <rect x="70" y="100" width="140" height="170" rx="4" />
          </clipPath>
        </defs>

        {/* Stone slab shape — slightly irregular path for organic feel */}
        <path
          d="M 16 34
             Q 10 16 28 10
             L 82 8
             Q 96 4 110 6
             L 170 5
             Q 196 3 218 8
             L 255 12
             Q 272 14 274 32
             L 278 90
             Q 280 120 278 160
             L 279 220
             Q 280 260 277 300
             L 274 348
             Q 272 368 254 372
             L 196 376
             Q 160 380 130 378
             L 84 376
             Q 54 378 32 372
             Q 10 366 8 346
             L 5 290
             Q 3 250 4 200
             L 3 140
             Q 2 100 4 60
             Z"
          fill={morphed ? "url(#stoneRevealed)" : "url(#stoneDormant)"}
          filter="url(#stoneTexture)"
          style={{ transition: "fill 0.6s ease" }}
        />

        {/* Etched border (always visible) */}
        <path
          d="M 26 44
             Q 22 28 36 22
             L 80 18
             Q 102 14 130 16
             L 180 15
             Q 210 13 238 20
             L 256 24
             Q 268 28 268 42
             L 271 100
             Q 272 140 270 185
             L 271 240
             Q 272 290 268 330
             L 264 354
             Q 262 366 246 368
             L 192 372
             Q 158 374 130 372
             L 80 370
             Q 52 372 36 366
             Q 20 360 20 346
             L 18 290
             Q 16 250 17 200
             L 16 145
             Q 15 100 17 65
             Z"
          fill="none"
          stroke={morphed ? "rgba(201,169,78,0.3)" : "rgba(255,255,255,0.08)"}
          strokeWidth="1"
          style={{ transition: "stroke 0.6s ease" }}
        />

        {/* Inner warm glow — only visible when morphed */}
        <ellipse
          cx="140"
          cy="190"
          rx="80"
          ry="110"
          fill="none"
          stroke="rgba(201,169,78,0.15)"
          strokeWidth="40"
          filter="url(#warmGlow)"
          style={{
            opacity: morphed ? 1 : 0,
            transition: "opacity 0.8s ease 0.2s",
          }}
          className={morphed ? "stone-inner-glow" : ""}
        />

        {/* Card image embedded via foreignObject — fades in with revealed state */}
        <foreignObject
          x="70"
          y="100"
          width="140"
          height="170"
          clipPath="url(#cardImageClip)"
          style={{
            opacity: morphed ? 1 : 0,
            transition: "opacity 0.7s ease 0.5s",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
              borderRadius: "4px",
            }}
          >
            <img
              src="/mock/cards/the-oracle.png"
              alt="The Oracle"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "sepia(0.3) brightness(0.85) contrast(1.1)",
              }}
            />
            {/* Grain overlay on the image */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.25'/%3E%3C/svg%3E\")",
                mixBlendMode: "overlay",
                opacity: 0.5,
              }}
            />
          </div>
        </foreignObject>

        {/* Rune paths — each animates from full dashoffset to 0 when morphed */}
        {runeData.map((rune, i) => {
          const delay = `${0.1 + i * 0.08}s`;
          return (
            <path
              key={i}
              d={rune.d}
              stroke={morphed ? "#c9a94e" : "transparent"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter={morphed ? "url(#runeGlow)" : undefined}
              style={{
                strokeDasharray: rune.len,
                strokeDashoffset: morphed ? 0 : rune.len,
                transition: morphed
                  ? `stroke-dashoffset 0.8s ease-out ${delay}, stroke 0.1s ease ${delay}, opacity 0.1s ease ${delay}`
                  : "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
                opacity: morphed ? 1 : 0,
              }}
            />
          );
        })}

        {/* Center label — visible in dormant state */}
        <text
          x="140"
          y="200"
          textAnchor="middle"
          fill="rgba(255,255,255,0.12)"
          fontSize="11"
          letterSpacing="3"
          fontFamily="serif"
          style={{
            opacity: morphed ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          DORMANT
        </text>

        {/* Gold title beneath image when revealed */}
        <text
          x="140"
          y="300"
          textAnchor="middle"
          fill="#c9a94e"
          fontSize="10"
          letterSpacing="4"
          fontFamily="serif"
          style={{
            opacity: morphed ? 0.85 : 0,
            transition: "opacity 0.5s ease 0.9s",
          }}
        >
          THE ORACLE
        </text>
      </svg>
    </div>
  );
}
