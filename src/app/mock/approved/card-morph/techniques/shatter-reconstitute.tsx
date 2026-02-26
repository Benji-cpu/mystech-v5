"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import type { TechniqueProps } from "../types";

/**
 * Technique: Shatter & Reconstitute
 * 6x8 grid shatters outward with random rotation, then fragments reconverge.
 *
 * stageTransition: scatter fragments → call onMidpoint → reconverge
 * morphed toggle: same scatter/reconverge cycle
 */

const COLS = 6;
const ROWS = 8;
const TOTAL = COLS * ROWS;

export function ShatterReconstitute({
  morphed,
  onMorphComplete,
  stageTransition,
  children,
}: TechniqueProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline>(undefined);
  const prevStageKeyRef = useRef<string | null>(null);

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

  // Handle stageTransition
  useEffect(() => {
    if (!stageTransition) {
      prevStageKeyRef.current = null;
      return;
    }
    if (stageTransition.key === prevStageKeyRef.current) return;
    prevStageKeyRef.current = stageTransition.key;

    if (!gridRef.current) return;
    if (tlRef.current) tlRef.current.kill();

    const fragments = Array.from(gridRef.current.children);
    const tl = gsap.timeline({
      onComplete: () => onMorphComplete?.(),
    });
    tlRef.current = tl;

    tl.to(fragments, {
      x: (i: number) => scatterData[i].x,
      y: (i: number) => scatterData[i].y,
      rotation: (i: number) => scatterData[i].rotation,
      scale: 0.5,
      duration: 0.45,
      ease: "power2.out",
      stagger: { each: 0.008, from: "center" },
    })
    .call(() => {
      stageTransition.onMidpoint();
    })
    .to(fragments, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.55,
      ease: "back.out(1.2)",
      stagger: { each: 0.008, from: "edges" },
    });

    return () => { tl.kill(); };
  }, [stageTransition?.key]);

  // Handle morphed toggle
  useEffect(() => {
    if (stageTransition) return;

    if (!gridRef.current) return;
    if (tlRef.current) tlRef.current.kill();

    const fragments = Array.from(gridRef.current.children);
    const tl = gsap.timeline({
      onComplete: () => onMorphComplete?.(),
    });
    tlRef.current = tl;

    tl.to(fragments, {
      x: (i: number) => scatterData[i].x,
      y: (i: number) => scatterData[i].y,
      rotation: (i: number) => scatterData[i].rotation,
      scale: 0.5,
      duration: 0.5,
      ease: "power2.out",
      stagger: { each: 0.01, from: "center" },
    })
    .to(fragments, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.2)",
      stagger: { each: 0.01, from: "edges" },
    });

    return () => { tl.kill(); };
  }, [morphed]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-4/5 max-w-[280px] h-[85%] relative overflow-visible">
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
          {Array.from({ length: TOTAL }, (_, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            return (
              <div
                key={i}
                className="relative overflow-hidden"
                style={{ willChange: "transform" }}
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
          })}
        </div>
      </div>
    </div>
  );
}
