"use client";

import type { StageContentProps } from "./index";

/**
 * Stage: Tarot Stack
 * State A (dormant): 5 face-down cards in a slightly fanned stack. Each card
 *   shows an ornate back pattern (dark purple gradient + gold diamond border).
 *   Cards are staggered with increasing rotation and Y-offset by depth.
 * State B (revealed): Top card (index 0) flips via rotateY(180deg) to reveal
 *   the oracle image. Remaining cards fan out wider behind it. 600ms stagger.
 *
 * Technique: CSS 3D transforms. preserve-3d per card, backface-visibility
 *   hidden on front/back faces, perspective on the outer container.
 */
export function TarotStack({ morphed, className }: StageContentProps) {
  // Per-card layout config — [dormant transform, revealed transform]
  // Cards are indexed front-to-back (0 = top/front card)
  const cardConfigs = [
    // Top card — flips to reveal front
    {
      dormant: {
        transform: "translateX(0px) translateY(0px) translateZ(0px) rotateZ(0deg)",
        zIndex: 5,
      },
      revealed: {
        transform: "translateX(0px) translateY(-12px) translateZ(20px) rotateZ(0deg)",
        zIndex: 5,
      },
    },
    {
      dormant: {
        transform: "translateX(4px) translateY(4px) translateZ(-8px) rotateZ(2.5deg)",
        zIndex: 4,
      },
      revealed: {
        transform: "translateX(-28px) translateY(18px) translateZ(-8px) rotateZ(-12deg)",
        zIndex: 4,
      },
    },
    {
      dormant: {
        transform: "translateX(8px) translateY(8px) translateZ(-16px) rotateZ(5deg)",
        zIndex: 3,
      },
      revealed: {
        transform: "translateX(-52px) translateY(36px) translateZ(-16px) rotateZ(-22deg)",
        zIndex: 3,
      },
    },
    {
      dormant: {
        transform: "translateX(12px) translateY(12px) translateZ(-24px) rotateZ(7deg)",
        zIndex: 2,
      },
      revealed: {
        transform: "translateX(28px) translateY(22px) translateZ(-24px) rotateZ(14deg)",
        zIndex: 2,
      },
    },
    {
      dormant: {
        transform: "translateX(16px) translateY(16px) translateZ(-32px) rotateZ(9deg)",
        zIndex: 1,
      },
      revealed: {
        transform: "translateX(54px) translateY(40px) translateZ(-32px) rotateZ(24deg)",
        zIndex: 1,
      },
    },
  ] as const;

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className ?? ""}`}
      style={{ perspective: "900px" }}
    >
      <div
        style={{
          position: "relative",
          width: "min(50%, 160px)",
          aspectRatio: "2 / 3",
        }}
      >
        {cardConfigs.map((config, i) => {
          const isTopCard = i === 0;
          const currentConfig = morphed ? config.revealed : config.dormant;
          const flipAngle = isTopCard && morphed ? "rotateY(180deg)" : "rotateY(0deg)";

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                transformStyle: "preserve-3d",
                transform: `${currentConfig.transform} ${flipAngle}`,
                transition: `transform 620ms ${i * 80}ms cubic-bezier(0.4,0,0.2,1)`,
                zIndex: currentConfig.zIndex,
              }}
            >
              {/* ── Card back face ────────────────────────────────────────── */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "10px",
                  backfaceVisibility: "hidden",
                  overflow: "hidden",
                  background:
                    "linear-gradient(145deg, #1a0f35 0%, #2a1858 35%, #160c2e 65%, #0f0820 100%)",
                  border: "1.5px solid rgba(201,169,78,0.4)",
                  boxShadow:
                    "0 4px 16px rgba(0,0,0,0.6), 0 0 8px rgba(201,169,78,0.08)",
                }}
              >
                {/* Outer border inset */}
                <div
                  style={{
                    position: "absolute",
                    inset: "6px",
                    borderRadius: "6px",
                    border: "1px solid rgba(201,169,78,0.2)",
                    pointerEvents: "none",
                  }}
                />

                {/* Diamond grid pattern */}
                <div
                  style={{
                    position: "absolute",
                    inset: "10px",
                    backgroundImage:
                      "repeating-linear-gradient(45deg, rgba(201,169,78,0.04) 0px, rgba(201,169,78,0.04) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, rgba(201,169,78,0.04) 0px, rgba(201,169,78,0.04) 1px, transparent 1px, transparent 10px)",
                    borderRadius: "4px",
                  }}
                />

                {/* Radial gradient overlay for depth */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(80,40,140,0.25) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Central diamond symbol */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(45deg)",
                    width: "22%",
                    aspectRatio: "1",
                    border: "1.5px solid rgba(201,169,78,0.55)",
                    boxShadow: "0 0 8px rgba(201,169,78,0.2)",
                  }}
                />
                {/* Inner diamond */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(45deg)",
                    width: "12%",
                    aspectRatio: "1",
                    background: "rgba(201,169,78,0.2)",
                    border: "1px solid rgba(201,169,78,0.4)",
                    boxShadow: "0 0 6px rgba(201,169,78,0.3)",
                  }}
                />

                {/* Corner ornaments */}
                {[
                  { top: "8px", left: "8px", borderTop: "1.5px", borderLeft: "1.5px", borderBottom: "none", borderRight: "none" },
                  { top: "8px", right: "8px", borderTop: "1.5px", borderRight: "1.5px", borderBottom: "none", borderLeft: "none" },
                  { bottom: "8px", left: "8px", borderBottom: "1.5px", borderLeft: "1.5px", borderTop: "none", borderRight: "none" },
                  { bottom: "8px", right: "8px", borderBottom: "1.5px", borderRight: "1.5px", borderTop: "none", borderLeft: "none" },
                ].map((corner, ci) => (
                  <div
                    key={ci}
                    style={{
                      position: "absolute",
                      width: "14px",
                      height: "14px",
                      top: corner.top,
                      left: corner.left,
                      right: corner.right,
                      bottom: corner.bottom,
                      borderTopWidth: corner.borderTop,
                      borderBottomWidth: corner.borderBottom,
                      borderLeftWidth: corner.borderLeft,
                      borderRightWidth: corner.borderRight,
                      borderStyle: "solid",
                      borderColor: "rgba(201,169,78,0.45)",
                    }}
                  />
                ))}

                {/* Top/bottom filigree marks */}
                <div
                  style={{
                    position: "absolute",
                    top: "14%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "rgba(201,169,78,0.35)",
                    fontSize: "10px",
                    letterSpacing: "3px",
                  }}
                >
                  ✦
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "14%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "rgba(201,169,78,0.35)",
                    fontSize: "10px",
                    letterSpacing: "3px",
                  }}
                >
                  ✦
                </div>
              </div>

              {/* ── Card front face (only rendered on top card) ───────────── */}
              {isTopCard && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "10px",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    overflow: "hidden",
                    background:
                      "linear-gradient(165deg, #1e1238 0%, #2c1a50 40%, #160c2e 100%)",
                    border: "1.5px solid rgba(201,169,78,0.55)",
                    boxShadow:
                      "0 0 30px rgba(201,169,78,0.3), 0 8px 30px rgba(0,0,0,0.7)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {/* Inner frame */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "6px",
                      borderRadius: "6px",
                      border: "1px solid rgba(201,169,78,0.3)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Corner accents */}
                  {[
                    { top: "10px", left: "10px" },
                    { top: "10px", right: "10px" },
                    { bottom: "10px", left: "10px" },
                    { bottom: "10px", right: "10px" },
                  ].map((pos, ci) => (
                    <div
                      key={ci}
                      style={{
                        position: "absolute",
                        width: "10px",
                        height: "10px",
                        ...pos,
                        borderTop: pos.top ? "1px solid rgba(201,169,78,0.6)" : "none",
                        borderBottom: pos.bottom ? "1px solid rgba(201,169,78,0.6)" : "none",
                        borderLeft: pos.left ? "1px solid rgba(201,169,78,0.6)" : "none",
                        borderRight: pos.right ? "1px solid rgba(201,169,78,0.6)" : "none",
                      }}
                    />
                  ))}

                  {/* Oracle image */}
                  <img
                    src="/mock/cards/the-oracle.png"
                    alt="The Oracle"
                    style={{
                      width: "68%",
                      aspectRatio: "1",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid rgba(201,169,78,0.35)",
                      boxShadow: "0 0 12px rgba(201,169,78,0.25)",
                      zIndex: 1,
                    }}
                  />

                  {/* Title */}
                  <p
                    style={{
                      color: "rgba(201,169,78,0.9)",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      textShadow: "0 0 10px rgba(201,169,78,0.5)",
                      zIndex: 1,
                    }}
                  >
                    THE ORACLE
                  </p>

                  {/* Glow overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(201,169,78,0.08) 0%, transparent 100%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
