"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MeshTransmissionMaterial } from "@react-three/drei";

// ─── Frame Geometry Generators ────────────────────────────────────────────────
// Each returns { frame, surface, frameMaterial } where frame/surface are BufferGeometries

interface MirrorGeom {
  frame: THREE.BufferGeometry;
  surface: THREE.BufferGeometry;
  frameMaterialProps: FrameMaterialProps;
  surfaceScale?: [number, number, number];
  surfacePosition?: [number, number, number];
  framePosition?: [number, number, number];
}

interface FrameMaterialProps {
  color: string;
  metalness: number;
  roughness: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

// Helper: create ring/frame from outer and inner shape
function createFrameFromShapes(outer: THREE.Shape, inner: THREE.Shape, depth: number): THREE.BufferGeometry {
  outer.holes.push(inner as unknown as THREE.Path);
  return new THREE.ExtrudeGeometry(outer, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
}

// Helper: create ellipse shape
function ellipseShape(rx: number, ry: number, segments = 64): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

// Helper: circle shape
function circleShape(r: number, segments = 64): THREE.Shape {
  return ellipseShape(r, r, segments);
}

// Helper: rounded rect shape
function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = w / 2, hh = h / 2;
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return shape;
}

// Helper: hex shape
function hexShape(r: number): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

// ─── Mirror Definitions ───────────────────────────────────────────────────────

const FRAME_DEPTH = 0.1;
const FRAME_BORDER = 0.06;

function roundHandMirror(): MirrorGeom {
  const outerR = 0.65;
  const innerR = outerR - FRAME_BORDER;
  const outer = circleShape(outerR);
  const inner = circleShape(innerR);

  // Add handle
  const handleShape = new THREE.Shape();
  handleShape.moveTo(-0.06, -outerR);
  handleShape.lineTo(0.06, -outerR);
  handleShape.lineTo(0.04, -outerR - 0.35);
  handleShape.quadraticCurveTo(0.0, -outerR - 0.4, -0.04, -outerR - 0.35);
  handleShape.closePath();

  const diskGeom = createFrameFromShapes(outer, inner, FRAME_DEPTH);
  const handleGeom = new THREE.ExtrudeGeometry(handleShape, { depth: FRAME_DEPTH, bevelEnabled: false });
  // Merge handle with frame
  const frameGeom = mergeGeometries([diskGeom, handleGeom], false);

  return {
    frame: frameGeom ?? diskGeom,
    surface: new THREE.CircleGeometry(innerR, 64),
    frameMaterialProps: { color: "#c9a94e", metalness: 0.9, roughness: 0.2 },
  };
}

function ovalVanity(): MirrorGeom {
  const outerRx = 0.5, outerRy = 0.7;
  const innerRx = outerRx - FRAME_BORDER, innerRy = outerRy - FRAME_BORDER;
  const outer = ellipseShape(outerRx, outerRy);
  const inner = ellipseShape(innerRx, innerRy);
  return {
    frame: createFrameFromShapes(outer, inner, FRAME_DEPTH),
    surface: new THREE.PlaneGeometry(innerRx * 2, innerRy * 2, 32, 48),
    frameMaterialProps: { color: "#b8c0d0", metalness: 0.85, roughness: 0.15 },
    surfaceScale: [1, 1, 1],
  };
}

function scryingPool(): MirrorGeom {
  // Frameless pool — just a dark-edged circle
  const r = 0.7;
  return {
    frame: new THREE.RingGeometry(r - 0.02, r, 64),
    surface: new THREE.CircleGeometry(r - 0.02, 64),
    frameMaterialProps: {
      color: "#0a0118",
      metalness: 0.3,
      roughness: 0.8,
      emissive: "#1a0a3e",
      emissiveIntensity: 0.3,
    },
  };
}

function obsidianSlab(): MirrorGeom {
  const w = 0.9, h = 1.3, r = 0.05;
  const outerW = w + FRAME_BORDER * 2, outerH = h + FRAME_BORDER * 2;
  const outer = roundedRectShape(outerW, outerH, r + FRAME_BORDER);
  const inner = roundedRectShape(w, h, r);
  return {
    frame: createFrameFromShapes(outer, inner, 0.12),
    surface: new THREE.PlaneGeometry(w, h, 32, 48),
    frameMaterialProps: { color: "#1a1a2e", metalness: 0.7, roughness: 0.1 },
  };
}

function crystalOrb(): MirrorGeom {
  // Sphere for both frame (outer) and surface (inner plane projected onto sphere)
  return {
    frame: new THREE.SphereGeometry(0.7, 64, 64),
    surface: new THREE.CircleGeometry(0.55, 64),
    frameMaterialProps: { color: "#e0e8ff", metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.3 },
    surfacePosition: [0, 0, 0.45],
  };
}

function gothicArch(): MirrorGeom {
  const w = 0.8, h = 1.2;
  const hw = w / 2;

  function archShape(halfW: number, height: number): THREE.Shape {
    const shape = new THREE.Shape();
    shape.moveTo(-halfW, -height * 0.4);
    shape.lineTo(-halfW, height * 0.2);
    // Pointed arch top
    shape.quadraticCurveTo(-halfW, height * 0.5, 0, height * 0.55);
    shape.quadraticCurveTo(halfW, height * 0.5, halfW, height * 0.2);
    shape.lineTo(halfW, -height * 0.4);
    shape.closePath();
    return shape;
  }

  const outer = archShape(hw + FRAME_BORDER, h + FRAME_BORDER);
  const inner = archShape(hw, h);
  return {
    frame: createFrameFromShapes(outer, inner, FRAME_DEPTH),
    surface: new THREE.PlaneGeometry(w, h, 32, 48),
    frameMaterialProps: { color: "#6b6b80", metalness: 0.4, roughness: 0.7 },
  };
}

function ancientBronze(): MirrorGeom {
  const outerR = 0.65;
  const innerR = outerR - 0.08;
  const outer = circleShape(outerR);
  const inner = circleShape(innerR);
  return {
    frame: createFrameFromShapes(outer, inner, 0.12),
    surface: new THREE.CircleGeometry(innerR, 64),
    frameMaterialProps: {
      color: "#cd7f32",
      metalness: 0.7,
      roughness: 0.5,
      emissive: "#2a4a2a",
      emissiveIntensity: 0.1,
    },
  };
}

function artNouveau(): MirrorGeom {
  // Organic flowing curves
  const shape = new THREE.Shape();
  const innerShape = new THREE.Shape();
  const scale = 0.7;
  const innerScale = scale - FRAME_BORDER;

  function drawFlowing(s: THREE.Shape, sc: number) {
    s.moveTo(0, -sc);
    s.bezierCurveTo(sc * 0.8, -sc * 0.9, sc * 1.1, -sc * 0.3, sc * 0.8, sc * 0.2);
    s.bezierCurveTo(sc * 0.6, sc * 0.6, sc * 0.3, sc * 1.0, 0, sc);
    s.bezierCurveTo(-sc * 0.3, sc * 1.0, -sc * 0.6, sc * 0.6, -sc * 0.8, sc * 0.2);
    s.bezierCurveTo(-sc * 1.1, -sc * 0.3, -sc * 0.8, -sc * 0.9, 0, -sc);
  }

  drawFlowing(shape, scale);
  drawFlowing(innerShape, innerScale);

  shape.holes.push(innerShape as unknown as THREE.Path);

  return {
    frame: new THREE.ExtrudeGeometry(shape, { depth: FRAME_DEPTH, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }),
    surface: new THREE.CircleGeometry(innerScale * 0.85, 64),
    frameMaterialProps: { color: "#c9a94e", metalness: 0.85, roughness: 0.25, emissive: "#3a2a0a", emissiveIntensity: 0.1 },
  };
}

function venetian(): MirrorGeom {
  const w = 0.9, h = 1.2;
  const outer = roundedRectShape(w + 0.1, h + 0.1, 0.08);
  const inner = roundedRectShape(w - 0.04, h - 0.04, 0.02);
  return {
    frame: createFrameFromShapes(outer, inner, 0.08),
    surface: new THREE.PlaneGeometry(w - 0.04, h - 0.04, 32, 48),
    frameMaterialProps: { color: "#b8c0d0", metalness: 0.8, roughness: 0.2 },
  };
}

function crescentMoon(): MirrorGeom {
  // Crescent shape via two offset circles
  const r = 0.65;
  const offset = 0.3;

  const shape = new THREE.Shape();
  // Outer arc (full circle)
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  const innerCircle = new THREE.Shape();
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    const x = Math.cos(angle) * (r * 0.85) + offset;
    const y = Math.sin(angle) * (r * 0.85);
    if (i === 0) innerCircle.moveTo(x, y);
    else innerCircle.lineTo(x, y);
  }
  shape.holes.push(innerCircle as unknown as THREE.Path);

