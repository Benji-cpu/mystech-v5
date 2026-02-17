/** Constellation patterns mapped to journey themes */

export interface ConstellationPattern {
  name: string;
  stars: { x: number; y: number }[];
  lines: [number, number][];
}

export const CONSTELLATIONS: Record<string, ConstellationPattern> = {
  resilience: {
    name: "Orion",
    stars: [
      { x: 0.35, y: 0.15 },
      { x: 0.65, y: 0.15 },
      { x: 0.5, y: 0.35 },
      { x: 0.42, y: 0.35 },
      { x: 0.58, y: 0.35 },
      { x: 0.3, y: 0.6 },
      { x: 0.7, y: 0.6 },
    ],
    lines: [
      [0, 1],
      [0, 3],
      [1, 4],
      [3, 2],
      [2, 4],
      [3, 5],
      [4, 6],
    ],
  },
  creativity: {
    name: "Lyra",
    stars: [
      { x: 0.5, y: 0.1 },
      { x: 0.4, y: 0.35 },
      { x: 0.6, y: 0.35 },
      { x: 0.35, y: 0.55 },
      { x: 0.65, y: 0.55 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 4],
    ],
  },
  transformation: {
    name: "Phoenix",
    stars: [
      { x: 0.5, y: 0.1 },
      { x: 0.35, y: 0.3 },
      { x: 0.65, y: 0.3 },
      { x: 0.5, y: 0.5 },
      { x: 0.25, y: 0.65 },
      { x: 0.75, y: 0.65 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
    ],
  },
  connection: {
    name: "Gemini",
    stars: [
      { x: 0.3, y: 0.15 },
      { x: 0.7, y: 0.15 },
      { x: 0.35, y: 0.4 },
      { x: 0.65, y: 0.4 },
      { x: 0.4, y: 0.6 },
      { x: 0.6, y: 0.6 },
    ],
    lines: [
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [2, 3],
      [4, 5],
    ],
  },
  wisdom: {
    name: "Ophiuchus",
    stars: [
      { x: 0.5, y: 0.1 },
      { x: 0.35, y: 0.3 },
      { x: 0.65, y: 0.3 },
      { x: 0.3, y: 0.5 },
      { x: 0.7, y: 0.5 },
      { x: 0.5, y: 0.65 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [4, 5],
    ],
  },
  courage: {
    name: "Leo",
    stars: [
      { x: 0.3, y: 0.2 },
      { x: 0.5, y: 0.15 },
      { x: 0.65, y: 0.25 },
      { x: 0.7, y: 0.45 },
      { x: 0.55, y: 0.55 },
      { x: 0.35, y: 0.5 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ],
  },
  growth: {
    name: "Virgo",
    stars: [
      { x: 0.4, y: 0.1 },
      { x: 0.55, y: 0.25 },
      { x: 0.45, y: 0.4 },
      { x: 0.6, y: 0.45 },
      { x: 0.5, y: 0.6 },
      { x: 0.35, y: 0.55 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3],
      [2, 5],
      [3, 4],
      [2, 4],
    ],
  },
  healing: {
    name: "Aquarius",
    stars: [
      { x: 0.35, y: 0.15 },
      { x: 0.55, y: 0.2 },
      { x: 0.45, y: 0.35 },
      { x: 0.65, y: 0.4 },
      { x: 0.5, y: 0.55 },
      { x: 0.35, y: 0.6 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [4, 5],
      [3, 4],
    ],
  },
};
