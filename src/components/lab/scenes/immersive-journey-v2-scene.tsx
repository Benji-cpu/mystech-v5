"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles, Float, Text, Points, PointMaterial, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useControls, folder } from "leva";
import * as THREE from "three";
import { LabCanvas } from "../lab-canvas";
import { OracleCard3D } from "../oracle-card-3d";
import { NebulaMaterial } from "../shaders/nebula";

// ─── Origin Card Constants ──────────────────────────────────────────────────
const CARD_THICKNESS = 0.06;
const FACE_Z = 0.031;
const BORDER_Z = 0.035;
import { RevealMaterial } from "../shaders/reveal";

// ─── Types ──────────────────────────────────────────────────────────────────

type JourneyPhase = "intro" | "selection" | "input" | "forging" | "presentation";
type ForgingSubPhase = "dealing" | "revealing" | "completion";

// ─── Card Count Options ─────────────────────────────────────────────────────

interface CardCountOption {
  count: number | null; // null = custom
  label: string;
  description: string;
  nudge?: string;
}

const CARD_COUNT_OPTIONS: CardCountOption[] = [
  { count: 3, label: "Quick Draw", description: "Perfect for a focused question. Three cards, three insights." },
  { count: 7, label: "Spirit Spread", description: "A deeper exploration — seven cards to illuminate your path." },
  { count: 12, label: "Full Circle", description: "Twelve cards for a complete picture of where you stand." },
  { count: 22, label: "Major Arcana", description: "The 22 archetypes of the tarot\u2019s Major Arcana — the full hero\u2019s journey." },
  { count: 44, label: "Oracle Deck", description: "A mid-size oracle deck. Consider using the guided journey for richer results.", nudge: "For decks this large, the full journey experience helps you flesh out each card\u2019s meaning." },
  { count: 78, label: "Full Tarot", description: "The complete tarot — 78 cards is ambitious. The guided journey is recommended for decks this size.", nudge: "For decks this large, the full journey experience helps you flesh out each card\u2019s meaning." },
  { count: null, label: "Your Choice", description: "Pick any number from 1\u201378. 3\u201312 works great for a simple prompt. Larger decks benefit from the guided journey." },
];

// ─── Html Container Constants ───────────────────────────────────────────────
const HTML_WIDTH = 190;
const HTML_HEIGHT = 280;

