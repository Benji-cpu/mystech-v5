"use client";

import { useRef, useEffect, useCallback } from "react";
import { DemoWrapper } from "../demo-wrapper";
import { TransitionStage } from "../transition-stage";

export function LightningReveal() {
  return (
    <DemoWrapper
      title="Lightning Reveal"
      description="SVG branching lightning traces the card outline with glow"
      library="Creative"
    >
      {(playing) => <LightningContent playing={playing} />}
    </DemoWrapper>
  );
}

function LightningContent({ playing }: { playing: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);

  const generateLightningPath = useCallback(
    (x1: number, y1: number, x2: number, y2: number, detail: number): string => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (detail <= 0 || len < 5) {
        return `L${x2},${y2}`;
      }

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * len * 0.3;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * len * 0.3;

      return (
        generateLightningPath(x1, y1, midX, midY, detail - 1) +
        generateLightningPath(midX, midY, x2, y2, detail - 1)
      );
    },
    []
  );

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    if (!playing) {
      svg.innerHTML = "";
      return;
    }

    const w = 200;
    const h = 200;
    const cardW = 100;
    const cardH = 150;
    const cx = (w - cardW) / 2;
    const cy = (h - cardH) / 2;

    // Card outline points
    const points = [
      [cx, cy],
      [cx + cardW, cy],
      [cx + cardW, cy + cardH],
      [cx, cy + cardH],
      [cx, cy],
    ];

    let segIndex = 0;
    let progress = 0;

    const drawSegment = () => {
      if (segIndex >= points.length - 1) return;

      const [x1, y1] = points[segIndex];
      const [x2, y2] = points[segIndex + 1];

      // Interpolate current progress
      const currentX = x1 + (x2 - x1) * progress;
      const currentY = y1 + (y2 - y1) * progress;

      const pathData = `M${x1},${y1}` + generateLightningPath(x1, y1, currentX, currentY, 3);

      // Clear and redraw
      svg.innerHTML = "";

      // Glow layer
      const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      glowPath.setAttribute("d", pathData);
      glowPath.setAttribute("fill", "none");
      glowPath.setAttribute("stroke", "rgba(201,169,78,0.3)");
      glowPath.setAttribute("stroke-width", "6");
      glowPath.setAttribute("filter", "blur(4px)");
      svg.appendChild(glowPath);

      // Main bolt
      const mainPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      mainPath.setAttribute("d", pathData);
      mainPath.setAttribute("fill", "none");
      mainPath.setAttribute("stroke", "var(--gold)");
      mainPath.setAttribute("stroke-width", "2");
      svg.appendChild(mainPath);

      // Core bright
      const corePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      corePath.setAttribute("d", pathData);
      corePath.setAttribute("fill", "none");
      corePath.setAttribute("stroke", "rgba(255,255,220,0.8)");
      corePath.setAttribute("stroke-width", "1");
      svg.appendChild(corePath);

      progress += 0.08;
      if (progress >= 1) {
        progress = 0;
        segIndex++;
      }

      if (segIndex < points.length - 1) {
        animRef.current = requestAnimationFrame(drawSegment);
      }
    };

    drawSegment();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, generateLightningPath]);

  return (
    <TransitionStage>
      <svg ref={svgRef} viewBox="0 0 200 200" className="w-[200px] h-[200px]" />
    </TransitionStage>
  );
}
