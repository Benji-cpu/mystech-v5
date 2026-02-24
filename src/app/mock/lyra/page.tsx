import Link from "next/link";

const experiences = [
  {
    slug: "integrated",
    title: "Integrated Companion — 4 App Moments",
    icon: "\u2726",
    description:
      "Lyra woven through 4 real app contexts: dashboard greeting, reading narration, journey chat with anchor strip, and milestone celebration. Persistent shell pattern, canvas sigil, typewriter speech, spring physics throughout.",
    tags: ["Integrated", "4 Moments", "Persistent Shell", "Canvas Sigil"],
  },
  {
    slug: "v1",
    title: "Zodiac Sky 2D — SVG + Canvas, 5 Phases",
    icon: "\u2726",
    description:
      "2D SVG star sky. Pick zodiac sign, Lyra awakens with golden thread, gather theme stars into sub-constellations, view star map, 3-card reading mapped to stars. SVG stroke animations + Canvas particles.",
    tags: ["2D SVG", "Canvas Particles", "Golden Threads", "5 Phases"],
  },
  {
    slug: "v2",
    title: "Zodiac Sky 3D — React Three Fiber, 4 Phases",
    icon: "\u2734",
    description:
      "Full 3D orbitable star sphere. Tap zodiac constellations, ignite theme stars with particle bursts, golden threads in 3D, holographic card flip. R3F + Bloom + Vignette post-processing. Touch orbit + pinch zoom.",
    tags: ["React Three Fiber", "3D Orbit", "Bloom", "4 Phases"],
  },
  {
    slug: "v3",
    title: "Full Lyra Journey — 7 Phases, Canvas Star Map",
    icon: "\u2728",
    description:
      "Most feature-complete version. 7 phases with persistent shell, canvas star map, chat-driven star births, 3-card reading, constellation history timeline. Bottom nav strip. Canvas + Framer Motion + MockImmersiveShell.",
    tags: ["7 Phases", "Canvas Star Map", "Persistent Shell", "Chat-Driven"],
  },
  {
    slug: "v4",
    title: "Streamlined Journey V4 — 4 Phases, Auto-Play",
    icon: "\u2605",
    description:
      "Simplified 4-phase version: zodiac selection, chat with anchor extraction, 3-card reading, completion. Persistent shell with zone-resize animations, anchor strip with readiness meter, sequential card flips, streaming interpretation. Fully auto-plays.",
    tags: ["4 Phases", "Auto-Play", "Anchor Strip", "Streaming"],
  },
  {
    slug: "/mock/full/v9",
    title: "Journey Shell — 5 Phases, GSAP + Canvas Particles",
    icon: "\u2728",
    description:
      "Persistent shell with animated zone proportions. 5 phases (awakening→gathering→creation→revelation→return). SVG constellation + golden thread + canvas particles. GSAP + Framer Motion + React Spring.",
    tags: ["Persistent Shell", "5 Phases", "GSAP", "SVG Constellation"],
    isExternal: true,
  },
];

export default function LyraHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a94e]/10 text-lg">
            {"\u2726"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Lyra Guide
          </h1>
        </div>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Lyra AI guide prototypes — zodiac constellation flows in 2D SVG, 3D Three.js, and persistent shell architectures.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={"isExternal" in exp && exp.isExternal ? exp.slug : `/mock/lyra/${exp.slug}`}
              className="block rounded-xl border border-border p-5 transition-colors hover:border-[#c9a94e]/40 hover:bg-[#c9a94e]/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c9a94e]/10 text-xl text-[#c9a94e]">
                  {exp.icon}
                </span>
                <h2 className="text-lg font-semibold">{exp.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exp.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#c9a94e]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#c9a94e]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