const htmlContainerStyle: React.CSSProperties = {
  width: HTML_WIDTH,
  height: HTML_HEIGHT,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

// ─── Sample Data (78 cards) ─────────────────────────────────────────────────

const ARCHETYPE_TITLES = [
  "The Dreamer", "The Alchemist", "The Wanderer", "The Mirror", "The Flame",
  "The Guardian", "The Vessel", "The Star", "The Threshold", "The Return",
  "The Weaver", "The Shadow", "The Oracle", "The Hermit", "The Lovers",
  "The Tower", "The Moon", "The Sun", "The World", "The Fool",
  "The High Priestess", "The Magician",
  // Extended archetypes
  "The Empress", "The Emperor", "The Hierophant", "The Chariot",
  "Strength", "The Wheel", "Justice", "The Hanged One",
  "Death", "Temperance", "The Devil", "Judgement",
  "The Sage", "The Child", "The Healer", "The Warrior",
  "The Trickster", "The Muse", "The Anchor", "The Phoenix",
  "The Labyrinth", "The Bridge", "The Crown", "The Root",
  "The Tide", "The Ember", "The Frost", "The Dawn",
  "The Dusk", "The Echo", "The Veil", "The Key",
  "The Lantern", "The Compass", "The Storm", "The Garden",
  "The Serpent", "The Dove", "The Wolf", "The Owl",
  "The Fox", "The Raven", "The Stag", "The Moth",
  "The Pearl", "The Thorn", "The Feather", "The Bone",
  "The Chalice", "The Blade", "The Shield", "The Horn",
  "The Loom", "The Mask", "The Ring", "The Scroll",
];

const MEANINGS = [
  "Trust the unseen path before you",
  "Transform what weighs you down",
  "The journey itself holds the answer",
  "See yourself as you truly are",
  "Your passion is trying to tell you something",
  "Protection surrounds you now",
  "You are ready to receive",
  "Hope is not naive — it is power",
  "A new chapter is beginning",
  "Come home to yourself",
];

const GUIDANCES = [
  "Your intuition speaks louder than logic right now. Let the quiet voice within guide your next step.",
  "The challenges you face are raw material for growth. What feels heavy now is becoming gold.",
  "Stop searching for a destination. The path you walk is teaching you everything you need to know.",
  "What you admire in others already lives within you. What you resist reveals where you need to grow.",
  "The fire inside you is not random. Follow what makes you feel most alive.",
  "You are held by forces greater than yourself. Trust that you are safe to take the next leap.",
  "Empty yourself of expectations. What comes next will fill you in ways you cannot yet imagine.",
  "Even in darkness, you carry light. Let it shine without apology.",
  "You stand at the door between who you were and who you are becoming. Step through.",
  "After all your seeking, the answer was always here. Rest in what you already know to be true.",
];

const SAMPLE_CARDS = ARCHETYPE_TITLES.map((title, i) => ({
  title,
  meaning: MEANINGS[i % MEANINGS.length],
  guidance: GUIDANCES[i % GUIDANCES.length],
  imageUrl: `https://picsum.photos/seed/${title.toLowerCase().replace(/\s+/g, "-")}/400/600`,
}));

// ─── Grid Layout System ─────────────────────────────────────────────────────

interface GridConfig {
  cols: number;
  rows: number;
  gap: number; // fraction of card dimension
}

function getGridConfig(count: number, isMobile: boolean): GridConfig {
  if (count <= 3) return { cols: isMobile ? 1 : 3, rows: isMobile ? 3 : 1, gap: 0.15 };
  if (count <= 7) return { cols: isMobile ? 2 : 4, rows: isMobile ? 4 : 2, gap: 0.12 };
  if (count <= 9) return { cols: 3, rows: 3, gap: 0.10 };
  return { cols: isMobile ? 3 : 4, rows: isMobile ? 4 : 3, gap: 0.08 };
}

function getGridPositions(
  visibleCount: number,
  isMobile: boolean,
  scale: number,
): { x: number; y: number; rotZ: number }[] {
  const config = getGridConfig(visibleCount, isMobile);
  const cardW = 2 * scale;
  const cardH = 3 * scale;
  const gapX = cardW * config.gap;
  const gapY = cardH * config.gap;
  const cellW = cardW + gapX;
  const cellH = cardH + gapY;

  const rows = Math.ceil(visibleCount / config.cols);
  const positions: { x: number; y: number; rotZ: number }[] = [];

  for (let i = 0; i < visibleCount; i++) {
    const row = Math.floor(i / config.cols);
    const colsInRow = row === rows - 1 ? ((visibleCount - 1) % config.cols) + 1 : config.cols;
    const colIndex = i % config.cols;

    const x = (colIndex - (colsInRow - 1) / 2) * cellW;
    const y = ((rows - 1) / 2 - row) * cellH;

    positions.push({ x, y, rotZ: 0 });
  }

  return positions;
}

function getAdaptiveScale(
  visibleCount: number,
  isMobile: boolean,
  viewportW: number,
  viewportH: number,
): number {
  const config = getGridConfig(visibleCount, isMobile);
  const rows = Math.ceil(visibleCount / config.cols);
  const cardW = 2;
  const cardH = 3;

  // How much space the grid needs at scale=1
  const gridW = config.cols * cardW + (config.cols - 1) * cardW * config.gap;
  const gridH = rows * cardH + (rows - 1) * cardH * config.gap;

  const scaleW = (viewportW * 0.90) / gridW;
  const scaleH = (viewportH * 0.80) / gridH;

  return Math.min(scaleW, scaleH, 1.0);
}

function getGridCameraZ(
  visibleCount: number,
  isMobile: boolean,
  scale: number,
  aspect: number,
): number {
  const config = getGridConfig(visibleCount, isMobile);
  const rows = Math.ceil(visibleCount / config.cols);
  const cardW = 2 * scale;
  const cardH = 3 * scale;
  const gridW = config.cols * cardW + (config.cols - 1) * cardW * config.gap;
  const gridH = rows * cardH + (rows - 1) * cardH * config.gap;

  // Use FOV 50 from LabCanvas
  const fovRad = (50 * Math.PI) / 180;
  const halfFovY = fovRad / 2;
  const zFromH = (gridH / 2 + 0.5) / Math.tan(halfFovY);
  const halfFovX = Math.atan(Math.tan(halfFovY) * aspect);
  const zFromW = (gridW / 2 + 0.5) / Math.tan(halfFovX);

  return Math.max(zFromH, zFromW, 5);
}

// ─── JourneyCard ────────────────────────────────────────────────────────────

function JourneyCard({
  index,
  cardData,
  phase,
  forgingSubPhase,
  gridPosition,
  gridScale,
  staggerDelay,
  revealMode,
  glowIntensity,
  animateEntrance,
  isCenterCard,
}: {
  index: number;
  cardData: (typeof SAMPLE_CARDS)[0];
  phase: JourneyPhase;
  forgingSubPhase: ForgingSubPhase | null;
  gridPosition: { x: number; y: number; rotZ: number };
  gridScale: number;
  staggerDelay: number;
  revealMode: 0 | 1 | 2;
  glowIntensity: number;
  animateEntrance: boolean;
  isCenterCard?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const scaleRef = useRef(0);
  const overlayProgressRef = useRef(1); // 1 = fully opaque overlay
  const revealMeshRef = useRef<THREE.Mesh>(null);
  const dealStarted = useRef(false);
  const dealTime = useRef(0);
  const revealStarted = useRef(false);
  const revealTime = useRef(0);
  const entranceStarted = useRef(false);
  const entranceTime = useRef(0);

  const dealGlobalDelay = phase === "forging" ? 0.8 : 0;
  const cardDelay = dealGlobalDelay + index * staggerDelay;
  const width = 2 * gridScale;
  const height = 3 * gridScale;

  // Reset when phase changes
  useEffect(() => {
    if (phase === "forging") {
      dealStarted.current = false;
      dealTime.current = 0;
      revealStarted.current = false;
      revealTime.current = 0;
      scaleRef.current = isCenterCard ? 1 : 0;
      overlayProgressRef.current = 1;
      posRef.current.set(isCenterCard ? gridPosition.x : 0, isCenterCard ? gridPosition.y : 0, 0);
    }
  }, [phase, isCenterCard, gridPosition.x, gridPosition.y]);

  // Reset entrance animation state when animateEntrance changes
  useEffect(() => {
    if (phase === "presentation" && animateEntrance) {
      entranceStarted.current = false;
      entranceTime.current = 0;
      scaleRef.current = 0;
    }
  }, [phase, animateEntrance, gridPosition.x, gridPosition.y]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (phase === "forging") {
      if (forgingSubPhase === "dealing") {
        if (isCenterCard) {
          // Center card is already in place (origin card moved here)
          scaleRef.current = 1;
          posRef.current.set(gridPosition.x, gridPosition.y, 0);
        } else {
          if (!dealStarted.current) {
            dealTime.current += delta;
            if (dealTime.current >= cardDelay) {
              dealStarted.current = true;
              dealTime.current = 0;
            }
          }
          if (dealStarted.current) {
            dealTime.current += delta;
            // Ease-out cubic over 0.6s
            const t = Math.min(dealTime.current / 0.6, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            scaleRef.current = ease;
            posRef.current.x = THREE.MathUtils.lerp(0, gridPosition.x, ease);
            posRef.current.y = THREE.MathUtils.lerp(0, gridPosition.y, ease);
          }
        }
        overlayProgressRef.current = 1;
      } else if (forgingSubPhase === "revealing") {
        scaleRef.current = 1;
        posRef.current.set(gridPosition.x, gridPosition.y, 0);

        if (!revealStarted.current) {
          revealTime.current += delta;
          if (revealTime.current >= cardDelay * 0.5) {
            revealStarted.current = true;
            revealTime.current = 0;
          }
        }
        if (revealStarted.current) {
          revealTime.current += delta;
          // Animate overlay from 1 → 0 over ~1.2s
          overlayProgressRef.current = Math.max(0, 1 - revealTime.current * 0.8);
        }
      } else if (forgingSubPhase === "completion") {
        scaleRef.current = 1;
        posRef.current.set(gridPosition.x, gridPosition.y, 0);
        // Guard: stop unnecessary re-animation at zero
        if (overlayProgressRef.current > 0.01) {
          overlayProgressRef.current = Math.max(0, overlayProgressRef.current - delta * 2);
        }
      }
    } else if (phase === "presentation") {
      if (animateEntrance) {
        // Quick entrance animation for newly visited pages
        if (!entranceStarted.current) {
          entranceTime.current += delta;
          if (entranceTime.current >= cardDelay * 0.4) {
            entranceStarted.current = true;
            entranceTime.current = 0;
          }
        }
        if (entranceStarted.current) {
          entranceTime.current += delta;
          const t = Math.min(entranceTime.current / 0.4, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          scaleRef.current = ease;
        }
      } else {
        scaleRef.current = 1;
      }
      // Smoothly lerp to grid position
      posRef.current.x = THREE.MathUtils.lerp(posRef.current.x, gridPosition.x, delta * 4);
      posRef.current.y = THREE.MathUtils.lerp(posRef.current.y, gridPosition.y, delta * 4);
      overlayProgressRef.current = 0;
    } else {
      scaleRef.current = 0;
      overlayProgressRef.current = 1;
    }

    groupRef.current.position.copy(posRef.current);
    groupRef.current.scale.setScalar(Math.max(0.001, scaleRef.current));

    // Show/hide overlay mesh
    if (revealMeshRef.current) {
      revealMeshRef.current.visible = overlayProgressRef.current > 0.01;
    }
  });

  return (
    <group ref={groupRef} scale={0.001}>
      {/* OracleCard3D underneath — always rendered */}
      <OracleCard3D
        title={cardData.title}
        holographic
        holoIntensity={0.5}
        holoSpeed={0.8}
        tiltSensitivity={phase === "presentation" ? 8 : 0}
        scale={gridScale}
        imageUrl={cardData.imageUrl}
        meaning={cardData.meaning}
        guidance={cardData.guidance}
        holoOverlayOpacity={0.25}
      />
      {/* RevealMaterial overlay on top of front face */}
      <mesh ref={revealMeshRef} position={[0, 0, 0.05]}>
        <planeGeometry args={[width, height]} />
        <RevealMaterial
          progress={overlayProgressRef.current}
          mode={revealMode}
          glowIntensity={glowIntensity}
        />
      </mesh>
    </group>
  );
}

// ─── Origin Card Content Components ─────────────────────────────────────────

function OriginIntroContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: HTML_WIDTH, height: HTML_HEIGHT, gap: 10, padding: "0 16px" }}>
      <div style={{ color: "#c9a94e", fontSize: 20, fontWeight: 700, letterSpacing: "0.05em", textAlign: "center", lineHeight: 1.2 }}>
        Create Your Deck
      </div>
      <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,169,78,0.6), transparent)" }} />
      <div style={{ color: "#c9a94e", fontSize: 28, opacity: 0.5 }}>✦</div>
    </div>
  );
}

