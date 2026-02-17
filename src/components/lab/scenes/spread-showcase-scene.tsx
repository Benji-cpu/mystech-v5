"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { LabCanvas } from "../lab-canvas";
import { OracleCard3D } from "../oracle-card-3d";
import { NebulaMaterial } from "../shaders/nebula";
import { SPREAD_POSITIONS } from "@/lib/constants";
import type { SpreadType } from "@/types";

// ─── Sample Data ────────────────────────────────────────────────────────────

const SAMPLE_CARDS = [
  { title: "The Dreamer", meaning: "Trust the unseen path before you", guidance: "Your intuition speaks louder than logic right now.", imageUrl: "https://picsum.photos/seed/dreamer/400/600" },
  { title: "The Alchemist", meaning: "Transform what weighs you down", guidance: "The challenges you face are raw material for growth.", imageUrl: "https://picsum.photos/seed/alchemist/400/600" },
  { title: "The Wanderer", meaning: "The journey itself holds the answer", guidance: "Stop searching for a destination.", imageUrl: "https://picsum.photos/seed/wanderer/400/600" },
  { title: "The Mirror", meaning: "See yourself as you truly are", guidance: "What you admire in others already lives within you.", imageUrl: "https://picsum.photos/seed/mirror/400/600" },
  { title: "The Flame", meaning: "Your passion is trying to tell you something", guidance: "Follow what makes you feel most alive.", imageUrl: "https://picsum.photos/seed/flame/400/600" },
  { title: "The Guardian", meaning: "Protection surrounds you now", guidance: "Trust that you are safe to take the next leap.", imageUrl: "https://picsum.photos/seed/guardian/400/600" },
  { title: "The Vessel", meaning: "You are ready to receive", guidance: "Empty yourself of expectations.", imageUrl: "https://picsum.photos/seed/vessel/400/600" },
  { title: "The Star", meaning: "Hope is not naive — it is power", guidance: "Even in darkness, you carry light.", imageUrl: "https://picsum.photos/seed/star/400/600" },
  { title: "The Threshold", meaning: "A new chapter is beginning", guidance: "Step through the door between who you were and who you are becoming.", imageUrl: "https://picsum.photos/seed/threshold/400/600" },
  { title: "The Return", meaning: "Come home to yourself", guidance: "Rest in what you already know to be true.", imageUrl: "https://picsum.photos/seed/return/400/600" },
];

// ─── Spread Layout Definitions ──────────────────────────────────────────────

type CardLayout = {
  position: [number, number, number];
  rotation: [number, number, number];
  name: string;
};

type SpreadLayout = {
  mobile: CardLayout[];
  desktop: CardLayout[];
  scale: { mobile: number; desktop: number };
  cameraZ: number;
};

const SPREAD_LABELS: Record<SpreadType, string> = {
  single: "Single Card",
  three_card: "Three-Card Spread",
  five_card: "Five-Card Cross",
  celtic_cross: "Celtic Cross",
};

