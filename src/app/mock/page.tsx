import Link from "next/link";

const categories = [
  {
    href: "/mock/reading",
    title: "Reading Ceremony",
    description:
      "Full reading ceremony flow prototypes — spread selection, card drawing with deck-deal arcs, sequential card reveals with golden unfold, and AI interpretation streaming.",
    count: 3,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    color: "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    href: "/mock/creation",
    title: "Deck Creation",
    description:
      "Deck creation flow prototypes — simple one-shot generation, AI conversation journey with floating theme orbs, and post-conversation card forging ceremony.",
    count: 3,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50 hover:bg-purple-500/10",
    iconBg: "bg-purple-500/10 text-purple-400",
  },
  {
    href: "/mock/effects",
    title: "Shared Effects",
    description:
      "Infrastructure demos — background mood shifting system and the complete 37+ transition showcase across CSS, Framer Motion, React Spring, GSAP, and creative effects.",
    count: 2,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 hover:bg-blue-500/10",
    iconBg: "bg-blue-500/10 text-blue-400",
  },
];

export default function MockHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mock Hub</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Immersive flow prototypes — reading ceremonies, deck creation journeys, and shared animation effects.
        </p>

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