function OriginSelectionContent({
  onSelect,
}: {
  onSelect: (count: number) => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const activeOption = selectedIndex !== null
    ? CARD_COUNT_OPTIONS[selectedIndex]
    : hoveredIndex !== null
      ? CARD_COUNT_OPTIONS[hoveredIndex]
      : null;

  const handleCustomSubmit = () => {
    const num = parseInt(customValue, 10);
    if (num >= 1 && num <= 78) {
      onSelect(num);
    }
  };

  const selectedCount = selectedIndex !== null ? CARD_COUNT_OPTIONS[selectedIndex].count : null;

  const presetOptions = CARD_COUNT_OPTIONS.filter((opt) => opt.count !== null);
  const customOption = CARD_COUNT_OPTIONS.find((opt) => opt.count === null)!;
  const customOptionIndex = CARD_COUNT_OPTIONS.indexOf(customOption);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: HTML_WIDTH, height: HTML_HEIGHT, gap: 10, overflow: "hidden" }}>
      <div style={{ color: "rgba(201,169,78,0.8)", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textAlign: "center" }}>
        How many cards?
      </div>

      {/* Card count grid — 3 columns: row 1 (3,7,12), row 2 (22,44,78), row 3 (Custom spans all) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", justifyItems: "center", justifyContent: "center", gap: 5 }}>
        {presetOptions.map((opt, _pi) => {
          const i = CARD_COUNT_OPTIONS.indexOf(opt);
          const isSelected = selectedIndex === i;
          const isHovered = hoveredIndex === i;
          const isHighlighted = isSelected || isHovered;
          return (
            <button
              key={opt.label}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(i)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(i);
                setShowCustom(false);
              }}
              style={{
                border: isSelected
                  ? "1px solid rgba(201,169,78,0.9)"
                  : isHighlighted
                    ? "1px solid rgba(201,169,78,0.7)"
                    : "1px solid rgba(201,169,78,0.3)",
                borderRadius: 999,
                background: isSelected
                  ? "rgba(201,169,78,0.25)"
                  : isHighlighted
                    ? "rgba(201,169,78,0.15)"
                    : "rgba(10,1,24,0.6)",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 500,
                color: "#c9a94e",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {opt.count}
            </button>
          );
        })}

        {/* Custom button — spans all 3 columns */}
        {(() => {
          const isSelected = selectedIndex === customOptionIndex;
          const isHovered = hoveredIndex === customOptionIndex;
          const isHighlighted = isSelected || isHovered;
          return (
            <button
              key={customOption.label}
              onMouseEnter={() => setHoveredIndex(customOptionIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(customOptionIndex)}
              onClick={(e) => {
                e.stopPropagation();
                setShowCustom(true);
                setSelectedIndex(customOptionIndex);
              }}
              style={{
                gridColumn: "1 / -1",
                border: isSelected
                  ? "1px solid rgba(201,169,78,0.9)"
                  : isHighlighted
                    ? "1px solid rgba(201,169,78,0.7)"
                    : "1px solid rgba(201,169,78,0.3)",
                borderRadius: 999,
                background: isSelected
                  ? "rgba(201,169,78,0.25)"
                  : isHighlighted
                    ? "rgba(201,169,78,0.15)"
                    : "rgba(10,1,24,0.6)",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 500,
                color: "#c9a94e",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Custom
            </button>
          );
        })()}
      </div>

      {/* Custom input */}
      {showCustom && (
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <input
            type="number"
            min={1}
            max={78}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleCustomSubmit();
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="1-78"
            style={{
              width: 40,
              border: "1px solid rgba(201,169,78,0.3)",
              borderRadius: 6,
              background: "rgba(10,1,24,0.7)",
              padding: "3px 5px",
              fontSize: 10,
              textAlign: "center",
              color: "#e0d8f0",
              outline: "none",
            }}
            autoFocus
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleCustomSubmit(); }}
            style={{
              border: "1px solid rgba(201,169,78,0.4)",
              borderRadius: 6,
              background: "rgba(201,169,78,0.1)",
              padding: "3px 8px",
              fontSize: 10,
              fontWeight: 500,
              color: "#c9a94e",
              cursor: "pointer",
            }}
          >
            Go
          </button>
        </div>
      )}

      {/* Continue button — appears when a preset count is selected */}
      {selectedCount !== null && selectedIndex !== null && CARD_COUNT_OPTIONS[selectedIndex].count !== null && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(selectedCount);
          }}
          style={{
            border: "1px solid rgba(201,169,78,0.5)",
            borderRadius: 8,
            background: "rgba(201,169,78,0.15)",
            padding: "6px 16px",
            fontSize: 12,
            fontWeight: 600,
            color: "#c9a94e",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Continue with {selectedCount} cards
        </button>
      )}

      {/* Description + nudge below continue button */}
      {activeOption && (
        <div style={{ textAlign: "center", padding: "0 10px" }}>
          <div style={{ fontSize: 9, color: "rgba(201,169,78,0.7)", fontWeight: 500 }}>{activeOption.label}</div>
          <div style={{ fontSize: 9, color: "rgba(180,180,200,0.7)", lineHeight: 1.3, marginTop: 1 }}>{activeOption.description}</div>
          {activeOption.nudge && selectedIndex !== null && (
            <div style={{ fontSize: 8, color: "rgba(201,169,78,0.6)", lineHeight: 1.3, marginTop: 2, fontStyle: "italic" }}>{activeOption.nudge}</div>
          )}
        </div>
      )}
    </div>
  );
}

