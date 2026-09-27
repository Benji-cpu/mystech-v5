"use client";

import { useSyncExternalStore } from "react";

interface ResponsiveCardSize {
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  isTablet: boolean;
}

function subscribeToResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}
const getViewportWidth = () => window.innerWidth;
const getServerViewportWidth = () => 1024;

export function useResponsiveCardSize(
  cardCount: number,
  compact: boolean = false
): ResponsiveCardSize {
  // The server renders at 1024 and the client re-renders at its real width.
  // Reading window.innerWidth in a useState initialiser made the first client
  // render disagree with the server's; React keeps the server's inline sizes on
  // a hydration mismatch, so a shared reading on a phone laid three
  // desktop-sized cards across a 390px screen.
  const viewportWidth = useSyncExternalStore(subscribeToResize, getViewportWidth, getServerViewportWidth);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  let cardWidth: number;
  let gap: number;

  if (compact) {
    // Presenting-phase sizes — cards are the visual anchor, keep them prominent
    if (cardCount <= 1) {
      cardWidth = isMobile ? 130 : isTablet ? 160 : 180;
    } else if (cardCount <= 3) {
      cardWidth = isMobile ? 90 : isTablet ? 120 : 140;
    } else if (cardCount <= 5) {
      cardWidth = isMobile ? 70 : isTablet ? 100 : 120;
    } else {
      cardWidth = isMobile ? 50 : isTablet ? 70 : 90;
    }
    gap = isMobile ? 12 : 16;
  } else {
    // Full sizes for spread layout during drawing/revealing
    if (cardCount <= 1) {
      cardWidth = isMobile ? 160 : isTablet ? 200 : 220;
      gap = 0;
    } else if (cardCount <= 3) {
      cardWidth = isMobile ? 100 : isTablet ? 140 : 160;
      gap = isMobile ? 12 : 20;
    } else if (cardCount <= 5) {
      cardWidth = isMobile ? 80 : isTablet ? 120 : 140;
      gap = isMobile ? 10 : 16;
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
