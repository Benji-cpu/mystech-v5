"use client";

import { useState, useEffect } from "react";

interface ResponsiveCardSize {
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  isTablet: boolean;
}

export function useResponsiveCardSize(
  cardCount: number,
  compact: boolean = false
): ResponsiveCardSize {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  let cardWidth: number;
  let gap: number;

  if (compact) {
    // Smaller sizes for interpretation phase (cards stay in spread but scaled down)
    if (cardCount <= 1) {
      cardWidth = isMobile ? 80 : isTablet ? 100 : 120;
    } else if (cardCount <= 3) {
      cardWidth = isMobile ? 56 : isTablet ? 76 : 90;
    } else if (cardCount <= 5) {
      cardWidth = isMobile ? 44 : isTablet ? 64 : 76;
    } else {
      cardWidth = isMobile ? 32 : isTablet ? 44 : 56;
    }
    gap = isMobile ? 4 : 6;
  } else {
    // Full sizes for spread layout during drawing/revealing
    if (cardCount <= 1) {
      cardWidth = isMobile ? 160 : isTablet ? 200 : 220;
      gap = 0;
    } else if (cardCount <= 3) {
      cardWidth = isMobile ? 100 : isTablet ? 140 : 160;
      gap = isMobile ? 8 : 16;
    } else if (cardCount <= 5) {
      cardWidth = isMobile ? 80 : isTablet ? 120 : 140;
      gap = isMobile ? 6 : 12;
    } else {
      cardWidth = isMobile ? 60 : isTablet ? 80 : 100;
      gap = isMobile ? 4 : 8;
    }
  }

  const cardHeight = Math.round(cardWidth * 1.5);

  return { cardWidth, cardHeight, gap, isMobile, isTablet };
}

export function getRevealTiming(cardCount: number) {
  const revealDuration = Math.max(600, 1000 - cardCount * 40);
  const delayBetween = Math.max(300, 500 - cardCount * 20);
  return { revealDuration, delayBetween };
}