const SPREAD_LAYOUTS: Record<SpreadType, SpreadLayout> = {
  single: {
    mobile: [
      { position: [0, 0, 0], rotation: [0, 0, 0], name: "Focus" },
    ],
    desktop: [
      { position: [0, 0, 0], rotation: [0, 0, 0], name: "Focus" },
    ],
    scale: { mobile: 0.7, desktop: 0.9 },
    cameraZ: 8,
  },
  three_card: {
    mobile: [
      { position: [-1.3, 0, 0], rotation: [0, 0, 0], name: "Past" },
      { position: [0, 0, 0], rotation: [0, 0, 0], name: "Present" },
      { position: [1.3, 0, 0], rotation: [0, 0, 0], name: "Future" },
    ],
    desktop: [
      { position: [-2.0, 0, 0], rotation: [0, 0, 0], name: "Past" },
      { position: [0, 0, 0], rotation: [0, 0, 0], name: "Present" },
      { position: [2.0, 0, 0], rotation: [0, 0, 0], name: "Future" },
    ],
    scale: { mobile: 0.45, desktop: 0.65 },
    cameraZ: 8,
  },
  five_card: {
    mobile: [
      { position: [0, 0, 0], rotation: [0, 0, 0], name: "Situation" },
      { position: [0, 1.4, 0], rotation: [0, 0, 0], name: "Challenge" },
      { position: [0, -1.4, 0], rotation: [0, 0, 0], name: "Foundation" },
      { position: [-1.3, 0, 0], rotation: [0, 0, 0], name: "Recent Past" },
      { position: [1.3, 0, 0], rotation: [0, 0, 0], name: "Near Future" },
    ],
    desktop: [
      { position: [0, 0, 0], rotation: [0, 0, 0], name: "Situation" },
      { position: [0, 2.0, 0], rotation: [0, 0, 0], name: "Challenge" },
      { position: [0, -2.0, 0], rotation: [0, 0, 0], name: "Foundation" },
      { position: [-2.0, 0, 0], rotation: [0, 0, 0], name: "Recent Past" },
      { position: [2.0, 0, 0], rotation: [0, 0, 0], name: "Near Future" },
    ],
    scale: { mobile: 0.4, desktop: 0.6 },
    cameraZ: 8,
  },
  celtic_cross: {
    mobile: [
      { position: [-0.7, 0, 0], rotation: [0, 0, 0], name: "Present" },
      { position: [-0.7, 0, 0.08], rotation: [0, 0, Math.PI / 2], name: "Challenge" },
      { position: [-0.7, -1.2, 0], rotation: [0, 0, 0], name: "Foundation" },
      { position: [-1.9, 0, 0], rotation: [0, 0, 0], name: "Recent Past" },
      { position: [-0.7, 1.2, 0], rotation: [0, 0, 0], name: "Best Outcome" },
      { position: [0.5, 0, 0], rotation: [0, 0, 0], name: "Near Future" },
      { position: [1.8, -1.8, 0], rotation: [0, 0, 0], name: "Self" },
      { position: [1.8, -0.6, 0], rotation: [0, 0, 0], name: "Environment" },
      { position: [1.8, 0.6, 0], rotation: [0, 0, 0], name: "Hopes & Fears" },
      { position: [1.8, 1.8, 0], rotation: [0, 0, 0], name: "Final Outcome" },
    ],
    desktop: [
      { position: [-1.5, 0, 0], rotation: [0, 0, 0], name: "Present" },
      { position: [-1.5, 0, 0.08], rotation: [0, 0, Math.PI / 2], name: "Challenge" },
      { position: [-1.5, -2.0, 0], rotation: [0, 0, 0], name: "Foundation" },
      { position: [-3.5, 0, 0], rotation: [0, 0, 0], name: "Recent Past" },
      { position: [-1.5, 2.0, 0], rotation: [0, 0, 0], name: "Best Outcome" },
      { position: [0.5, 0, 0], rotation: [0, 0, 0], name: "Near Future" },
      { position: [3.0, -3.0, 0], rotation: [0, 0, 0], name: "Self" },
      { position: [3.0, -1.0, 0], rotation: [0, 0, 0], name: "Environment" },
      { position: [3.0, 1.0, 0], rotation: [0, 0, 0], name: "Hopes & Fears" },
      { position: [3.0, 3.0, 0], rotation: [0, 0, 0], name: "Final Outcome" },
    ],
    scale: { mobile: 0.3, desktop: 0.5 },
    cameraZ: 10,
  },
};

// ─── Animated Card ──────────────────────────────────────────────────────────