function OriginInputContent({
  onSubmit,
}: {
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: HTML_WIDTH, height: HTML_HEIGHT, gap: 8, paddingTop: 14, paddingBottom: 10, overflow: "hidden" }}>
      <div style={{ color: "rgba(201,169,78,0.8)", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textAlign: "center", flexShrink: 0 }}>
        Describe your intent
      </div>

      <div style={{ position: "relative", width: "88%", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "absolute", inset: -2, borderRadius: 10, background: "linear-gradient(90deg, rgba(201,169,78,0.3), rgba(201,169,78,0.6), rgba(201,169,78,0.3))", opacity: 0.5, filter: "blur(2px)" }} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Your journey, your story, your question..."
          style={{
            position: "relative",
            width: "100%",
            flex: 1,
            minHeight: 60,
            resize: "none",
            border: "1px solid rgba(201,169,78,0.3)",
            borderRadius: 8,
            background: "rgba(10,1,24,0.7)",
            padding: "6px 8px",
            fontSize: 11,
            color: "#e0d8f0",
            outline: "none",
            lineHeight: 1.5,
            overflow: "auto",
          }}
        />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSubmit(text);
        }}
        style={{
          flexShrink: 0,
          border: "1px solid rgba(201,169,78,0.4)",
          borderRadius: 8,
          background: "rgba(201,169,78,0.1)",
          padding: "6px 16px",
          fontSize: 11,
          fontWeight: 500,
          color: "#c9a94e",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        Forge My Deck
      </button>
    </div>
  );
}

// ─── OriginCardV2 (single Html, fade transitions) ───────────────────────────

