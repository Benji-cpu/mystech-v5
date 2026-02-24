"use client";

import { useMemo } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { V2State, V2Action } from "./lyra-v2-state";
import {
  ZODIAC_SIGNS_3D,
  LYRA_STARS_3D,
  LYRA_CONNECTIONS_3D,
  getZodiacById,
  getZodiacCentroid3D,
} from "./zodiac-spheres";
import {
  ELEMENT_COLORS_3D,
  THEME_COLORS_3D,
  THEME_ORDER,
  type ThemeType,
} from "./lyra-v2-theme";

import { StarField3D } from "./components/star-field-3d";
import { ZodiacCluster3D } from "./components/zodiac-cluster-3d";
import { ThemeStar3D } from "./components/theme-star-3d";
import { ConstellationLines3D } from "./components/constellation-lines-3d";
import { CameraAnimator } from "./components/camera-animator";
import { TouchControls } from "./components/touch-controls";
import { ReadingCards3D } from "./components/reading-cards-3d";
import { GoldenThread3D } from "./components/golden-thread-3d";

// ── Props ──────────────────────────────────────────────────────────────────────

interface ConstellationSceneProps {
  state: V2State;
  dispatch: React.Dispatch<V2Action>;
}

// ── Theme star positions ─────────────────────────────────────────────────────
// Generate 8 positions around the selected zodiac's centroid

function getThemeStarPositions(
  zodiacId: string | null
): [number, number, number][] {
  if (!zodiacId) return THEME_ORDER.map(() => [0, 0, 0] as [number, number, number]);

  const sign = getZodiacById(zodiacId);
  if (!sign) return THEME_ORDER.map(() => [0, 0, 0] as [number, number, number]);

  const centroid = getZodiacCentroid3D(sign);
  const [cx, cy, cz] = centroid;

  // Distribute 8 stars in a ring around the centroid
  const radius = 1.0;
  return THEME_ORDER.map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    // Ring in the plane roughly perpendicular to the centroid direction
    // Use a simple offset in xz plane relative to centroid
    return [
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius * 0.6,
      cz + Math.sin(angle) * radius * 0.4,
    ] as [number, number, number];
  });
}

// ── Reading star positions ────────────────────────────────────────────────────
// Pick 3 stars from the selected zodiac as reading anchor positions

