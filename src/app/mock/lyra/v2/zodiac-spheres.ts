// 3D zodiac constellation data for Lyra v2 — Three.js / React Three Fiber
//
// Coordinate system: right-handed, Y-up (Three.js default)
// All constellations are distributed on a sphere of radius 8.
//
// Spherical → Cartesian:
//   x = r * sin(phi) * cos(theta)
//   y = r * cos(phi)
//   z = r * sin(phi) * sin(theta)
//
// The 12 zodiac signs are placed at phi ≈ π/2 (equatorial belt), evenly
// spaced in theta with small phi offsets for visual interest.
// Lyra lives near the north pole at phi ≈ 0.3.

export type ZodiacElement = "fire" | "earth" | "air" | "water";

export interface ZodiacStar3D {
  x: number;
  y: number;
  z: number;
  brightness: number; // 0-1
}

export interface ZodiacSign3D {
  id: string;
  name: string;
  symbol: string;
  element: ZodiacElement;
  dateRange: string;
  stars: ZodiacStar3D[];
  connections: [number, number][]; // index pairs into stars array
  primaryStarIndex: number;
  // Camera fly-to when this zodiac is selected
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

// ── Spherical → Cartesian helper ────────────────────────────────────

function toCartesian(
  r: number,
  phi: number,
  theta: number
): [number, number, number] {
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

// ── Star cluster builder ─────────────────────────────────────────────
// Generates star positions clustered around a sphere anchor point.
// Each offset is a small displacement in local tangent-plane space,
// reprojected back to the sphere surface.

interface StarOffset {
  du: number; // tangent direction offset (roughly east-west on sphere)
  dv: number; // bitangent direction offset (roughly north-south on sphere)
  brightness: number;
}

function buildCluster(
  r: number,
  phi: number,
  theta: number,
  offsets: StarOffset[]
): ZodiacStar3D[] {
  return offsets.map(({ du, dv, brightness }) => {
    // Perturb phi and theta then convert; scale offsets by 1/r for angle
    const scale = 1 / r;
    const [x, y, z] = toCartesian(r, phi + dv * scale, theta + du * scale);
    return { x, y, z, brightness };
  });
}

// ── Camera position builder ──────────────────────────────────────────
// Positions camera ~4 units from the zodiac centroid, looking toward it.

function buildCameraFor(
  centroid: [number, number, number],
  offset: number = 4
): {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
} {
  // Direction from origin to centroid, then step back along that vector
  const [cx, cy, cz] = centroid;
  const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
  const factor = (len + offset) / len;
  return {
    cameraPosition: [cx * factor, cy * factor, cz * factor],
    cameraTarget: centroid,
  };
}

// ── Anchor positions (sphere radius 8) ──────────────────────────────
// 12 signs evenly spaced in theta, phi near π/2 with ±0.25 variation.

const R = 8;
const TWO_PI = 2 * Math.PI;

// phi values alternate above/below equator for a more interesting belt
const PHI_OFFSETS = [
  0.05,   // aries
  -0.12,  // taurus
  0.18,   // gemini
  -0.08,  // cancer
  0.22,   // leo
  -0.15,  // virgo
  0.1,    // libra
  -0.22,  // scorpio
  0.14,   // sagittarius
  -0.06,  // capricorn
  0.2,    // aquarius
  -0.18,  // pisces
];

function anchor(index: number): { phi: number; theta: number } {
  const theta = (index * TWO_PI) / 12;
  const phi = Math.PI / 2 + PHI_OFFSETS[index];
  return { phi, theta };
}

// Compute centroid of a cluster
function clusterCentroid(stars: ZodiacStar3D[]): [number, number, number] {
  const n = stars.length;
  const sx = stars.reduce((a, s) => a + s.x, 0) / n;
  const sy = stars.reduce((a, s) => a + s.y, 0) / n;
  const sz = stars.reduce((a, s) => a + s.z, 0) / n;
  return [sx, sy, sz];
}

// ── Build the 12 zodiac signs ────────────────────────────────────────

function buildSign(
  index: number,
  meta: {
    id: string;
    name: string;
    symbol: string;
    element: ZodiacElement;
    dateRange: string;
  },
  offsets: StarOffset[],
  connections: [number, number][],
  primaryStarIndex: number
): ZodiacSign3D {
  const { phi, theta } = anchor(index);
  const stars = buildCluster(R, phi, theta, offsets);
  const centroid = clusterCentroid(stars);
  const { cameraPosition, cameraTarget } = buildCameraFor(centroid, 6);
  return {
    ...meta,
    stars,
    connections,
    primaryStarIndex,
    cameraPosition,
    cameraTarget,
  };
}

// ── The 12 Zodiac Signs ─────────────────────────────────────────────

export const ZODIAC_SIGNS_3D: ZodiacSign3D[] = [
  // 0 — Aries (fire)
  buildSign(
    0,
    { id: "aries", name: "Aries", symbol: "\u2648", element: "fire", dateRange: "Mar 21 - Apr 19" },
    [
      { du: 0, dv: 0, brightness: 1 },
      { du: 0.7, dv: -0.5, brightness: 0.75 },
      { du: 1.4, dv: 0.2, brightness: 0.6 },
      { du: 2.1, dv: 0.8, brightness: 0.5 },
    ],
    [[0, 1], [1, 2], [2, 3]],
    0
  ),

  // 1 — Taurus (earth)
  buildSign(
    1,
    { id: "taurus", name: "Taurus", symbol: "\u2649", element: "earth", dateRange: "Apr 20 - May 20" },
    [
      { du: 0, dv: 0, brightness: 1 },
      { du: 0.8, dv: -0.6, brightness: 0.85 },
      { du: 1.6, dv: 0.3, brightness: 0.7 },
      { du: 1.1, dv: 1.2, brightness: 0.6 },
      { du: 1.9, dv: 1.5, brightness: 0.5 },
    ],
    [[0, 1], [1, 2], [2, 3], [2, 4]],
    0
  ),

  // 2 — Gemini (air)
  buildSign(
    2,
    { id: "gemini", name: "Gemini", symbol: "\u264A", element: "air", dateRange: "May 21 - Jun 20" },
    [
      { du: -0.8, dv: -1.0, brightness: 1 },
      { du: 0.8, dv: -1.0, brightness: 0.9 },
      { du: -0.6, dv: 0.1, brightness: 0.65 },
      { du: 0.6, dv: 0.1, brightness: 0.65 },
      { du: -0.4, dv: 1.2, brightness: 0.5 },
      { du: 0.4, dv: 1.2, brightness: 0.5 },
    ],
    [[0, 2], [1, 3], [2, 4], [3, 5], [0, 1], [2, 3]],
    0
  ),

  // 3 — Cancer (water)
  buildSign(
    3,
    { id: "cancer", name: "Cancer", symbol: "\u264B", element: "water", dateRange: "Jun 21 - Jul 22" },
    [
      { du: 0.3, dv: -0.3, brightness: 1 },
      { du: 1.1, dv: -0.6, brightness: 0.8 },
      { du: 0.7, dv: 0.7, brightness: 0.7 },
      { du: -0.3, dv: 1.1, brightness: 0.5 },
      { du: 1.5, dv: 0.9, brightness: 0.5 },
    ],
    [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4]],
    0
  ),

  // 4 — Leo (fire)
  buildSign(
    4,
    { id: "leo", name: "Leo", symbol: "\u264C", element: "fire", dateRange: "Jul 23 - Aug 22" },
    [
      { du: 0, dv: -1.0, brightness: 1 },
      { du: 0.8, dv: -0.8, brightness: 0.75 },
      { du: 1.6, dv: 0.1, brightness: 0.85 },
      { du: 2.2, dv: 1.2, brightness: 0.6 },
      { du: 1.4, dv: 1.5, brightness: 0.7 },
      { du: 0.5, dv: 1.1, brightness: 0.5 },
    ],
    [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
    0
  ),

  // 5 — Virgo (earth)
  buildSign(
    5,
    { id: "virgo", name: "Virgo", symbol: "\u264D", element: "earth", dateRange: "Aug 23 - Sep 22" },
    [
      { du: -0.3, dv: -1.2, brightness: 1 },
      { du: 0.6, dv: -0.4, brightness: 0.8 },
      { du: 1.4, dv: 0.3, brightness: 0.7 },
      { du: 0.9, dv: 1.3, brightness: 0.6 },
      { du: 0, dv: 1.8, brightness: 0.5 },
      { du: 1.9, dv: 1.5, brightness: 0.5 },
    ],
    [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]],
    0
  ),

  // 6 — Libra (air)
  buildSign(
    6,
    { id: "libra", name: "Libra", symbol: "\u264E", element: "air", dateRange: "Sep 23 - Oct 22" },
    [
      { du: 0.5, dv: -1.0, brightness: 1 },
      { du: -0.5, dv: 0.2, brightness: 0.7 },
      { du: 1.5, dv: 0.2, brightness: 0.7 },
      { du: 0.5, dv: 1.5, brightness: 0.6 },
    ],
    [[0, 1], [0, 2], [1, 3], [2, 3]],
    0
  ),

  // 7 — Scorpio (water)
  buildSign(
    7,
    { id: "scorpio", name: "Scorpio", symbol: "\u264F", element: "water", dateRange: "Oct 23 - Nov 21" },
    [
      { du: -0.9, dv: -0.2, brightness: 1 },
      { du: -0.1, dv: 0.2, brightness: 0.8 },
      { du: 0.7, dv: 0.6, brightness: 0.7 },
      { du: 1.3, dv: 1.3, brightness: 0.6 },
      { du: 2.0, dv: 1.0, brightness: 0.5 },
      { du: 2.3, dv: 0.1, brightness: 0.6 },
    ],
    [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    0
  ),

  // 8 — Sagittarius (fire)
  buildSign(
    8,
    { id: "sagittarius", name: "Sagittarius", symbol: "\u2650", element: "fire", dateRange: "Nov 22 - Dec 21" },
    [
      { du: 0.5, dv: -1.0, brightness: 1 },
      { du: -0.3, dv: 0.1, brightness: 0.7 },
      { du: 1.3, dv: 0.1, brightness: 0.7 },
      { du: -0.8, dv: 1.3, brightness: 0.5 },
      { du: 1.8, dv: 1.3, brightness: 0.5 },
      { du: 0.5, dv: 1.6, brightness: 0.6 },
    ],
    [[0, 1], [0, 2], [1, 3], [2, 4], [1, 5], [2, 5]],
    0
  ),

  // 9 — Capricorn (earth)
  buildSign(
    9,
    { id: "capricorn", name: "Capricorn", symbol: "\u2651", element: "earth", dateRange: "Dec 22 - Jan 19" },
    [
      { du: -0.5, dv: -1.1, brightness: 1 },
      { du: 0.5, dv: -0.7, brightness: 0.8 },
      { du: 1.3, dv: 0.1, brightness: 0.6 },
      { du: 0.9, dv: 1.3, brightness: 0.7 },
      { du: -0.1, dv: 1.1, brightness: 0.5 },
    ],
    [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
    0
  ),

  // 10 — Aquarius (air)
  buildSign(
    10,
    { id: "aquarius", name: "Aquarius", symbol: "\u2652", element: "air", dateRange: "Jan 20 - Feb 18" },
    [
      { du: -0.9, dv: -0.8, brightness: 1 },
      { du: 0.1, dv: -0.3, brightness: 0.7 },
      { du: 1.1, dv: -0.8, brightness: 0.85 },
      { du: 1.9, dv: 0.1, brightness: 0.6 },
      { du: 0.6, dv: 0.9, brightness: 0.5 },
      { du: 1.4, dv: 1.4, brightness: 0.5 },
    ],
    [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]],
    0
  ),

  // 11 — Pisces (water)
  buildSign(
    11,
    { id: "pisces", name: "Pisces", symbol: "\u2653", element: "water", dateRange: "Feb 19 - Mar 20" },
    [
      { du: -0.6, dv: -0.5, brightness: 1 },
      { du: 0.1, dv: 0.5, brightness: 0.7 },
      { du: 0.7, dv: 1.4, brightness: 0.6 },
      { du: 1.3, dv: 0.4, brightness: 0.75 },
      { du: 1.9, dv: -0.5, brightness: 0.9 },
      { du: 0.7, dv: -0.1, brightness: 0.5 },
    ],
    [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [3, 5]],
    0
  ),
];

// ── Lyra constellation — north pole region ──────────────────────────
// phi ≈ 0.3 rad from the north pole, a fixed direction in theta

export const LYRA_STARS_3D: ZodiacStar3D[] = (() => {
  const lyraR = R;
  const lyraPhi = 0.3;
  const lyraTheta = Math.PI / 4; // 45°

  // Vega is the primary star; the rest form the lyre shape
  const offsets: StarOffset[] = [
    { du: 0, dv: 0, brightness: 1 },       // Vega
    { du: -1.1, dv: 1.5, brightness: 0.7 }, // Sheliak
    { du: 1.1, dv: 1.5, brightness: 0.7 }, // Sulafat
    { du: -1.6, dv: 2.8, brightness: 0.6 }, // Delta Lyrae
    { du: 1.6, dv: 2.8, brightness: 0.6 }, // Zeta Lyrae
  ];

  return buildCluster(lyraR, lyraPhi, lyraTheta, offsets);
})();

export const LYRA_CONNECTIONS_3D: [number, number][] = [
  [0, 1], // Vega → Sheliak
  [0, 2], // Vega → Sulafat
  [1, 2], // Sheliak → Sulafat
  [1, 3], // Sheliak → Delta
  [2, 4], // Sulafat → Zeta
];

export const LYRA_CENTROID_3D: [number, number, number] = clusterCentroid(LYRA_STARS_3D);

// ── Helper functions ─────────────────────────────────────────────────

export function getZodiacById(id: string): ZodiacSign3D | undefined {
  return ZODIAC_SIGNS_3D.find((z) => z.id === id);
}

export function getZodiacCentroid3D(sign: ZodiacSign3D): [number, number, number] {
  return clusterCentroid(sign.stars);
}