function OriginCardV2({
  visible,
  phase,
  targetPhase,
  forgingSubPhase,
  forgingTargetScale,
  forgingTargetPosition,
  onCardCountSelect,
  onInputSubmit,
  onPhaseMidpoint,
}: {
  visible: boolean;
  phase: JourneyPhase;
  targetPhase: JourneyPhase | null;
  forgingSubPhase: ForgingSubPhase | null;
  forgingTargetScale: number;
  forgingTargetPosition: { x: number; y: number };
  onCardCountSelect: (count: number) => void;
  onInputSubmit: (text: string) => void;
  onPhaseMidpoint: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const htmlOpacityRef = useRef(1);
  const htmlWrapperRef = useRef<HTMLDivElement>(null);

  // Fade transition state
  const [displayPhase, setDisplayPhase] = useState<JourneyPhase>("intro");
  const fadeState = useRef<"visible" | "out" | "in">("visible");
  const fadeProgress = useRef(1); // 1 = fully visible, 0 = invisible
  const midpointFired = useRef(false);
  const pendingPhase = useRef<JourneyPhase | null>(null);

  // Materials (memoized outside useFrame)
  const frontMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a0530"),
      metalness: 0.2,
      roughness: 0.8,
      side: THREE.FrontSide,
    }),
    [],
  );

  const borderMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c9a94e"),
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color("#c9a94e"),
      emissiveIntensity: 0.3,
    }),
    [],
  );

  const backMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1a0a2e"),
      transmission: 0.6,
      roughness: 0.15,
      clearcoat: 1.0,
      side: THREE.FrontSide,
    }),
    [],
  );

  const width = 2;
  const height = 3;

  // Trigger fade-out when targetPhase changes
  useEffect(() => {
    if (targetPhase && targetPhase !== displayPhase) {
      fadeState.current = "out";
      pendingPhase.current = targetPhase;
      midpointFired.current = false;
    }
  }, [targetPhase, displayPhase]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const isForging = phase === "forging";
    const isDealing = isForging && forgingSubPhase === "dealing";

    // Target scale and position based on phase
    let targetScale: number;
    let targetX = 0;
    let targetY = 0;
    let lerpRate = delta * 3;

    if (visible && !isForging) {
      targetScale = 1.0;
      htmlOpacityRef.current = 1;
    } else if (isDealing) {
      // Transition to center grid position
      targetScale = forgingTargetScale;
      targetX = forgingTargetPosition.x;
      targetY = forgingTargetPosition.y;
      lerpRate = delta * 2.5;
      // Fade out HTML content
      htmlOpacityRef.current = Math.max(0, htmlOpacityRef.current - delta * 3);
    } else if (isForging) {
      // Revealing/completion — snap-hide origin card (no lerp ghost)
      scaleRef.current = 0;
      htmlOpacityRef.current = 0;
      targetScale = 0;
      lerpRate = delta * 4;
    } else {
      targetScale = 0;
      htmlOpacityRef.current = 0;
    }

    if (isForging && forgingSubPhase !== "dealing") {
      // Snap to 0 — prevents ghost card lingering
      scaleRef.current = 0;
    } else {
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, lerpRate);
    }

    posRef.current.x = THREE.MathUtils.lerp(posRef.current.x, targetX, lerpRate);
    posRef.current.y = THREE.MathUtils.lerp(posRef.current.y, targetY, lerpRate);
    groupRef.current.position.set(posRef.current.x, posRef.current.y, 0);
    groupRef.current.scale.setScalar(scaleRef.current);

    // Drive fade transitions (~300ms each direction)
    const fadeSpeed = 1 / 0.3; // 300ms
    if (fadeState.current === "out") {
      fadeProgress.current = Math.max(0, fadeProgress.current - delta * fadeSpeed);
      if (fadeProgress.current <= 0 && !midpointFired.current) {
        // Swap content (invisible at opacity=0)
        if (pendingPhase.current) {
          setDisplayPhase(pendingPhase.current);
        }
        onPhaseMidpoint();
        midpointFired.current = true;
        fadeState.current = "in";
      }
    } else if (fadeState.current === "in") {
      fadeProgress.current = Math.min(1, fadeProgress.current + delta * fadeSpeed);
      if (fadeProgress.current >= 1) {
        fadeState.current = "visible";
      }
    }

    // Apply combined opacity (html visibility * fade progress)
    const finalOpacity = htmlOpacityRef.current * fadeProgress.current;
    if (htmlWrapperRef.current) {
      htmlWrapperRef.current.style.opacity = String(finalOpacity);
      htmlWrapperRef.current.style.pointerEvents = finalOpacity > 0.1 ? "auto" : "none";
    }
  });

  const isForging = phase === "forging";

  return (
    <group ref={groupRef} scale={0}>
      <Float speed={2} rotationIntensity={isForging ? 0 : 0.3} floatIntensity={isForging ? 0 : 0.5} floatingRange={[-0.2, 0.2]}>
        {/* Card edge (thickness) */}
        <mesh raycast={() => null}>
          <boxGeometry args={[width, height, CARD_THICKNESS]} />
          <primitive object={borderMaterial} attach="material" />
        </mesh>

        {/* Front face */}
        <mesh position={[0, 0, FACE_Z]}>
          <planeGeometry args={[width, height]} />
          <primitive object={frontMaterial} attach="material" />
        </mesh>

        {/* Back face */}
        <mesh position={[0, 0, -FACE_Z]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[width, height]} />
          <primitive object={backMaterial} attach="material" />
        </mesh>

        {/* Gold border (front) */}
        <lineSegments position={[0, 0, BORDER_Z]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(width * 0.95, height * 0.95)]} />
          <lineBasicMaterial color="#c9a94e" linewidth={1} />
        </lineSegments>

        {/* Inner border (front) */}
        <lineSegments position={[0, 0, BORDER_Z + 0.001]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(width * 0.88, height * 0.88)]} />
          <lineBasicMaterial color="#c9a94e" opacity={0.4} transparent />
        </lineSegments>

        {/* Gold border (back) */}
        <lineSegments position={[0, 0, -BORDER_Z]} rotation={[0, Math.PI, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(width * 0.95, height * 0.95)]} />
          <lineBasicMaterial color="#c9a94e" linewidth={1} />
        </lineSegments>

        {/* Inner border (back) */}
        <lineSegments position={[0, 0, -(BORDER_Z + 0.001)]} rotation={[0, Math.PI, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(width * 0.88, height * 0.88)]} />
          <lineBasicMaterial color="#c9a94e" opacity={0.4} transparent />
        </lineSegments>

        {/* Single Html element — content cross-fades between phases */}
        <Html
          position={[0, 0, 0.05]}
          center
          transform
          distanceFactor={3.7}
          style={{ pointerEvents: "none" }}
        >
          <div ref={htmlWrapperRef} style={{ ...htmlContainerStyle, opacity: 1, pointerEvents: "auto" }}>
            {displayPhase === "intro" && <OriginIntroContent />}
            {displayPhase === "selection" && (
              <OriginSelectionContent onSelect={onCardCountSelect} />
            )}
            {displayPhase === "input" && (
              <OriginInputContent onSubmit={onInputSubmit} />
            )}
          </div>
        </Html>
      </Float>
    </group>
  );
}

