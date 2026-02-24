"use client";

import type { StageContentProps } from "./index";

/**
 * Stage: Ancient Tome
 * State A (closed): Leather-bound book, gold clasp, embossed "ORACLE" cover.
 * State B (opened): Front cover rotates open via CSS 3D, revealing left page
 *   with handwritten title and right page with oracle card image.
 *
 * Technique: CSS 3D transforms with perspective. The front cover is a child
 * that rotates rotateY(-170deg) from its left edge when morphed. The pages
 * beneath are always visible. backface-visibility: hidden prevents cover
 * reverse from showing during the transition.
 */
export function AncientTome({ morphed, className }: StageContentProps) {
  const coverTransition =
    "transform 0.85s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.85s ease";

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className ?? ""}`}
      style={{ perspective: "1200px" }}
    >
      {/* Book wrapper — sets 3D context */}
      <div
        className="relative"
        style={{
          width: "min(72%, 280px)",
          aspectRatio: "3 / 4",
          transformStyle: "preserve-3d",
        }}
      >
        {/* ── Pages base (always visible, slightly lighter than cover) ── */}
        <div
          className="absolute inset-0 rounded-r-lg rounded-l-sm overflow-hidden flex"
          style={{
            background: "linear-gradient(135deg, #1a1228 0%, #221833 50%, #1a1228 100%)",
            boxShadow: "4px 4px 20px rgba(0,0,0,0.6), inset 0 0 30px rgba(10,1,24,0.8)",
          }}
        >
          {/* Spine divider */}
          <div
            className="absolute left-[48%] top-0 bottom-0 w-[4%]"
            style={{
              background: "linear-gradient(90deg, rgba(0,0,0,0.5), rgba(201,169,78,0.15), rgba(0,0,0,0.4))",
            }}
          />

          {/* Left page — handwritten title */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 pr-[2%] pl-[4%]"
            style={{
              opacity: morphed ? 1 : 0,
              transition: "opacity 0.4s ease",
              transitionDelay: morphed ? "0.55s" : "0s",
            }}
          >
            <div
              className="w-full"
              style={{
                borderBottom: "1px solid rgba(201,169,78,0.2)",
                paddingBottom: "8px",
                marginBottom: "6px",
              }}
            >
              <p
                className="text-center text-xs tracking-widest uppercase"
                style={{ color: "rgba(201,169,78,0.7)", fontFamily: "serif" }}
              >
                Reading
              </p>
            </div>
            {/* Ruled lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-px"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: "6px",
                }}
              />
            ))}
            <p
              className="text-center text-[10px] mt-2"
              style={{ color: "rgba(201,169,78,0.5)", fontFamily: "serif", fontStyle: "italic" }}
            >
              The oracle speaks...
            </p>
          </div>

          {/* Right page — card image */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-2 pl-[2%] pr-[4%]"
            style={{
              opacity: morphed ? 1 : 0,
              transition: "opacity 0.4s ease",
              transitionDelay: morphed ? "0.65s" : "0s",
            }}
          >
            <img
              src="/mock/cards/the-oracle.png"
              alt="The Oracle"
              className="w-[70%] object-cover rounded"
              style={{
                aspectRatio: "2 / 3",
                boxShadow: "0 0 16px rgba(201,169,78,0.25)",
                border: "1px solid rgba(201,169,78,0.3)",
              }}
            />
            <p
              className="text-[9px] tracking-widest uppercase text-center"
              style={{ color: "rgba(201,169,78,0.6)", fontFamily: "serif" }}
            >
              The Oracle
            </p>
          </div>
        </div>

        {/* ── Front cover — rotates open from left edge ── */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transformOrigin: "0% 50%",
            transform: morphed ? "rotateY(-170deg)" : "rotateY(0deg)",
            transition: coverTransition,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            zIndex: 2,
          }}
        >
          {/* Leather cover face */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #2d1b0e 0%, #3d2510 30%, #2a1609 60%, #1e1008 100%)",
              boxShadow: morphed
                ? "inset 0 0 30px rgba(0,0,0,0.9)"
                : "inset 0 0 20px rgba(0,0,0,0.6), 4px 0 16px rgba(0,0,0,0.5)",
            }}
          />

          {/* Texture overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
              mixBlendMode: "multiply",
            }}
          />

          {/* Embossed border */}
          <div
            className="absolute"
            style={{
              inset: "8%",
              border: "1px solid rgba(201,169,78,0.35)",
              borderRadius: "4px",
            }}
          />
          <div
            className="absolute"
            style={{
              inset: "10%",
              border: "1px solid rgba(201,169,78,0.15)",
              borderRadius: "2px",
            }}
          />

          {/* Corner ornaments */}
          {(
            [
              { pos: { top: "6%", left: "6%" },   bT: true,  bB: false, bL: true,  bR: false },
              { pos: { top: "6%", right: "6%" },  bT: true,  bB: false, bL: false, bR: true  },
              { pos: { bottom: "6%", left: "6%" }, bT: false, bB: true,  bL: true,  bR: false },
              { pos: { bottom: "6%", right: "6%" },bT: false, bB: true,  bL: false, bR: true  },
            ] as const
          ).map(({ pos, bT, bB, bL, bR }, i) => (
            <div
              key={i}
              className="absolute w-5 h-5"
              style={{
                ...pos,
                borderColor: "rgba(201,169,78,0.5)",
                borderTopWidth: bT ? "2px" : "0",
                borderBottomWidth: bB ? "2px" : "0",
                borderLeftWidth: bL ? "2px" : "0",
                borderRightWidth: bR ? "2px" : "0",
                borderStyle: "solid",
              }}
            />
          ))}

          {/* Central embossed title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                border: "1px solid rgba(201,169,78,0.4)",
                background: "radial-gradient(circle, rgba(201,169,78,0.1) 0%, transparent 70%)",
              }}
            >
              <span style={{ color: "rgba(201,169,78,0.7)", fontSize: "22px" }}>✦</span>
            </div>
            <p
              className="tracking-[0.3em] text-sm font-semibold"
              style={{ color: "rgba(201,169,78,0.8)", fontFamily: "serif" }}
            >
              ORACLE
            </p>
            <div
              className="flex items-center gap-2"
              style={{ color: "rgba(201,169,78,0.35)" }}
            >
              <span className="text-xs">─── ✦ ───</span>
            </div>
          </div>

          {/* Gold clasp */}
          <div
            className="absolute right-[-2%] top-[46%] w-[8%] h-[8%] rounded-sm flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #c9a94e, #a07830, #c9a94e)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
              zIndex: 3,
            }}
          >
            <div
              className="w-[40%] h-[40%] rounded-full"
              style={{ background: "rgba(15,10,30,0.7)" }}
            />
          </div>
        </div>

        {/* Cover inner face (back side — shows a parchment texture as it opens) */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transformOrigin: "0% 50%",
            transform: morphed ? "rotateY(-170deg)" : "rotateY(0deg)",
            transition: coverTransition,
            transformStyle: "preserve-3d",
            backfaceVisibility: "visible",
            zIndex: 1,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(135deg, #1e1808 0%, #2a2210 50%, #1e1808 100%)",
            }}
          />
        </div>

        {/* Ambient shadow under book */}
        <div
          className="absolute bottom-[-6%] left-[5%] right-[5%] h-[4%] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      </div>
    </div>
  );
}
