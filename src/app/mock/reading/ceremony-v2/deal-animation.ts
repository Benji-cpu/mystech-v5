"use client";

import gsap from "gsap";

/**
 * Creates a GSAP timeline that animates cards with class `.deal-card`
 * from a stacked center position out to their spread positions in an arc.
 *
 * @param containerEl - The container element holding the .deal-card elements
 * @param cardCount   - Number of cards to deal
 * @param onComplete  - Called when the deal animation finishes
 * @returns The GSAP timeline (can be paused/killed externally)
 */
export function createDealTimeline(
  containerEl: HTMLElement,
  cardCount: number,
  onComplete: () => void
): gsap.core.Timeline {
  const cards = containerEl.querySelectorAll<HTMLElement>(".deal-card");
  const isMobile = containerEl.offsetWidth < 640;

  // Responsive radius: desktop 120px, mobile 72px (60%)
  const baseRadius = 120;
  const radius = isMobile ? baseRadius * 0.6 : baseRadius;

  // Angle span based on card count
  // 1 card: no spread needed; 3 cards: ±30°; 5 cards: ±45°; 10 cards: ±60°
  const angleSpanMap: Record<number, number> = {
    1: 0,
    3: 60,
    5: 90,
    10: 120,
  };
  const totalSpan = angleSpanMap[cardCount] ?? Math.min(cardCount * 18, 120);

  // Set all cards to stacked start state
  gsap.set(cards, {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 0.85,
    opacity: 0,
    transformOrigin: "center center",
  });

  const tl = gsap.timeline({ onComplete });

  // Brief moment stacked and visible before dealing
  tl.to(cards, {
    opacity: 1,
    scale: 0.9,
    duration: 0.3,
    ease: "power2.out",
    stagger: 0.04,
  });

  // Label marks the start of the deal spread phase
  tl.addLabel("deal");

  // Deal each card to its arc position
  cards.forEach((card, i) => {
    let angle: number;

    if (cardCount === 1) {
      angle = 0;
    } else {
      // Spread evenly from -halfSpan to +halfSpan
      const halfSpan = totalSpan / 2;
      angle = -halfSpan + (totalSpan / (cardCount - 1)) * i;
    }

    const rad = (angle * Math.PI) / 180;
    const targetX = Math.sin(rad) * radius;
    // Arc upward from center: cards go up then settle
    const targetY = -Math.cos(rad) * radius * 0.35 + (isMobile ? 10 : 20);
    const targetRotation = angle * 0.4; // Slight rotation matching the arc angle

    tl.to(
      card,
      {
        x: targetX,
        y: targetY,
        rotation: targetRotation,
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.2)",
      },
      // Stagger: each card starts 0.12s after previous
      `deal+=${i * 0.12}`
    );
  });

  return tl;
}

/**
 * Kills any active tweens on .deal-card elements inside the container,
 * resetting them to their default state. Call on cleanup.
 */
export function killDealTimeline(containerEl: HTMLElement): void {
  const cards = containerEl.querySelectorAll<HTMLElement>(".deal-card");
  gsap.killTweensOf(cards);
  gsap.set(cards, {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 0.85,
    opacity: 0,
    clearProps: "transform,opacity,scale",
  });
}