// ─── Converging Particles ───────────────────────────────────────────────────

function ConvergingParticles({
  subPhase,
  phaseTime,
  count,
}: {
  subPhase: ForgingSubPhase | null;
  phaseTime: number;
  count: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const initialPositions = useRef<Float32Array | null>(null);

  useEffect(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5 + Math.random() * 5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    initialPositions.current = positions.slice();
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current || !initialPositions.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position;
    if (!pos) return;
    const posArray = pos.array as Float32Array;

    if (subPhase === "dealing") {
      const convergence = Math.min(1, phaseTime * 0.3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        posArray[i3] = initialPositions.current[i3] * (1 - convergence);
        posArray[i3 + 1] = initialPositions.current[i3 + 1] * (1 - convergence);
        posArray[i3 + 2] = initialPositions.current[i3 + 2] * (1 - convergence);
      }
    } else if (subPhase === "completion") {
      const expansion = Math.min(1, phaseTime * 0.5);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        posArray[i3] = initialPositions.current[i3] * expansion * 1.5;
        posArray[i3 + 1] = initialPositions.current[i3 + 1] * expansion * 1.5;
        posArray[i3 + 2] = initialPositions.current[i3 + 2] * expansion * 1.5;
      }
    } else {
      for (let i = 0; i < count * 3; i++) {
        posArray[i] = initialPositions.current[i];
      }
    }

    pos.needsUpdate = true;
  });

  const positions = useRef(new Float32Array(count * 3)).current;

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        color="#c9a94e"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={subPhase ? 0.8 : 0}
      />
    </Points>
  );
}

// ─── Camera Controller ──────────────────────────────────────────────────────

