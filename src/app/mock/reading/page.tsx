import Link from "next/link";

const experiences = [
  {
    slug: "ceremony",
    title: "Full Reading Ceremony",
    icon: "✧",
    description:
      "The flagship mock — complete reading flow from spread selection through card drawing, sequential reveals with golden unfold, to AI interpretation streaming. Full state machine with background mood shifts.",
    tags: ["State Machine", "Card Reveal", "Mood Shifts", "Interpretation"],
  },
  {
    slug: "materialization",
    title: "Card Materialization",
    icon: "✦",
    description:
      "Focused demo of card materialization — stardust particles converge to form card borders, then spring-flip reveals the card face. 3 cards in sequence with useCardReveal.",
    tags: ["Stardust Gather", "Spring Flip", "Canvas Particles", "Sequential"],
  },
  {
    slug: "phase-transitions",
    title: "Phase Transitions",
    icon: "↝",
    description:
      "Three side-by-side demos showing between-phase transitions: setup dissolving into draw, golden wave triggering reveals, and cards morphing to compact layout for interpretation.",
    tags: ["Smoke Dissolve", "Golden Wave", "Layout Morph", "Comparison"],
  },
];

export default function ReadingHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">
            ✧
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Reading Ceremony
          </h1>
        </div>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Prototypes for the reading flow — the emotional climax of the app. From spread selection through card reveal to AI interpretation.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/mock/reading/${exp.slug}`}
              className="block rounded-xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">
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