function AnimatedCard({
  index,
  activeSpread,
  isMobile,
}: {
  index: number;
  activeSpread: SpreadType;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentScale = useRef(0);
  const currentRot = useRef(new THREE.Euler(0, 0, 0));
  const [visible, setVisible] = useState(false);

  const card = SAMPLE_CARDS[index];
  const layout = SPREAD_LAYOUTS[activeSpread];
  const slots = isMobile ? layout.mobile : layout.desktop;
  const isActive = index < slots.length;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const speed = delta * 4;

    if (isActive) {
      const slot = slots[index];
      const targetScale = isMobile ? layout.scale.mobile : layout.scale.desktop;

      currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, slot.position[0], speed);
      currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, slot.position[1], speed);
      currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, slot.position[2], speed);

      currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, speed);

      currentRot.current.x = THREE.MathUtils.lerp(currentRot.current.x, slot.rotation[0], speed);
      currentRot.current.y = THREE.MathUtils.lerp(currentRot.current.y, slot.rotation[1], speed);
      currentRot.current.z = THREE.MathUtils.lerp(currentRot.current.z, slot.rotation[2], speed);
    } else {
      currentScale.current = THREE.MathUtils.lerp(currentScale.current, 0, speed);
    }

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.scale.setScalar(Math.max(currentScale.current, 0.001));
    groupRef.current.rotation.set(currentRot.current.x, currentRot.current.y, currentRot.current.z);

    // Track visibility for label display
    const isVis = currentScale.current > 0.05;
    if (isVis !== visible) setVisible(isVis);
  });

  const positionName = isActive ? slots[index].name : "";
  const isCrossCard = activeSpread === "celtic_cross" && index === 1;

  return (
    <group ref={groupRef}>
      <OracleCard3D
        title={card.title}
        holographic
        holoIntensity={0.5}
        holoSpeed={0.8}
        tiltSensitivity={isCrossCard ? 3 : activeSpread === "celtic_cross" ? 5 : 8}
        scale={1}
        imageUrl={card.imageUrl}
        meaning={card.meaning}
        guidance={card.guidance}
        holoOverlayOpacity={0.25}
      />
      {visible && positionName && (
        <Html
          position={[0, -1.7, 0.05]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div className="rounded-full border border-[#c9a94e]/30 bg-background/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#c9a94e]/80 whitespace-nowrap backdrop-blur-sm">
            {positionName}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Camera Controller ──────────────────────────────────────────────────────

function SpreadCameraController({ activeSpread }: { activeSpread: SpreadType }) {
  const { camera, size } = useThree();

  useFrame((_, delta) => {
    const aspect = size.width / size.height;
    const zBias = aspect < 1 ? (1 / aspect - 1) * 3 : 0;
    const baseZ = SPREAD_LAYOUTS[activeSpread].cameraZ;
    const targetZ = baseZ + zBias;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, delta * 2);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, delta * 2);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 2);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── R3F Content ────────────────────────────────────────────────────────────

function SpreadContent({ activeSpread }: { activeSpread: SpreadType }) {
  const starsRef = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();

  const isMobile = viewport.width < 6;

  // Mouse parallax for stars
  useFrame((_, delta) => {
    if (!starsRef.current) return;
    starsRef.current.position.x = THREE.MathUtils.lerp(
      starsRef.current.position.x,
      pointer.x * 0.3,
      delta * 2
    );
    starsRef.current.position.y = THREE.MathUtils.lerp(
      starsRef.current.position.y,
      pointer.y * 0.2,
      delta * 2
    );
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#c9a94e" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#7c4dff" />

      {/* Nebula backdrop */}
      <mesh position={[0, 0, -15]} scale={[30, 20, 1]}>
        <planeGeometry args={[1, 1]} />
        <NebulaMaterial intensity={0.6} />
      </mesh>

      {/* Stars */}
      <group ref={starsRef}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.2} fade speed={0.5} />
      </group>

      {/* Sparkles */}
      <Sparkles count={80} scale={[15, 10, 10]} size={3} speed={0.3} color="#c9a94e" opacity={0.4} />
      <Sparkles count={30} scale={[12, 8, 8]} size={2} speed={0.2} color="#7c4dff" opacity={0.3} />

      {/* All 10 cards — always mounted */}
      {SAMPLE_CARDS.map((_, i) => (
        <AnimatedCard
          key={i}
          index={i}
          activeSpread={activeSpread}
          isMobile={isMobile}
        />
      ))}

      {/* Camera */}
      <SpreadCameraController activeSpread={activeSpread} />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette darkness={0.5} />
      </EffectComposer>
    </>
  );
}

// ─── Overlay UI ─────────────────────────────────────────────────────────────

const SPREAD_OPTIONS: { type: SpreadType; label: string; count: number }[] = [
  { type: "single", label: "Single", count: 1 },
  { type: "three_card", label: "3-Card", count: 3 },
  { type: "five_card", label: "5-Card", count: 5 },
  { type: "celtic_cross", label: "Celtic", count: 10 },
];

function SpreadOverlay({
  activeSpread,
  onSelect,
}: {
  activeSpread: SpreadType;
  onSelect: (spread: SpreadType) => void;
}) {
  const positions = SPREAD_POSITIONS[activeSpread];
  const cardCount = positions.length;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
      {/* Top: Title + card count */}
      <div className="flex flex-col items-center pt-6 gap-1">
        <h2 className="text-lg sm:text-xl font-semibold text-[#c9a94e] tracking-wide">
          {SPREAD_LABELS[activeSpread]}
        </h2>
        <span className="text-xs text-muted-foreground">
          {cardCount} {cardCount === 1 ? "card" : "cards"}
        </span>
      </div>

      {/* Bottom: Spread switcher pills */}
      <div className="flex justify-center mb-8 px-4">
        <div className="flex flex-wrap justify-center gap-2 pointer-events-auto">
          {SPREAD_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all backdrop-blur-md ${
                activeSpread === opt.type
                  ? "border-[#c9a94e]/60 bg-[#c9a94e]/20 text-[#c9a94e]"
                  : "border-border/50 bg-background/50 text-muted-foreground hover:border-[#c9a94e]/30 hover:text-[#c9a94e]/70"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function SpreadShowcaseScene() {
  const [activeSpread, setActiveSpread] = useState<SpreadType>("three_card");

  const handleSelect = useCallback((spread: SpreadType) => {
    setActiveSpread(spread);
  }, []);

  return (
    <div className="relative h-full w-full">
      <LabCanvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <SpreadContent activeSpread={activeSpread} />
      </LabCanvas>

      <SpreadOverlay activeSpread={activeSpread} onSelect={handleSelect} />
    </div>
  );
}
