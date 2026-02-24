import Link from "next/link";

const mocks = [
  {
    id: "v2",
    name: "Container Morph — 8 Transitions x 8 Containers",
    description:
      "Card in decorative containers with auto-cycle. 8 transition types (R3F shaders, Canvas displacement, Flubber SVG, 3D flip) x 8 container styles x 8 content states. React Three Fiber + Canvas + Flubber.",
  },
  {
    id: "v3",
    name: "Mirror Transitions — 15 DOM Effects",
    description:
      "Decorative mirror frame with 15 transition effects between content. CSS, Framer Motion, React Spring, GSAP, SVG, Canvas 2D, WebGL. Keyboard controls (Space/Arrows/R/A). All DOM-based, no Three.js.",
  },
  {
    id: "v4",
    name: "Mirror Transitions V2 — Full Control Panel",
    description:
      "Enhanced mirror explorer with tabbed control panel. 12 frames x 14 effects x 10 content views. Framer Motion, CSS, GSAP, Canvas, WebGL shaders, React Spring, Flubber.",
  },
  {
    id: "v5",
    name: "3D Mirror — Three.js Shader Transitions",
    description:
      "Three.js 3D scene with floating mirror. Texture-based transitions using GLSL shaders. Multiple 3D mirror styles. React Three Fiber + WebGL.",
  },
  {
    id: "v6",
    name: "Page Transitions — GSAP Multi-Layer",
    description:
      "Full-page transitions between views using GSAP timelines. Multi-layer system: SVG filters + atmosphere + effects + content layers. State machine with transition engine.",
  },
  {
    id: "v7",
    name: "Aurora Journey Shell",
    description:
      "Full-app flow prototype with aurora-themed transitions and atmospheric effects. Re-exports from mock/full/v10.",
  },
];

export default function TransitionsIndexPage() {
  return (
    <div className="min-h-screen bg-[#0a0118] p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white/90">
            Transition Explorers
          </h1>
          <p className="text-white/50 text-sm">
            Interactive playgrounds for comparing animation techniques — morph explorers, mirror frames, and fluid effects side by side.
          </p>
        </div>

        <div className="space-y-3">
          {mocks.map((mock) => (
            <Link
              key={mock.id}
              href={`/mock/transitions/${mock.id}`}
              className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-[#c9a94e]/30 transition-all group shadow-lg shadow-purple-900/20"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white/90 group-hover:text-[#c9a94e] transition-colors">
                    {mock.name}
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    {mock.description}
                  </p>
                </div>
                <span className="text-white/20 text-xl group-hover:text-[#c9a94e] transition-colors shrink-0">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