  return {
    frame: new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }),
    surface: new THREE.CircleGeometry(r * 0.5, 64),
    frameMaterialProps: { color: "#f0e6d3", metalness: 0.6, roughness: 0.3, emissive: "#f0e6d3", emissiveIntensity: 0.05 },
    surfacePosition: [-0.1, 0, 0.04],
  };
}

function hexagonal(): MirrorGeom {
  const outerR = 0.7;
  const innerR = outerR - 0.04;
  const outer = hexShape(outerR);
  const inner = hexShape(innerR);
  return {
    frame: createFrameFromShapes(outer, inner, 0.04),
    surface: new THREE.CircleGeometry(innerR * 0.87, 6), // hexagonal surface
    frameMaterialProps: { color: "#b87333", metalness: 0.7, roughness: 0.3 },
  };
}

function diamond(): MirrorGeom {
  const size = 0.65;
  const outerSize = size + FRAME_BORDER;

  function diamondShape(s: number): THREE.Shape {
    const shape = new THREE.Shape();
    shape.moveTo(0, s);
    shape.lineTo(s, 0);
    shape.lineTo(0, -s);
    shape.lineTo(-s, 0);
    shape.closePath();
    return shape;
  }

  const outer = diamondShape(outerSize);
  const inner = diamondShape(size);
  return {
    frame: createFrameFromShapes(outer, inner, 0.08),
    surface: new THREE.PlaneGeometry(size * 1.3, size * 1.3, 32, 32),
    frameMaterialProps: { color: "#e0e8ff", metalness: 0.6, roughness: 0.1, transparent: true, opacity: 0.7 },
  };
}