function JourneyCameraController({
  phase,
  forgingSubPhase,
  gridCameraZ,
}: {
  phase: JourneyPhase;
  forgingSubPhase: ForgingSubPhase | null;
  gridCameraZ: number;
}) {
  const { camera, size } = useThree();

  useFrame((_, delta) => {
    const aspect = size.width / size.height;
    const zBias = aspect < 1 ? (1 / aspect - 1) * 1.5 : 0;

    let targetZ: number;
    let rate: number;

    if (phase === "intro" || phase === "selection" || phase === "input") {
      targetZ = 4.5 + zBias;
      rate = delta * 2;
    } else if (phase === "forging" && forgingSubPhase === "dealing") {
      targetZ = gridCameraZ + zBias;
      rate = delta * 1.5;
    } else {
      // forging (revealing/completion) + presentation
      targetZ = gridCameraZ + zBias;
      rate = delta * 2;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, rate);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, rate);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, rate);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── R3F Content (inside Canvas) ────────────────────────────────────────────

function JourneyContent({
  phase,
  targetPhase,
  cardCount,
  forgingSubPhase,
  forgingPhaseTime,
  currentPage,
  pageSize,
  visitedPages,
  onCardCountSelect,
  onInputSubmit,
  onPhaseMidpoint,
}: {
  phase: JourneyPhase;
  targetPhase: JourneyPhase | null;
  cardCount: number;
  forgingSubPhase: ForgingSubPhase | null;
  forgingPhaseTime: number;
  currentPage: number;
  pageSize: number;
  visitedPages: Set<number>;
  onCardCountSelect: (count: number) => void;
  onInputSubmit: (text: string) => void;
  onPhaseMidpoint: () => void;
}) {
  const starsRef = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();

  const {
    nebulaIntensity,
    starCount,
    bloomStrength,
    bloomThreshold,
    revealMode,
    glowIntensity,
    staggerDelay,
  } = useControls({
    Atmosphere: folder({
      nebulaIntensity: { value: 0.6, min: 0.0, max: 1.0, step: 0.05 },
      starCount: { value: 5000, min: 500, max: 10000, step: 500 },
      bloomStrength: { value: 0.8, min: 0.0, max: 3.0, step: 0.1 },
      bloomThreshold: { value: 0.5, min: 0.0, max: 1.0, step: 0.05 },
    }),
    Forging: folder({
      revealMode: { value: 0, options: { "Noise Dissolve": 0, "Radial Expand": 1, "Left-to-Right": 2 } },
      glowIntensity: { value: 1.0, min: 0.0, max: 2.0, step: 0.1 },
      staggerDelay: { value: 0.12, min: 0.05, max: 0.5, step: 0.01 },
    }),
  });

  // Mouse parallax for stars
  useFrame((_, delta) => {
    if (!starsRef.current) return;
    const targetX = pointer.x * 0.3;
    const targetY = pointer.y * 0.2;
    starsRef.current.position.x = THREE.MathUtils.lerp(starsRef.current.position.x, targetX, delta * 2);
    starsRef.current.position.y = THREE.MathUtils.lerp(starsRef.current.position.y, targetY, delta * 2);
  });

  const isMobile = viewport.aspect < 1;
  const selectedCards = SAMPLE_CARDS.slice(0, cardCount);

  // Pagination
  const totalPages = cardCount <= pageSize ? 1 : Math.ceil(cardCount / pageSize);
  const visibleCount = totalPages === 1
    ? cardCount
    : Math.min(pageSize, cardCount - currentPage * pageSize);
  const pageCards = selectedCards.slice(currentPage * pageSize, currentPage * pageSize + visibleCount);

  const gridScale = getAdaptiveScale(visibleCount, isMobile, viewport.width, viewport.height);
  const gridPositions = getGridPositions(visibleCount, isMobile, gridScale);
  const gridCameraZ = getGridCameraZ(visibleCount, isMobile, gridScale, viewport.aspect);

  // Compute center grid index (closest to origin 0,0)
  const centerIndex = gridPositions.length > 0
    ? gridPositions.reduce((bestIdx, pos, idx) => {
        const bestDist = gridPositions[bestIdx].x ** 2 + gridPositions[bestIdx].y ** 2;
        const dist = pos.x ** 2 + pos.y ** 2;
        return dist < bestDist ? idx : bestIdx;
      }, 0)
    : 0;
  const centerGridPosition = gridPositions[centerIndex] ?? { x: 0, y: 0 };

  const showOrigin = phase === "intro" || phase === "selection" || phase === "input" ||
    (phase === "forging" && forgingSubPhase === "dealing");
  const showCards = phase === "forging" || phase === "presentation";

  const shouldAnimateEntrance = !visitedPages.has(currentPage) || phase === "forging";

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#c9a94e" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#7c4dff" />

      {/* Persistent ambient background */}
      <mesh position={[0, 0, -15]} scale={[50, 50, 1]}>
        <planeGeometry args={[1, 1]} />
        <NebulaMaterial intensity={nebulaIntensity} />
      </mesh>

      <group ref={starsRef}>
        <Stars radius={100} depth={50} count={starCount} factor={4} saturation={0.2} fade speed={0.5} />
      </group>

      <Sparkles count={80} scale={[15, 10, 10]} size={3} speed={0.3} color="#c9a94e" opacity={0.4} />
      <Sparkles count={30} scale={[12, 8, 8]} size={2} speed={0.2} color="#7c4dff" opacity={0.3} />

      {/* Origin card — visible during intro/selection/input, transitions during dealing */}
      <OriginCardV2
        visible={showOrigin}
        phase={phase}
        targetPhase={targetPhase}
        forgingSubPhase={forgingSubPhase}
        forgingTargetScale={gridScale}
        forgingTargetPosition={centerGridPosition}
        onCardCountSelect={onCardCountSelect}
        onInputSubmit={onInputSubmit}
        onPhaseMidpoint={onPhaseMidpoint}
      />

      {/* JourneyCards — persistent from forging through presentation */}
      {showCards && pageCards.map((card, i) => (
        <JourneyCard
          key={`${currentPage}-${card.title}`}
          index={i}
          cardData={card}
          phase={phase}
          forgingSubPhase={forgingSubPhase}
          gridPosition={gridPositions[i] || { x: 0, y: 0, rotZ: 0 }}
          gridScale={gridScale}
          staggerDelay={staggerDelay}
          revealMode={revealMode as 0 | 1 | 2}
          glowIntensity={glowIntensity}
          animateEntrance={shouldAnimateEntrance}
          isCenterCard={currentPage === 0 && i === centerIndex}
        />
      ))}

      {/* Converging particles during forging */}
      {phase === "forging" && (
        <ConvergingParticles subPhase={forgingSubPhase} phaseTime={forgingPhaseTime} count={200} />
      )}

      {/* Completion text during forging */}
      {phase === "forging" && forgingSubPhase === "completion" && forgingPhaseTime > 1 && (
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.4}
          color="#c9a94e"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#7c4dff"
        >
          Your Deck Is Complete
        </Text>
      )}

      {/* Camera */}
      <JourneyCameraController
        phase={phase}
        forgingSubPhase={forgingSubPhase}
        gridCameraZ={gridCameraZ}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom intensity={bloomStrength} luminanceThreshold={bloomThreshold} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette darkness={0.5} />
      </EffectComposer>
    </>
  );
}

// ─── Overlay Components (forging/presentation only) ─────────────────────────

