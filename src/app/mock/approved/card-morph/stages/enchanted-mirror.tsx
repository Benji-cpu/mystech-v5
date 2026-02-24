"use client";

import type { StageContentProps } from "./index";

/**
 * Stage: Enchanted Mirror
 * Tech: CSS + HTML (no SVG, no canvas)
 * State A (dormant): Ornate oval mirror with clouded/misty surface. Tarnished gold/bronze frame.
 * State B (revealed): Mist clears via expanding clip-path circle. Card image becomes visible.
 *   Frame glows bright gold. CSS ripple effect on surface.
 */
export function EnchantedMirror({ morphed, className }: StageContentProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className ?? ""}`}>
      <style>{`
        @keyframes mirrorRipple {
          0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        @keyframes ripple2 {
          0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        @keyframes mistDrift {
          0%   { transform: translate(0%, 0%) scale(1); opacity: 0.6; }
          33%  { transform: translate(4%, -3%) scale(1.04); opacity: 0.8; }
          66%  { transform: translate(-3%, 2%) scale(0.97); opacity: 0.65; }
          100% { transform: translate(0%, 0%) scale(1); opacity: 0.6; }
        }
        @keyframes frameGlimmer {
          0%   { opacity: 0.5; }
          50%  { opacity: 1.0; }
          100% { opacity: 0.5; }
        }
        @keyframes frameOrnamentPulse {
          0%   { box-shadow: 0 0 8px rgba(201,169,78,0.3); }
          50%  { box-shadow: 0 0 18px rgba(201,169,78,0.7), 0 0 30px rgba(201,169,78,0.2); }
          100% { box-shadow: 0 0 8px rgba(201,169,78,0.3); }
        }
        .mist-layer {
          animation: mistDrift 6s ease-in-out infinite;
        }
        .mist-layer-2 {
          animation: mistDrift 8s ease-in-out infinite reverse;
        }
        .frame-glimmer {
          animation: frameGlimmer 3s ease-in-out infinite;
        }
        .mirror-ripple-1 {
          animation: mirrorRipple 2s ease-out infinite;
        }
        .mirror-ripple-2 {
          animation: ripple2 2s ease-out 0.7s infinite;
        }
        .frame-ornament-pulse {
          animation: frameOrnamentPulse 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Outer wrapper — constrains proportions */}
      <div
        style={{
          position: "relative",
          width: "min(75%, 220px)",
          aspectRatio: "3 / 4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ── Frame system: multiple nested rings ── */}

        {/* Outermost decorative halo */}
        <div
          style={{
            position: "absolute",
            inset: "-14px",
            borderRadius: "50%",
            border: morphed
              ? "2px solid rgba(201,169,78,0.25)"
              : "2px solid rgba(180,150,80,0.12)",
            transition: "border-color 0.8s ease, box-shadow 0.8s ease",
            boxShadow: morphed
              ? "0 0 40px rgba(201,169,78,0.25), inset 0 0 20px rgba(201,169,78,0.08)"
              : "none",
          }}
        />

        {/* Outer thick frame */}
        <div
          style={{
            position: "absolute",
            inset: "-8px",
            borderRadius: "50%",
            border: morphed
              ? "8px solid rgba(201,169,78,0.9)"
              : "8px solid rgba(140,110,60,0.7)",
            transition: "border-color 0.8s ease, box-shadow 0.8s ease",
            boxShadow: morphed
              ? "0 0 30px rgba(201,169,78,0.5), inset 0 0 12px rgba(201,169,78,0.15)"
              : "0 0 8px rgba(100,80,40,0.4)",
          }}
          className={morphed ? "frame-ornament-pulse" : ""}
        />

        {/* Inner thin border ring */}
        <div
          style={{
            position: "absolute",
            inset: "2px",
            borderRadius: "50%",
            border: morphed
              ? "2px solid rgba(201,169,78,0.6)"
              : "2px solid rgba(180,150,80,0.3)",
            transition: "border-color 0.8s ease",
            zIndex: 2,
            pointerEvents: "none",
          }}
          className={morphed ? "frame-glimmer" : ""}
        />

        {/* ── Decorative corner ornaments (4 quadrant accents) ── */}
        {[
          { top: "-4px", left: "50%", transform: "translateX(-50%)" },
          { bottom: "-4px", left: "50%", transform: "translateX(-50%) rotate(180deg)" },
          { top: "50%", left: "-4px", transform: "translateY(-50%) rotate(-90deg)" },
          { top: "50%", right: "-4px", transform: "translateY(-50%) rotate(90deg)" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: "14px",
              height: "14px",
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            {/* Diamond accent */}
            <div
              style={{
                width: "10px",
                height: "10px",
                margin: "2px",
                transform: "rotate(45deg)",
                background: morphed
                  ? "rgba(201,169,78,0.9)"
                  : "rgba(160,130,70,0.5)",
                boxShadow: morphed
                  ? "0 0 8px rgba(201,169,78,0.7)"
                  : "none",
                transition: "background 0.8s ease, box-shadow 0.8s ease",
              }}
            />
          </div>
        ))}

        {/* ── Mirror surface (oval shape) ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            background: "radial-gradient(ellipse at 40% 35%, rgba(30,20,50,0.6), rgba(10,6,20,0.95))",
          }}
        >
          {/* Card image — revealed via expanding circle clip-path */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: morphed
                ? "circle(75% at 50% 50%)"
                : "circle(0% at 50% 50%)",
              transition: "clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <img
              src="/mock/cards/the-oracle.png"
              alt="The Oracle"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.85) contrast(1.1) saturate(0.9)",
              }}
            />
            {/* Subtle reflection sheen over image */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.12) 0%, transparent 55%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Mist layers (dormant state) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: morphed ? 0 : 1,
              transition: "opacity 0.6s ease",
              pointerEvents: "none",
            }}
          >
            {/* Base mist fill */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(130,110,180,0.35) 0%, rgba(30,20,60,0.5) 60%, rgba(10,6,20,0.7) 100%)",
              }}
            />
            {/* Animated mist drift layer 1 */}
            <div
              className="mist-layer"
              style={{
                position: "absolute",
                inset: "-20%",
                background:
                  "radial-gradient(ellipse at 40% 40%, rgba(160,140,220,0.2) 0%, transparent 60%)",
              }}
            />
            {/* Animated mist drift layer 2 */}
            <div
              className="mist-layer-2"
              style={{
                position: "absolute",
                inset: "-20%",
                background:
                  "radial-gradient(ellipse at 65% 60%, rgba(100,80,180,0.15) 0%, transparent 55%)",
              }}
            />
            {/* Frosted center blur */}
            <div
              style={{
                position: "absolute",
                inset: "15%",
                borderRadius: "50%",
                backdropFilter: "blur(8px)",
                background: "rgba(150,130,200,0.06)",
              }}
            />
            {/* Center symbol */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  opacity: 0.25,
                  color: "rgba(200,180,255,1)",
                  userSelect: "none",
                }}
              >
                ✦
              </span>
            </div>
          </div>

          {/* Ripple effect — only when morphed */}
          {morphed && (
            <>
              <div
                className="mirror-ripple-1"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "60%",
                  height: "60%",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(201,169,78,0.5)",
                  pointerEvents: "none",
                  zIndex: 4,
                }}
              />
              <div
                className="mirror-ripple-2"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "60%",
                  height: "60%",
                  borderRadius: "50%",
                  border: "1px solid rgba(201,169,78,0.3)",
                  pointerEvents: "none",
                  zIndex: 4,
                }}
              />
            </>
          )}

          {/* Glass highlight — always visible */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "15%",
              width: "28%",
              height: "18%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(255,255,255,0.14) 0%, transparent 70%)",
              transform: "rotate(-25deg)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        </div>

        {/* Frame text label — tarnished when dormant, gold when revealed */}
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: "9px",
            letterSpacing: "4px",
            fontFamily: "serif",
            color: morphed ? "rgba(201,169,78,0.8)" : "rgba(160,140,80,0.35)",
            transition: "color 0.8s ease",
          }}
        >
          SPECULUM ARCANUM
        </div>
      </div>
    </div>
  );
}
