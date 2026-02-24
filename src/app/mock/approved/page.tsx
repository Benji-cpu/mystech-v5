import Link from "next/link";

const experiences = [
  {
    slug: "v1",
    title: "Full App — Floor Stack Nav",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    description:
      "10-screen app mock with vertical floor-stacking navigation. Floors slide up/down with spring physics. Tab bar + desktop spine. Framer Motion LayoutGroup.",
    tags: ["Full App", "10 Screens", "Floor Stack Nav", "Framer Motion"],
  },
  {
    slug: "ceremony",
    title: "Reading Flow — Persistent Shell",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    description:
      "Persistent shell with 3 resizing zones. 4 spread layouts (1/3/5/10 cards), 3D card flip, sequential reveal timing, streamed interpretation text. Framer Motion + useReducer state machine.",
    tags: ["Persistent Shell", "3 Zones", "4 Spreads", "useReducer"],
  },
  {
    slug: "background-moods",
    title: "Background — Mood Preset Switcher",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    description:
      "Nebula background with 7 mood presets. Click to smoothly transition hue + sparkle color. Shows current mood state. Framer Motion + MockImmersiveProvider.",
    tags: ["Background System", "7 Mood Presets", "Nebula", "MockImmersiveProvider"],
  },
  {
    slug: "card-morph",
    title: "Card Morph — 10 Techniques Picker",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    description:
      "Single card morphs between states using 10 different techniques. Picker UI for technique + stage. Framer Motion spring, GSAP timeline, Flubber SVG, CSS clip-path, Canvas shatter, React Spring blobs, CSS 3D fold, displacement wave.",
    tags: ["10 Techniques", "Picker UI", "Framer Motion", "GSAP"],
  },
  {
    slug: "lyra-journey",
    title: "Streamlined Journey — 4 Phases, Auto-Play",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    description:
      "Simplified 4-phase flow. Zodiac picker, auto-playing conversation that births anchor stars, 3-card reading, completion summary. Anchor strip UI. Canvas + Framer Motion.",
    tags: ["4 Phases", "Auto-Play", "Anchor Strip", "Canvas"],
  },
];

export default function ApprovedMocksPage() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Approved Mocks
          </h1>
        </div>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Reference implementations approved for production — full app navigation, reading flow, background system, card morph techniques, and Lyra journey.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/mock/approved/${exp.slug}`}
              className="block rounded-xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary"
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
