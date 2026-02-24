import Link from "next/link";

const categories = [
  {
    href: "/mock/approved",
    title: "Approved Mocks",
    description:
      "Reference implementations approved for production — full app navigation, reading flow, background system, card morph techniques, and Lyra journey.",
    count: 5,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    href: "/mock/full",
    title: "Full App Mock",
    description:
      "10-screen app mocks exploring different navigation patterns (sidebar, constellation, floor stack) and visual themes.",
    count: 7,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    color: "border-[#c9a94e]/30 bg-[#c9a94e]/5 hover:border-[#c9a94e]/50 hover:bg-[#c9a94e]/10",
    iconBg: "bg-[#c9a94e]/10 text-[#c9a94e]",
  },
  {
    href: "/mock/transitions",
    title: "Transition Explorers",
    description:
      "Side-by-side comparison tools for animation techniques — container morphs, mirror frame transitions, 3D shader effects.",
    count: 5,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    color: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10",
    iconBg: "bg-emerald-500/10 text-emerald-400",
  },
  {
    href: "/mock/lyra",
    title: "Lyra Guide",
    description:
      "Lyra AI guide prototypes — zodiac constellation flows in 2D SVG, 3D Three.js, and persistent shell architectures.",
    count: 5,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    color: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10",
    iconBg: "bg-amber-500/10 text-amber-400",
  },
];

const deepDives = [
  {
    href: "/mock/reading/ceremony-v2",
    title: "Reading Ceremony V2",
    description:
      "6-phase ceremonial reading with portal vortex, GSAP deck deal, stardust particle gather, golden origami unfold, and clip-path text reveal.",
    tags: ["Portal Vortex", "GSAP Deal", "Stardust Canvas", "Golden Unfold"],
  },
  {
    href: "/mock/navigation",
    title: "Navigation & Transitions",
    description:
      "Fluid page-to-page navigation with shared element layoutId morphs, route-based mood shifts, stagger choreography, and immersive overlay entry.",
    tags: ["layoutId Morph", "Mood Shifts", "Stagger", "Overlay"],
  },
  {
    href: "/mock/lyra/integrated",
    title: "Lyra Integrated Companion",
    description:
      "Lyra weaving through 4 app moments — dashboard greeting, reading narration, journey chat with anchors, and milestone celebration.",
    tags: ["Canvas Sigil", "Typewriter", "Anchor Strip", "Celebration"],
  },
];

export default function MockHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mock Hub</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Immersive flow prototypes — approved references, full app mocks, transition explorers, and Lyra constellation guides.
        </p>

        {/* Deep Dives — newest experiments */}
        <div className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-widest text-[#c9a94e] mb-3">Deep Dives</h2>
          <div className="grid grid-cols-1 gap-3">
            {deepDives.map((dd) => (
              <Link
                key={dd.href}
                href={dd.href}
                className="block rounded-xl border border-[#c9a94e]/30 bg-[#c9a94e]/5 p-4 transition-colors hover:border-[#c9a94e]/50 hover:bg-[#c9a94e]/10"
              >
                <h3 className="text-base font-semibold">{dd.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{dd.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {dd.tags.map((tag) => (
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

        <div className="mt-8 grid grid-cols-1 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`block rounded-xl border p-5 transition-colors ${cat.color}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cat.iconBg}`}>
                  {cat.icon}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{cat.title}</h2>
                  <span className="text-xs text-muted-foreground">
                    {cat.count} {cat.count === 1 ? "experience" : "experiences"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Use the bottom tab bar to switch between categories.
        </p>
      </div>
    </div>
  );
}
