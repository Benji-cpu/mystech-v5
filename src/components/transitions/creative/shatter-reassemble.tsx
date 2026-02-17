"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { DemoWrapper } from "../demo-wrapper";
import { TransitionStage } from "../transition-stage";

const COLS = 4;
const ROWS = 5;

export function ShatterReassemble() {
  return (
    <DemoWrapper
      title="Shatter & Reassemble"
      description="4x5 CSS grid shatters apart then reassembles into a card"
      library="Creative"
    >
      {(playing) => <ShatterContent playing={playing} />}
    </DemoWrapper>
  );
}

function ShatterContent({ playing }: { playing: boolean }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const pieces = gridRef.current.querySelectorAll(".shard");

    if (playing) {
      // First: shatter outward
      gsap.fromTo(
        pieces,
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
        },
        {
          x: () => (Math.random() - 0.5) * 200,
          y: () => (Math.random() - 0.5) * 200,
          rotation: () => (Math.random() - 0.5) * 360,
          scale: 0.5,
          opacity: 0.6,
          duration: 0.6,
          stagger: { each: 0.02, from: "center" },
          ease: "power2.out",
        }
      );

      // Then: reassemble
      gsap.to(pieces, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 0.8,
        delay: 1.2,
        stagger: { each: 0.03, from: "edges" },
        ease: "back.out(1.4)",
      });
    } else {
      gsap.set(pieces, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
    }
  }, [playing]);

  const pieceW = 120 / COLS;
  const pieceH = 180 / ROWS;

  return (
    <TransitionStage>
      <div
        ref={gridRef}
        className="relative"
        style={{
          width: 120,
          height: 180,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          borderRadius: 8,
          overflow: "visible",
        }}
      >
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const hue = 270 + (row * 10 + col * 5);
          return (
            <div
              key={i}
              className="shard border border-[#c9a94e]/20"
              style={{
                width: pieceW,
                height: pieceH,
                background: `hsl(${hue}, 60%, ${10 + row * 3}%)`,
              }}
            />
          );
        })}
      </div>
    </TransitionStage>
  );
}
