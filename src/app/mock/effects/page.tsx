import Link from "next/link";

const experiences = [
  {
    slug: "background-moods",
    title: "Background Moods",
    icon: "🌌",
    description:
      "Interactive mood selector — buttons for preset moods (default, reading-setup, card-draw, card-reveal, forging, completion). Background smoothly transitions between them via the MockImmersiveProvider.",
    tags: ["Mood System", "Nebula Shader", "Hue Shift", "Interactive"],
  },
  {
    slug: "transition-library",
    title: "Transition Library",
    icon: "↝",
    description:
      "Complete showcase of 37+ card transitions across 5 categories — CSS, Framer Motion, React Spring, GSAP, and creative effects. Plus a journey simulation chaining 5 transitions in sequence.",
    tags: ["37+ Transitions", "5 Categories", "Journey Simulation", "Side-by-Side"],
  },
];

export default function EffectsHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-lg">
            ⚗
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Shared Effects
          </h1>
        </div>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Infrastructure demos — background mood system and the complete transition library. These effects power the reading and creation flows.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/mock/effects/${exp.slug}`}
              className="block rounded-xl border border-border p-5 transition-colors hover:border-blue-400/40 hover:bg-accent/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xl">
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
                    className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-400"
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
