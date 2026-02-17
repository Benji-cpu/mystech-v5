import Link from "next/link";

const experiences = [
  {
    slug: "simple",
    title: "Simple Create Ceremony",
    icon: "⚡",
    description:
      "One-shot deck creation — glass card form morphs into generation container, cards materialize one-by-one with stardust gather and spring bounce. Background intensifies per card.",
    tags: ["Form Morph", "Stardust Gather", "Progress Counter", "layoutId"],
  },
  {
    slug: "journey",
    title: "Journey Conversation",
    icon: "⚗",
    description:
      "Pre-scripted auto-playing AI conversation with visual theme accumulation — floating labeled orbs orbit with spring physics, SVG constellation lines connect related themes, golden aura builds as readiness grows.",
    tags: ["Theme Orbs", "Constellation", "Spring Physics", "Auto-Play"],
  },
  {
    slug: "forging",
    title: "Card Forging Ceremony",
    icon: "🔥",
    description:
      "Post-conversation card creation — theme orbs merge via portal vortex, cards forge from center with reversed stardust gather, sequential golden unfold reveals, celebration particles.",
    tags: ["Portal Vortex", "Reversed Stardust", "Golden Unfold", "Celebration"],
  },
];

export default function CreationHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-lg">
            ⚗
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Deck Creation
          </h1>
        </div>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Prototypes for deck creation flows — from simple one-shot generation to the full AI conversation journey and card forging ceremony.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/mock/creation/${exp.slug}`}
              className="block rounded-xl border border-border p-5 transition-colors hover:border-purple-400/40 hover:bg-accent/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-xl">
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
                    className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-medium text-purple-400"
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
