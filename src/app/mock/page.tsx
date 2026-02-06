import Link from "next/link";

const mocks = [
  {
    num: 1,
    title: "Co-Star Minimal",
    description:
      "Ultra-minimalist black & white with editorial typography. Stark, confident — text does the heavy lifting. Inspired by Co-Star Astrology.",
    traits: ["Sparse density", "No cards or borders", "Large editorial type", "Single column", "B&W + minimal gold"],
  },
  {
    num: 2,
    title: "Golden Thread",
    description:
      "Dark backgrounds with warm gold foil accents. Card-focused layouts that echo actual card handling. Inspired by Labyrinthos / Golden Thread Tarot.",
    traits: ["Dense layout", "Gold borders & accents", "2-col feature grid", "Horizontal scroll steps", "Drawer menu"],
  },
  {
    num: 3,
    title: "Calm Premium",
    description:
      "Spacious, gradient-rich, premium breathable layouts. Lots of air between elements. Inspired by Calm & Headspace.",
    traits: ["Medium density", "Large rounded cards", "Purple gradients", "Vertical timeline", "Frosted glass nav"],
  },
  {
    num: 4,
    title: "Hybrid",
    description:
      "Combines original page's clean section titles with Calm Premium's rounded cards and gradient styling. Best of both approaches.",
    traits: ["Original titles", "Calm card style", "2-col hero", "No trust bar", "Gradient CTA"],
  },
];

export default function MockIndex() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Landing Page Style Mocks</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          3 landing page approaches. Each is fully responsive — compare at 375px, 768px, and 1280px+. Pick your favorite.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {mocks.map((mock) => (
            <Link
              key={mock.num}
              href={`/mock/${mock.num}`}
              className="block rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {mock.num}
                </span>
                <h2 className="text-base font-semibold">{mock.title}</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {mock.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mock.traits.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Use the bottom tab bar to switch between mocks quickly.
        </p>
      </div>
    </div>
  );
}