function infinityPortal(): MirrorGeom {
  // Concentric rings
  const rings: THREE.BufferGeometry[] = [];
  const ringCount = 4;
  for (let i = 0; i < ringCount; i++) {
    const outerR = 0.7 - i * 0.12;
    const innerR = outerR - 0.03;
    if (innerR > 0) {
      rings.push(new THREE.RingGeometry(innerR, outerR, 64));
    }
  }

  // Merge all rings into one geometry
  const frameGeom = mergeGeometries(rings, false);

  return {
    frame: frameGeom ?? rings[0],
    surface: new THREE.CircleGeometry(0.7 - ringCount * 0.12 + 0.03, 64),
    frameMaterialProps: {
      color: "#c9a94e",
      metalness: 0.8,
      roughness: 0.2,
      emissive: "#7b68ee",
      emissiveIntensity: 0.15,
    },
  };
}

function tearDrop(): MirrorGeom {
  function dropShape(scale: number): THREE.Shape {
    const shape = new THREE.Shape();
    shape.moveTo(0, scale * 0.7);
    shape.bezierCurveTo(
      scale * 0.5, scale * 0.5,
      scale * 0.6, -scale * 0.1,
      0, -scale * 0.7
    );
    shape.bezierCurveTo(
      -scale * 0.6, -scale * 0.1,
      -scale * 0.5, scale * 0.5,
      0, scale * 0.7
    );
    return shape;
  }

  const outer = dropShape(1.0);
  const inner = dropShape(0.9);
  outer.holes.push(inner as unknown as THREE.Path);

  return {
    frame: new THREE.ExtrudeGeometry(outer, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }),
    surface: new THREE.CircleGeometry(0.45, 64),
    frameMaterialProps: {
      color: "#e8d8f0",
      metalness: 0.5,
      roughness: 0.25,
      emissive: "#d8c8e0",
      emissiveIntensity: 0.1,
    },
  };
}

// ─── Generator Map ────────────────────────────────────────────────────────────

const GENERATORS: Record<string, () => MirrorGeom> = {
  "round-hand": roundHandMirror,
  "oval-vanity": ovalVanity,
  "scrying-pool": scryingPool,
  "obsidian-slab": obsidianSlab,
  "crystal-orb": crystalOrb,
  "gothic-arch": gothicArch,
  "ancient-bronze": ancientBronze,
  "art-nouveau": artNouveau,
  "venetian": venetian,
  "crescent-moon": crescentMoon,
  "hexagonal": hexagonal,
  "diamond": diamond,
  "infinity-portal": infinityPortal,
  "tear-drop": tearDrop,
};

// ─── React Components ─────────────────────────────────────────────────────────

interface MirrorFrameProps {
  styleId: string;
  children: React.ReactNode; // The mirror surface mesh
}

export function MirrorFrame({ styleId, children }: MirrorFrameProps) {
  const geom = useMemo(() => {
    const gen = GENERATORS[styleId] || GENERATORS["round-hand"];
    return gen();
  }, [styleId]);

  const isCrystalOrb = styleId === "crystal-orb";

  return (
    <group>
      {/* Frame mesh */}
      <mesh geometry={geom.frame} position={geom.framePosition || [0, 0, -FRAME_DEPTH / 2]}>
        {isCrystalOrb ? (
          <MeshTransmissionMaterial
            backside
            samples={6}
            resolution={256}
            transmission={0.95}
            roughness={0.05}
            thickness={0.5}
            ior={1.5}
            chromaticAberration={0.06}
            anisotropy={0.1}
            distortion={0.0}
            distortionScale={0.3}
            temporalDistortion={0.0}
            color="#e0e8ff"
          />
        ) : (
          <meshStandardMaterial
            color={geom.frameMaterialProps.color}
            metalness={geom.frameMaterialProps.metalness}
            roughness={geom.frameMaterialProps.roughness}
            emissive={geom.frameMaterialProps.emissive || "#000000"}
            emissiveIntensity={geom.frameMaterialProps.emissiveIntensity || 0}
            transparent={geom.frameMaterialProps.transparent}
            opacity={geom.frameMaterialProps.opacity ?? 1}
          />
        )}
      </mesh>

      {/* Surface (shader material applied by children) */}
      <mesh
        geometry={geom.surface}
        position={geom.surfacePosition || [0, 0, 0.01]}
        scale={geom.surfaceScale || [1, 1, 1]}
      >
        {children}
      </mesh>
    </group>
  );
}

export function getSurfaceAspect(styleId: string): number {
  // Most mirrors use roughly 2:3 aspect for content
  switch (styleId) {
    case "obsidian-slab":
    case "venetian":
    case "gothic-arch":
      return 0.69; // w/h
    case "oval-vanity":
      return 0.71;
    default:
      return 1.0; // circular
  }
}
