"use client";

import type { StageContentProps } from "./index";

/**
 * Stage: Potion Vial
 * Tech: SVG + CSS animations
 * State A (dormant): Empty glass flask with dry residue marks. Transparent glass look.
 * State B (revealed): Flask fills with glowing gold/amber liquid from bottom to top.
 *   Card image appears as a vision in the liquid. Cork lifts slightly.
 */
export function PotionVial({ morphed, className }: StageContentProps) {
  // The liquid fill level: controlled by the clipRect height/y
  // Flask interior fills from y=290 (bottom) up to y=70 (near neck)
  // When dormant: clipRect height=0 (no fill). When revealed: height=220 (full fill).
  const flaskFillY = morphed ? 70 : 290;
  const flaskFillHeight = morphed ? 220 : 0;

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className ?? ""}`}>
      <style>{`
        @keyframes liquidTurbulence {
          0%   { transform: translateY(0px) scaleX(1); }
          25%  { transform: translateY(-3px) scaleX(1.01); }
          50%  { transform: translateY(-1px) scaleX(0.99); }
          75%  { transform: translateY(-4px) scaleX(1.02); }
          100% { transform: translateY(0px) scaleX(1); }
        }
        @keyframes liquidShimmer {
          0%   { opacity: 0.6; }
          50%  { opacity: 0.85; }
          100% { opacity: 0.6; }
        }
        @keyframes corkFloat {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-1px); }
          100% { transform: translateY(0px); }
        }
        .liquid-surface {
          animation: liquidTurbulence 4s ease-in-out infinite;
          transform-origin: center;
        }
        .liquid-shimmer {
          animation: liquidShimmer 2.5s ease-in-out infinite;
        }
        .cork-float {
          animation: corkFloat 3s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 200 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      >
        <defs>
          {/* Glass gradient: subtle frosted look */}
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>

          {/* Liquid gold gradient */}
          <linearGradient id="liquidGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(201,169,78,0.85)" />
            <stop offset="40%" stopColor="rgba(195,160,65,0.75)" />
            <stop offset="100%" stopColor="rgba(160,130,50,0.65)" />
          </linearGradient>

          {/* Liquid inner shimmer */}
          <linearGradient id="liquidShimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,220,120,0.0)" />
            <stop offset="30%" stopColor="rgba(255,220,120,0.2)" />
            <stop offset="70%" stopColor="rgba(255,220,120,0.1)" />
            <stop offset="100%" stopColor="rgba(255,220,120,0.0)" />
          </linearGradient>

          {/* Cork gradient */}
          <linearGradient id="corkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8a6a40" />
            <stop offset="100%" stopColor="#5c4420" />
          </linearGradient>

          {/* Flask outline path used for clipping */}
          <clipPath id="flaskClip">
            {/* Matches the main flask interior path (slightly inset) */}
            <path d="
              M 100 295
              C 64 295 44 275 42 255
              C 40 235 44 210 48 195
              L 62 155
              C 66 142 68 130 68 118
              L 68 60
              L 132 60
              L 132 118
              C 132 130 134 142 138 155
              L 152 195
              C 156 210 160 235 158 255
              C 156 275 136 295 100 295
              Z
            " />
          </clipPath>

          {/* Clip for card image (fits inside liquid area) */}
          <clipPath id="visionClip">
            <ellipse cx="100" cy="200" rx="44" ry="55" />
          </clipPath>

          {/* Glow filter for liquid */}
          <filter id="liquidGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Outer bottle glow when revealed */}
          <filter id="bottleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feFlood floodColor="rgba(201,169,78,0.35)" result="flood" />
            <feComposite in="flood" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Dry residue / stain marks (dormant state texture) */}
          <filter id="residueTex">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" result="displaced" />
            <feComposite in="displaced" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>

        {/* Cork stopper — lifts slightly when revealed */}
        <g
          style={{
            transform: morphed ? "translateY(-6px)" : "translateY(0px)",
            transition: "transform 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.6s",
          }}
          className={morphed ? "cork-float" : ""}
        >
          {/* Cork body */}
          <rect
            x="82"
            y="38"
            width="36"
            height="24"
            rx="4"
            fill="url(#corkGrad)"
          />
          {/* Cork top lip */}
          <rect
            x="78"
            y="34"
            width="44"
            height="8"
            rx="3"
            fill="#7a5e38"
          />
          {/* Cork ring indent detail */}
          <line x1="82" y1="46" x2="118" y2="46" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          <line x1="82" y1="52" x2="118" y2="52" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        </g>

        {/* Flask glass outline — outer shape */}
        <path
          d="
            M 68 62
            L 68 118
            C 68 133 65 147 60 160
            L 44 202
            C 39 218 36 238 38 258
            C 40 280 56 302 100 302
            C 144 302 160 280 162 258
            C 164 238 161 218 156 202
            L 140 160
            C 135 147 132 133 132 118
            L 132 62
            Z
          "
          fill="url(#glassGrad)"
          stroke={morphed ? "rgba(201,169,78,0.4)" : "rgba(255,255,255,0.22)"}
          strokeWidth="1.5"
          filter={morphed ? "url(#bottleGlow)" : undefined}
          style={{ transition: "stroke 0.6s ease, filter 0.6s ease" }}
        />

        {/* Neck */}
        <rect
          x="68"
          y="58"
          width="64"
          height="8"
          fill="rgba(255,255,255,0.06)"
          stroke={morphed ? "rgba(201,169,78,0.3)" : "rgba(255,255,255,0.18)"}
          strokeWidth="1"
          style={{ transition: "stroke 0.6s ease" }}
        />

        {/* Liquid fill — clipped to flask interior */}
        <g clipPath="url(#flaskClip)">
          {/* Liquid body */}
          <rect
            x="38"
            y={flaskFillY}
            width="124"
            height={flaskFillHeight}
            fill="url(#liquidGold)"
            style={{
              transition: "y 1.0s cubic-bezier(0.4,0,0.2,1), height 1.0s cubic-bezier(0.4,0,0.2,1)",
            }}
          />

          {/* Liquid surface wave — only shown when morphed */}
          <ellipse
            cx="100"
            cy={flaskFillY}
            rx="60"
            ry="5"
            fill="rgba(230,190,90,0.6)"
            className={morphed ? "liquid-surface" : ""}
            style={{
              opacity: morphed ? 1 : 0,
              transition: "opacity 0.4s ease, cy 1.0s cubic-bezier(0.4,0,0.2,1)",
            }}
          />

          {/* Shimmer streak in liquid */}
          <rect
            x="38"
            y={flaskFillY}
            width="124"
            height={flaskFillHeight}
            fill="url(#liquidShimmerGrad)"
            className={morphed ? "liquid-shimmer" : ""}
            style={{
              transition: "y 1.0s cubic-bezier(0.4,0,0.2,1), height 1.0s cubic-bezier(0.4,0,0.2,1)",
              opacity: morphed ? 1 : 0,
            }}
          />

          {/* Card image as a vision inside the liquid */}
          <foreignObject
            x="56"
            y="145"
            width="88"
            height="110"
            clipPath="url(#visionClip)"
            style={{
              opacity: morphed ? 1 : 0,
              transition: "opacity 0.7s ease 0.8s",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: "50%",
              }}
            >
              <img
                src="/mock/cards/the-oracle.png"
                alt="The Oracle"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "sepia(0.4) hue-rotate(-10deg) brightness(0.9) contrast(1.15)",
                  mixBlendMode: "luminosity",
                }}
              />
            </div>
          </foreignObject>
        </g>

        {/* Dry residue marks on interior walls (dormant state) */}
        <g
          clipPath="url(#flaskClip)"
          style={{
            opacity: morphed ? 0 : 0.6,
            transition: "opacity 0.5s ease",
          }}
        >
          <ellipse cx="72" cy="250" rx="6" ry="2" fill="rgba(180,150,80,0.3)" filter="url(#residueTex)" />
          <ellipse cx="128" cy="262" rx="4" ry="1.5" fill="rgba(180,150,80,0.25)" filter="url(#residueTex)" />
          <ellipse cx="85" cy="275" rx="8" ry="1.5" fill="rgba(180,150,80,0.2)" filter="url(#residueTex)" />
          <path d="M 66 240 Q 68 245 65 248" stroke="rgba(150,120,60,0.3)" strokeWidth="1" fill="none" />
          <path d="M 130 255 Q 133 260 131 264" stroke="rgba(150,120,60,0.25)" strokeWidth="1" fill="none" />
        </g>

        {/* Glass highlight reflection (always visible) */}
        <path
          d="M 76 90 Q 75 130 76 160"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 80 80 Q 79 100 80 115"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Label ribbon on flask (dormant) */}
        <rect
          x="70"
          y="200"
          width="60"
          height="28"
          rx="3"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
          style={{
            opacity: morphed ? 0 : 0.8,
            transition: "opacity 0.4s ease",
          }}
        />
        <text
          x="100"
          y="218"
          textAnchor="middle"
          fill="rgba(255,255,255,0.15)"
          fontSize="7"
          letterSpacing="2"
          fontFamily="serif"
          style={{
            opacity: morphed ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          EMPTY
        </text>

        {/* Gold glow ring at base when revealed */}
        <ellipse
          cx="100"
          cy="300"
          rx="50"
          ry="6"
          fill="none"
          stroke="rgba(201,169,78,0.3)"
          strokeWidth="8"
          style={{
            opacity: morphed ? 1 : 0,
            transition: "opacity 0.6s ease 0.4s",
            filter: "blur(4px)",
          }}
        />
      </svg>
    </div>
  );
}