function ForgingIndicator({ subPhase }: { subPhase: ForgingSubPhase | null }) {
  return (
    <div className="flex flex-col items-center gap-2 mt-auto mb-8">
      <div className="rounded-full bg-background/80 backdrop-blur-md border border-border px-4 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wider">
          {subPhase === "dealing" && <span className="text-[#c9a94e]">Summoning...</span>}
          {subPhase === "revealing" && <span className="text-[#7c4dff]">Illuminating...</span>}
          {subPhase === "completion" && <span className="text-[#c9a94e]">Complete!</span>}
          {!subPhase && <span className="text-muted-foreground">Preparing...</span>}
        </span>
      </div>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  isLastPage,
  onPageChange,
  onGetReading,
}: {
  currentPage: number;
  totalPages: number;
  isLastPage: boolean;
  onPageChange: (page: number) => void;
  onGetReading: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 pointer-events-auto">
      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          <span className="text-xs text-muted-foreground/80 tracking-wide">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      )}

      {/* CTA on last page — only Get a Reading, no duplicate reset */}
      {isLastPage && (
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <button
            onClick={onGetReading}
            className="rounded-lg border border-[#c9a94e]/40 bg-[#c9a94e]/10 backdrop-blur-md px-6 py-2 text-sm font-medium text-[#c9a94e] transition-all hover:bg-[#c9a94e]/20 hover:shadow-[0_0_25px_rgba(201,169,78,0.3)]"
          >
            Get a Reading on This Deck
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Scene Component ───────────────────────────────────────────────────

export default function ImmersiveJourneyV2Scene() {
  const [phase, setPhase] = useState<JourneyPhase>("intro");
  const [targetPhase, setTargetPhase] = useState<JourneyPhase | null>(null);
  const [cardCount, setCardCount] = useState(7);
  const [forgingSubPhase, setForgingSubPhase] = useState<ForgingSubPhase | null>(null);
  const [forgingPhaseTime, setForgingPhaseTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [visitedPages, setVisitedPages] = useState<Set<number>>(new Set([0]));
  const forgingTimerRef = useRef<number | null>(null);

  const { autoAdvanceIntro, introDelay } = useControls({
    Journey: folder({
      autoAdvanceIntro: { value: true },
      introDelay: { value: 2, min: 1, max: 4, step: 0.5 },
    }),
  });

  const totalPages = cardCount <= pageSize ? 1 : Math.ceil(cardCount / pageSize);

  // Auto-advance from intro → selection (via fade)
  useEffect(() => {
    if (phase === "intro" && autoAdvanceIntro) {
      const timer = setTimeout(() => {
        setTargetPhase("selection");
      }, introDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, autoAdvanceIntro, introDelay]);

  // Called at the midpoint of a fade — commit the phase change
  const handlePhaseMidpoint = useCallback(() => {
    if (targetPhase) {
      setPhase(targetPhase);
      setTargetPhase(null);
    }
  }, [targetPhase]);

  // Forging phase runner — only page 0, then → presentation
  useEffect(() => {
    if (phase !== "forging") {
      setForgingSubPhase(null);
      setForgingPhaseTime(0);
      if (forgingTimerRef.current) {
        cancelAnimationFrame(forgingTimerRef.current);
        forgingTimerRef.current = null;
      }
      return;
    }

    setCurrentPage(0);
    setVisitedPages(new Set([0]));

    const count = Math.min(pageSize, cardCount);
    // Timing for page 0 only (+800ms for origin card transition delay)
    const dealDuration = count * 120 + 800 + 800; // ms
    const revealDuration = count * 100 + 1500;
    const completionDuration = 2000;

    let currentSub: ForgingSubPhase = "dealing";
    let subStartTime = performance.now();
    setForgingSubPhase("dealing");
    setForgingPhaseTime(0);

    function tick() {
      const now = performance.now();
      const elapsed = (now - subStartTime) / 1000;
      setForgingPhaseTime(elapsed);

      if (currentSub === "dealing" && (now - subStartTime) > dealDuration) {
        currentSub = "revealing";
        subStartTime = now;
        setForgingSubPhase("revealing");
        setForgingPhaseTime(0);
      } else if (currentSub === "revealing" && (now - subStartTime) > revealDuration) {
        currentSub = "completion";
        subStartTime = now;
        setForgingSubPhase("completion");
        setForgingPhaseTime(0);
      } else if (currentSub === "completion" && (now - subStartTime) > completionDuration) {
        // Done — transition to presentation
        setPhase("presentation");
        return;
      }

      forgingTimerRef.current = requestAnimationFrame(tick);
    }

    forgingTimerRef.current = requestAnimationFrame(tick);

    return () => {
      if (forgingTimerRef.current) {
        cancelAnimationFrame(forgingTimerRef.current);
      }
    };
  }, [phase, cardCount, pageSize]);

  const handleCardCountSelect = useCallback((count: number) => {
    setCardCount(count);
    // Trigger fade to input phase
    setTargetPhase("input");
  }, []);

  const handleInputSubmit = useCallback((_text: string) => {
    // No fade for input → forging; card shrinks to 0 instead
    setPhase("forging");
  }, []);

  const handleGetReading = useCallback(() => {
    // In the full experience, navigate to readings
    window.location.href = "/readings/new";
  }, []);

  const handleReset = useCallback(() => {
    setPhase("intro");
    setTargetPhase(null);
    setCardCount(7);
    setCurrentPage(0);
    setVisitedPages(new Set([0]));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setVisitedPages((prev) => {
      if (prev.has(page)) return prev;
      const next = new Set(prev);
      next.add(page);
      return next;
    });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    setVisitedPages(new Set([0]));
  }, []);

  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="relative h-full w-full">
      <LabCanvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <JourneyContent
          phase={phase}
          targetPhase={targetPhase}
          cardCount={cardCount}
          forgingSubPhase={forgingSubPhase}
          forgingPhaseTime={forgingPhaseTime}
          currentPage={currentPage}
          pageSize={pageSize}
          visitedPages={visitedPages}
          onCardCountSelect={handleCardCountSelect}
          onInputSubmit={handleInputSubmit}
          onPhaseMidpoint={handlePhaseMidpoint}
        />
      </LabCanvas>

      {/* Overlay UI — only for forging/presentation phases */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
        {phase === "forging" && <ForgingIndicator subPhase={forgingSubPhase} />}

        {phase === "presentation" && (
          <div className="flex flex-col items-center gap-3 mt-auto mb-8">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              isLastPage={isLastPage}
              onPageChange={handlePageChange}
              onGetReading={handleGetReading}
            />
          </div>
        )}
      </div>

      {/* Top bar: Reset + page size toggle — single reset location */}
      {phase !== "intro" && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={handleReset}
            className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
          >
            Reset
          </button>
          {phase === "presentation" && totalPages > 1 && (
            <div className="flex rounded-full border border-border/50 bg-background/50 backdrop-blur-md overflow-hidden">
              <button
                onClick={() => handlePageSizeChange(9)}
                className={`px-3 py-1 text-xs transition-colors ${pageSize === 9 ? "bg-[#c9a94e]/20 text-[#c9a94e]" : "text-muted-foreground hover:text-foreground"}`}
              >
                9
              </button>
              <div className="w-px bg-border/50" />
              <button
                onClick={() => handlePageSizeChange(12)}
                className={`px-3 py-1 text-xs transition-colors ${pageSize === 12 ? "bg-[#c9a94e]/20 text-[#c9a94e]" : "text-muted-foreground hover:text-foreground"}`}
              >
                12
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
