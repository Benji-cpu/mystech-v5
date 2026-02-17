import Link from "next/link";

const experiments = [
  {
    slug: "holographic",
    title: "Holographic Cards",
    icon: "✦",
    description:
      "Custom GLSL iridescent shader, fresnel edge glow, GPU particle auras, spring-physics tilt, and 3D card flip with bloom post-processing.",
    tags: ["GLSL Shader", "GPU Particles", "Bloom", "Spring Physics"],
  },
  {
    slug: "ambient",
    title: "Ambient Background",
    icon: "◉",
    description:
      "Multi-layer living background with FBM nebula shader, thousands of GPU stars, volumetric sparkle fog, floating card, and mouse-reactive parallax.",
    tags: ["FBM Noise", "Star Field", "Parallax", "Vignette"],
  },
  {
    slug: "forging",
    title: "Deck Forging Ceremony",
    icon: "⚗",
    description:
      "Three-phase orchestrated ceremony — card summoning with particle convergence, reveal shader illumination, and bloom burst completion with camera orbit.",
    tags: ["State Machine", "Reveal Shader", "Camera Animation", "Particles"],
  },
];

export default function LabHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-lg">
            🔬
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Immersive Experience Lab
          </h1>
        </div>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Three.js / React Three Fiber experiments for holographic cards, ambient backgrounds, and deck forging ceremonies. Real 3D shaders, GPU particles, and bloom post-processing.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {experiments.map((exp) => (
            <Link
              key={exp.slug}
              href={`/mock/lab/${exp.slug}`}
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

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Use the bottom tab bar to switch between experiments. All scenes use Leva controls for real-time tweaking.
        </p>
      </div>
    </div>
  );
}