function getReadingStarPositions(
  zodiacId: string | null
): [number, number, number][] {
  if (!zodiacId) return [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

  const sign = getZodiacById(zodiacId);
  if (!sign) return [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

  // Pick first 3 stars (or primary + 2)
  const stars = sign.stars.slice(0, 3);
  return stars.map((s) => [s.x, s.y, s.z] as [number, number, number]);
}

// Card positions in the reading phase
const CARD_POSITIONS: [number, number, number][] = [
  [-2, -0.5, 2],
  [0, -0.5, 3],
  [2, -0.5, 2],
];

// ── Scene Component ──────────────────────────────────────────────────────────

export function ConstellationScene({ state, dispatch }: ConstellationSceneProps) {
  const { phase, selectedZodiac, ignitedThemes, revealedCards } = state;

  // Compute theme star positions based on selected zodiac
  const themeStarPositions = useMemo(
    () => getThemeStarPositions(selectedZodiac),
    [selectedZodiac]
  );

  // Compute reading star positions
  const readingStarPositions = useMemo(
    () => getReadingStarPositions(selectedZodiac),
    [selectedZodiac]
  );

  // Determine cluster state for each zodiac
  const getClusterState = (signId: string) => {
    if (phase === "choose_sky") {
      if (selectedZodiac === signId) return "highlighted" as const;
      return "dormant" as const;
    }
    if (selectedZodiac === signId) return "selected" as const;
    // In later phases, non-selected zodiacs are hidden
    return "hidden" as const;
  };

  // Theme star line progress (how many lines drawn)
  const themeLineProgress = ignitedThemes.length / 8;

  // Should auto-rotate in choose_sky phase when no zodiac is selected
  const shouldAutoRotate = phase === "choose_sky" && !selectedZodiac;

  // Show Lyra constellation only in choose_sky
  const showLyra = phase === "choose_sky" || phase === "explore_stars";

  // Show reading cards in star_reading phase
  const showReadingCards = phase === "star_reading";

  // Bloom intensity varies by phase — kept subtle to avoid blob effect
  const bloomIntensity = phase === "star_reading" ? 1.2 : 0.8;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.3} color="#c4ceff" />

      {/* Depth fog for atmospheric fade */}
      <fog attach="fog" args={["#050010", 15, 35]} />

      {/* Camera animation — driven by state */}
      <CameraAnimator
        position={state.cameraTarget.position}
        target={state.cameraTarget.target}
        fov={state.cameraTarget.fov}
        speed={1.8}
      />

      {/* Touch orbit controls */}
      <TouchControls
        enabled={phase === "choose_sky" || phase === "forge_constellation"}
        autoRotate={shouldAutoRotate || phase === "forge_constellation"}
        autoRotateSpeed={phase === "forge_constellation" ? 0.5 : 0.3}
      />

      {/* Background star field */}
      <StarField3D />

      {/* Lyra constellation — decorative, always gold */}
      {showLyra && (
        <ConstellationLines3D
          stars={LYRA_STARS_3D}
          connections={LYRA_CONNECTIONS_3D}
          color="#c9a94e"
          progress={1}
          glowing
        />
      )}
      {showLyra &&
        LYRA_STARS_3D.map((star, i) => (
          <mesh key={`lyra-${i}`} position={[star.x, star.y, star.z]}>
            <sphereGeometry args={[star.brightness * 0.03 + 0.015, 12, 12]} />
            <meshStandardMaterial
              color="#c9a94e"
              emissive="#c9a94e"
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}

      {/* 12 Zodiac constellation clusters */}
      {ZODIAC_SIGNS_3D.map((sign) => (
        <ZodiacCluster3D
          key={sign.id}
          sign={sign}
          state={getClusterState(sign.id)}
          elementColor={ELEMENT_COLORS_3D[sign.element].primary}
          onClick={() => {
            if (phase === "choose_sky") {
              dispatch({
                type: "SELECT_ZODIAC",
                zodiacId: sign.id,
                cameraPosition: sign.cameraPosition,
                cameraTarget: sign.cameraTarget,
              });
            }
          }}
        />
      ))}

      {/* Theme stars — visible in explore_stars and later */}
      {(phase === "explore_stars" || phase === "forge_constellation" || phase === "star_reading") &&
        THEME_ORDER.map((themeId, i) => (
          <ThemeStar3D
            key={themeId}
            position={themeStarPositions[i]}
            color={THEME_COLORS_3D[themeId as ThemeType].primary}
            isIgnited={ignitedThemes.includes(themeId)}
            index={i}
            onClick={() => {
              if (phase === "explore_stars") {
                dispatch({ type: "IGNITE_THEME", themeId });
              }
            }}
          />
        ))}

      {/* Theme constellation lines — draw on as themes ignite */}
      {(phase === "explore_stars" || phase === "forge_constellation" || phase === "star_reading") && (
        <ConstellationLines3D
          stars={themeStarPositions.map(([x, y, z]) => ({ x, y, z, brightness: 1 }))}
          connections={[
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
          ]}
          color="#c9a94e"
          progress={themeLineProgress}
          glowing={phase === "forge_constellation" || phase === "star_reading"}
        />
      )}

      {/* Reading cards in 3D space */}
      <ReadingCards3D
        revealedCards={revealedCards}
        onRevealCard={(index) => dispatch({ type: "REVEAL_CARD", index })}
        visible={showReadingCards}
      />

      {/* Golden threads from reading stars to cards */}
      {showReadingCards &&
        revealedCards.map((cardIdx) => (
          <GoldenThread3D
            key={`thread-${cardIdx}`}
            from={readingStarPositions[cardIdx] || [0, 0, 0]}
            to={CARD_POSITIONS[cardIdx]}
            visible={true}
            delay={0.3}
          />
        ))}

      {/* Post-processing — bloom + vignette */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={1.2}
          luminanceSmoothing={0.3}
          intensity={bloomIntensity}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </>
  );
}
