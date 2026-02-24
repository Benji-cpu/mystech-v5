"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import type { TechniqueProps } from "../types";

/**
 * Technique 6: Shatter & Reconstitute
 * 6x8 grid shatters outward with random rotation, then fragments
 * reconverge carrying State B image. Center-out explosion, edge-in reassembly.
 */

const COLS = 6;
const ROWS = 8;
const TOTAL = COLS * ROWS;

export function ShatterReconstitute({
  morphed,
  onMorphComplete,
  children,
}: TechniqueProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline>(undefined);

  // Precompute random scatter values per fragment
  const scatterData = useMemo(
    () =>
      Array.from({ length: TOTAL }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const cx = (col - COLS / 2 + 0.5) / (COLS / 2);
        const cy = (row - ROWS / 2 + 0.5) / (ROWS / 2);
        return {
          x: cx * (120 + Math.random() * 80),
          y: cy * (120 + Math.random() * 80),
          rotation: (Math.random() - 0.5) * 360,
          delay: Math.sqrt(cx * cx + cy * cy) * 0.08,
        };
      }),
    []
  );

  useEffect(() => {
    if (!gridRef.current) return;
    if (tlRef.current) tlRef.current.kill();

    const fragments = gridRef.current.children;
    const tl = gsap.timeline({
      onComplete: () => onMorphComplete?.(),
    });
    tlRef.current = tl;

    if (morphed) {
      // Shatter outward, then reconverge
      tl.to(
        Array.from(fragments),
        {
          x: (i: number) => scatterData[i].x,
          y: (i: number) => scatterData[i].y,
          rotation: (i: number) => scatterData[i].rotation,
          opacity: 0.6,
          duration: 0.5,
          ease: "power2.out",
          stagger: {
            each: 0.01,
            from: "center",
          },
        }
      ).to(Array.from(fragments), {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.2)",
        stagger: {
          each: 0.01,
          from: "edges",
        },
      });
    } else {
      // Reset to form state
      tl.to(Array.from(fragments), {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        stagger: {
          each: 0.01,
          from: "center",
        },
      });
    }

    return () => {
      tl.kill();
    };
  }, [morphed, onMorphComplete, scatterData]);

  const fragmentWidth = `${100 / COLS}%`;
  const fragmentHeight = `${100 / ROWS}%`;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-4/5 max-w-[280px] h-[85%] relative overflow-visible">
        {/* Children base layer — sits behind the fragment grid so children's
            State A/B transition is revealed as fragments scatter outward */}
        {children && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden z-0">
            {children}
          </div>
        )}

        <div
          ref={gridRef}
          className="w-full h-full relative"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            zIndex: 1,
          }}
        >
          {children
            ? // Children path: semi-transparent overlay fragments so the base
              // layer shows through. Fragments scatter to reveal children state.
              Array.from({ length: TOTAL }, (_, i) => {
                const col = i % COLS;
                const row = Math.floor(i / COLS);
                return (
                  <div
                    key={i}
                    className="relative overflow-hidden"
                    style={{ willChange: "transform, opacity" }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: morphed
                          ? "rgba(15,10,30,0.3)"
                          : "rgba(255,255,255,0.08)",
                        borderRight:
                          col < COLS - 1
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                        borderBottom:
                          row < ROWS - 1
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                      }}
                    />
                  </div>
                );
              })
            : // No-children path: keep original oracle card fragment content.
              Array.from({ length: TOTAL }, (_, i) => {
                const col = i % COLS;
                const row = Math.floor(i / COLS);

                return (
                  <div
                    key={i}
                    className="relative overflow-hidden"
                    style={{ willChange: "transform, opacity" }}
                  >
                    {/* State A: Glass form content */}
                    <div
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{
                        opacity: morphed ? 0 : 1,
                        background: "rgba(255,255,255,0.1)",
                        borderRight:
                          col < COLS - 1
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                        borderBottom:
                          row < ROWS - 1
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                      }}
                    >
                      {/* Center fragment gets the sparkle */}
                      {col === 2 && row === 3 && (
                        <span className="absolute inset-0 flex items-center justify-center text-lg">
                          ✦
                        </span>
                      )}
                      {col === 2 && row === 4 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white/60 font-medium whitespace-nowrap">
                          Ask the
                        </span>
                      )}
                      {col === 3 && row === 4 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white/60 font-medium whitespace-nowrap">
                          Oracle
                        </span>
                      )}
                    </div>

                    {/* State B: Card image slice */}
                    <div
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{
                        opacity: morphed ? 1 : 0,
                        transitionDelay: morphed ? "0.5s" : "0s",
                        background: `linear-gradient(145deg, rgba(30,20,50,0.9), rgba(15,10,30,0.95))`,
                        borderRight:
                          col < COLS - 1
                            ? "1px solid rgba(201,169,78,0.2)"
                            : "none",
                        borderBottom:
                          row < ROWS - 1
                            ? "1px solid rgba(201,169,78,0.2)"
                            : "none",
                      }}
                    >
                      {/* Center fragments get card content */}
                      {col >= 1 && col <= 4 && row >= 2 && row <= 5 && (
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: "url(/mock/cards/the-oracle.png)",
                            backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                            backgroundPosition: `${(col - 1) * (100 / 3)}% ${(row - 2) * (100 / 3)}%`,
                            opacity: 0.9,
                          }}
                        />
                      )}
                      {/* Title fragment */}
                      {col === 2 && row === 6 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[#c9a94e] font-semibold tracking-wider whitespace-nowrap">
                          THE O
                        </span>
                      )}
                      {col === 3 && row === 6 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[#c9a94e] font-semibold tracking-wider whitespace-nowrap">
                          RACLE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
