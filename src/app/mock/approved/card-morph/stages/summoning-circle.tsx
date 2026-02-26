"use client";

import type { StageContentProps } from "./index";

/**
 * Stage: Summoning Circle
 * State A (dormant): Faint concentric SVG rings with Elder Futhark rune symbols
 *   at the 8 compass points. Dim purple/gray tones. Outer ring rotates slowly.
 * State B (activated): Rings blaze gold, runes glow with staggered animation,
 *   card materialises above centre. Energy pulse radiates outward.
 *
 * Tech: Pure SVG + CSS animations. No GSAP or external deps.
 */
export function SummoningCircle({ morphed, className }: StageContentProps) {
  // Elder Futhark runes at N, NE, E, SE, S, SW, W, NW
  const runes = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᛃ", "ᛈ", "ᛉ"];

  // Position each rune on a circle of given radius (SVG coords centred at 100,100)
  const runePositions = runes.map((rune, i) => {
    const angleRad = (i * Math.PI * 2) / 8 - Math.PI / 2; // start at top (N)
    const r = 78;
    return {
      rune,
      x: 100 + r * Math.cos(angleRad),
      y: 100 + r * Math.sin(angleRad),
      delay: i * 0.08,
    };
  });

  const dormantColor = "rgba(147,130,220,0.35)";
  const activatedColor = "#c9a94e";

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className ?? ""}`}
    >
      <style>{`
        @keyframes sc-ring-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sc-ring-rotate-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes sc-pulse-ring {
          0%   { r: 35; opacity: 0.8; stroke-width: 2; }
          100% { r: 95; opacity: 0; stroke-width: 0.5; }
        }
        @keyframes sc-rune-glow {
          0%, 100% { opacity: 1; text-shadow: 0 0 8px #c9a94e; }
          50%       { opacity: 0.7; text-shadow: 0 0 20px #c9a94e, 0 0 40px rgba(201,169,78,0.5); }
        }
        .sc-outer-ring {
          transform-origin: 100px 100px;
          animation: sc-ring-rotate 18s linear infinite;
        }
        .sc-mid-ring {
          transform-origin: 100px 100px;
          animation: sc-ring-rotate-reverse 28s linear infinite;
        }
      `}</style>

      <div className="relative w-[min(90%,300px)] aspect-square">
        {/* SVG circle system */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          {/* Pulse rings — only visible when activated */}
          {morphed && (
            <>
              <circle
                cx="100"
                cy="100"
                r="35"
                fill="none"
                stroke={activatedColor}
                strokeOpacity="0.6"
                style={{
                  animation: "sc-pulse-ring 1.4s ease-out infinite",
                  transformOrigin: "100px 100px",
                }}
              />
              <circle
                cx="100"
                cy="100"
                r="35"
                fill="none"
                stroke={activatedColor}
                strokeOpacity="0.4"
                style={{
                  animation: "sc-pulse-ring 1.4s ease-out 0.7s infinite",
                  transformOrigin: "100px 100px",
                }}
              />
            </>
          )}

          {/* Inner ring */}
          <circle
            cx="100"
            cy="100"
            r="38"
            fill="none"
            stroke={morphed ? activatedColor : dormantColor}
            strokeWidth={morphed ? "1.5" : "0.8"}
            strokeDasharray={morphed ? "none" : "4 3"}
            style={{ transition: "stroke 0.7s ease, stroke-width 0.7s ease" }}
          />

          {/* Middle ring — counter-rotates */}
          <g className="sc-mid-ring">
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke={morphed ? activatedColor : dormantColor}
              strokeWidth={morphed ? "1.2" : "0.6"}
              strokeDasharray={morphed ? "6 2" : "3 6"}
              style={{ transition: "stroke 0.7s ease, stroke-width 0.7s ease" }}
            />
            {/* Tick marks on middle ring at compass points */}
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI * 2) / 8 - Math.PI / 2;
              const rx1 = 100 + 56 * Math.cos(a);
              const ry1 = 100 + 56 * Math.sin(a);
              const rx2 = 100 + 64 * Math.cos(a);
              const ry2 = 100 + 64 * Math.sin(a);
              return (
                <line
                  key={i}
                  x1={rx1}
                  y1={ry1}
                  x2={rx2}
                  y2={ry2}
                  stroke={morphed ? activatedColor : dormantColor}
                  strokeWidth={morphed ? "1.5" : "0.8"}
                  style={{ transition: "stroke 0.6s ease" }}
                />
              );
            })}
          </g>

          {/* Outer ring — rotates */}
          <g className="sc-outer-ring">
            <circle
              cx="100"
              cy="100"
              r="83"
              fill="none"
              stroke={morphed ? activatedColor : dormantColor}
              strokeWidth={morphed ? "1.5" : "0.7"}
              strokeDasharray={morphed ? "2 4" : "1 8"}
              style={{ transition: "stroke 0.7s ease, stroke-width 0.7s ease" }}
            />
            {/* Small diamonds on outer ring */}
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i * Math.PI * 2) / 16 - Math.PI / 2;
              const rx = 100 + 83 * Math.cos(a);
              const ry = 100 + 83 * Math.sin(a);
              return (
                <circle
                  key={i}
                  cx={rx}
                  cy={ry}
                  r={i % 2 === 0 ? "1.5" : "0.8"}
                  fill={morphed ? activatedColor : dormantColor}
                  style={{ transition: "fill 0.7s ease" }}
                />
              );
            })}
          </g>

          {/* Centre dot */}
          <circle
            cx="100"
            cy="100"
            r={morphed ? "5" : "2"}
            fill={morphed ? activatedColor : dormantColor}
            style={{
              transition: "fill 0.5s ease, r 0.5s ease",
              filter: morphed ? "url(#glow)" : "none",
            }}
          />

          {/* Defs for glow filter */}
          <defs>
            <filter id="sc-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Rune symbols — positioned via absolute + transform translate */}
        {runePositions.map(({ rune, x, y, delay }, i) => {
          // Convert from SVG 200x200 space to percentage for the container
          const left = `${(x / 200) * 100}%`;
          const top = `${(y / 200) * 100}%`;

          return (
            <div
              key={i}
              className="absolute"
              style={{
                left,
                top,
                transform: "translate(-50%, -50%)",
                color: morphed ? activatedColor : "rgba(147,130,220,0.5)",
                fontSize: "clamp(10px, 2.5vw, 14px)",
                fontWeight: morphed ? "600" : "400",
                lineHeight: 1,
                textShadow: morphed
                  ? `0 0 8px ${activatedColor}, 0 0 20px rgba(201,169,78,0.4)`
                  : "none",
                transition: `color 0.5s ease ${delay}s, text-shadow 0.5s ease ${delay}s, font-weight 0.3s ease`,
                animation: morphed
                  ? `sc-rune-glow 2s ease-in-out ${delay}s infinite`
                  : "none",
                userSelect: "none",
              }}
            >
              {rune}
            </div>
          );
        })}

        {/* Central card — materialises on activation */}
        {morphed && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              style={{
                width: "28%",
                aspectRatio: "2 / 3",
                borderRadius: "6px",
                overflow: "hidden",
                boxShadow: "0 0 24px rgba(201,169,78,0.5), 0 0 60px rgba(201,169,78,0.2)",
                border: "1px solid rgba(201,169,78,0.5)",
              }}
            >
              <img
                src="/mock/cards/the-oracle.png"
                alt="The Oracle"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(1.05)" }}
              />
            </div>
          </div>
        )}

        {/* Ambient radial glow */}
        <div
          className="absolute inset-[-15%] rounded-full pointer-events-none transition-opacity duration-700"
          style={{
            background: morphed
              ? "radial-gradient(circle, rgba(201,169,78,0.12) 0%, transparent 65%)"
              : "radial-gradient(circle, rgba(147,130,220,0.06) 0%, transparent 65%)",
          }}
        />
      </div>
    </div>
  );
}
