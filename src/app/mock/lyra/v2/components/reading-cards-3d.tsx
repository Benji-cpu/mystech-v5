"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OracleCard3D } from "@/components/lab/oracle-card-3d";
import { getDeckById } from "@/app/mock/full/_shared/mock-data-v1";

// Cosmic Threads cards — accessed via deck lookup (module-level, runs once)
const cosmicThreadsDeck = getDeckById("cosmic-threads");
const cosmicThreadsCards = cosmicThreadsDeck?.cards ?? [];

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReadingCards3DProps {
  revealedCards: number[]; // which card indices (0-2) are flipped
  onRevealCard: (index: number) => void;
  visible: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CARD_POSITIONS: [number, number, number][] = [
  [-2, -0.5, 2], // left
  [0, -0.5, 3],  // center
  [2, -0.5, 2],  // right
];

// Stagger delays in seconds for scale-in animation
const STAGGER_DELAYS = [0, 0.3, 0.6];

// Use first 3 cosmic threads cards for the reading
const READING_CARDS = cosmicThreadsCards.slice(0, 3);

// ── Single card wrapper driven imperatively by useFrame ────────────────────────

interface CardWrapperProps {
  index: number;
  visible: boolean;
  staggerDelay: number;
  revealedCards: number[];
  onRevealCard: (index: number) => void;
}

function CardWrapper({
  index,
  visible,
  staggerDelay,
  revealedCards,
  onRevealCard,
}: CardWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);
  const timeRef = useRef(0);
  const visibilityStartRef = useRef<number | null>(null);
  const prevVisibleRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      visibilityStartRef.current = null;
    }
    prevVisibleRef.current = visible;
  }, [visible]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (!groupRef.current) return;

    if (!visible) {
      // Shrink to zero when not visible
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 0, delta * 6);
    } else {
      // Record visibility start for stagger
      if (visibilityStartRef.current === null) {
        visibilityStartRef.current = timeRef.current;
      }

      const elapsed = timeRef.current - visibilityStartRef.current;
      const targetScale = elapsed >= staggerDelay ? 0.6 : 0;
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, delta * 5);
    }

    groupRef.current.scale.setScalar(scaleRef.current);
  });

  const card = READING_CARDS[index];
  if (!card) return null;

  return (
    <group ref={groupRef}>
      <OracleCard3D
        title={card.title}
        position={CARD_POSITIONS[index]}
        holographic
        scale={0.6}
        imageUrl={card.imageUrl}
        meaning={card.meaning}
        guidance={card.guidance}
        onClick={() => {
          if (!revealedCards.includes(index)) {
            onRevealCard(index);
          }
        }}
      />
    </group>
  );
}

// ── ReadingCards3D ─────────────────────────────────────────────────────────────

export function ReadingCards3D({
  revealedCards,
  onRevealCard,
  visible,
}: ReadingCards3DProps) {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <CardWrapper
          key={i}
          index={i}
          visible={visible}
          staggerDelay={STAGGER_DELAYS[i]}
          revealedCards={revealedCards}
          onRevealCard={onRevealCard}
        />
      ))}
    </group>
  );
}

// Export reading card pool for convenience
export { cosmicThreadsCards as readingCardPool };
