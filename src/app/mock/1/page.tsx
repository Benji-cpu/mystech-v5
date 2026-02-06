import { Sparkles, BookOpen, Palette, Share2, Star, Users } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Personalized Decks",
    description:
      "Each card is born from your experiences. No generic meanings — every symbol reflects your actual life.",
  },
  {
    icon: BookOpen,
    title: "AI-Powered Readings",
    description:
      "Draw cards and receive deeply personal interpretations that connect your past to your present.",
  },
  {
    icon: Palette,
    title: "Custom Art Styles",
    description:
      "Choose from hand-crafted visual styles or create your own. Your deck, your aesthetic.",
  },
  {
    icon: Share2,
    title: "Share & Connect",
    description:
      "Share readings with friends. Trade art styles with other creators. Build a community.",
  },
];

const steps = [
  {
    num: "1",
    title: "Tell your story",
    description:
      "Share your experiences through a guided conversation with our AI mystic.",
  },
  {
    num: "2",
    title: "Get your deck",
    description:
      "We transform your narrative into a personalized oracle card deck with unique artwork.",
  },
  {
    num: "3",
    title: "Discover insights",
    description:
      "Draw cards for AI-powered readings that speak directly to your journey.",
  },
];

const galleryCards = [
  { numeral: "I", name: "The Journey" },
  { numeral: "II", name: "The Mirror" },
  { numeral: "III", name: "The Flame" },
  { numeral: "IV", name: "Inner Light" },
  { numeral: "V", name: "The River" },
  { numeral: "VI", name: "New Dawn" },
];

function FeatureScreenshot({ index }: { index: number }) {
  if (index === 0) {
    // Deck grid
    return (
      <div className="mt-4 ml-9 aspect-video rounded-lg bg-foreground/[0.03] border border-border/20 p-2.5 sm:p-3">
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 h-full">
          {Array.from({ length: 8 }).map((_, j) => (
            <div key={j} className="rounded-sm bg-foreground/[0.06] border border-border/10" />
          ))}
        </div>
      </div>
    );
  }
  if (index === 1) {
    // Reading layout: card + text
    return (
      <div className="mt-4 ml-9 aspect-video rounded-lg bg-foreground/[0.03] border border-border/20 p-2.5 sm:p-3 flex gap-2 sm:gap-3">
        <div className="w-1/3 rounded-sm bg-foreground/[0.06] border border-border/10" />
        <div className="flex-1 flex flex-col gap-1.5 justify-center">
          <div className="h-1.5 w-3/4 rounded-full bg-foreground/[0.08]" />
          <div className="h-1.5 w-full rounded-full bg-foreground/[0.05]" />
          <div className="h-1.5 w-full rounded-full bg-foreground/[0.05]" />
          <div className="h-1.5 w-2/3 rounded-full bg-foreground/[0.05]" />
          <div className="mt-1 h-1.5 w-1/2 rounded-full bg-foreground/[0.03]" />
        </div>
      </div>
    );
  }
  if (index === 2) {
    // Art style swatches
    return (
      <div className="mt-4 ml-9 aspect-video rounded-lg bg-foreground/[0.03] border border-border/20 p-2.5 sm:p-3 flex flex-col justify-center gap-2">
        <div className="flex gap-2 justify-center">
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-violet-500/20 border border-violet-500/20" />
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-amber-500/20 border border-amber-500/20" />
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-emerald-500/20 border border-emerald-500/20" />
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-rose-500/20 border border-rose-500/20" />
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-sky-500/20 border border-sky-500/20" />
        </div>
        <div className="h-1.5 w-1/2 mx-auto rounded-full bg-foreground/[0.05]" />
      </div>
    );
  }
  // Share / community
  return (
    <div className="mt-4 ml-9 aspect-video rounded-lg bg-foreground/[0.03] border border-border/20 p-2.5 sm:p-3 flex flex-col justify-center gap-2">
      <div className="flex items-center gap-2 mx-auto">
        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-foreground/[0.08]" />
        <div className="h-px w-4 sm:w-6 bg-foreground/[0.1]" />
        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-foreground/[0.08]" />
        <div className="h-px w-4 sm:w-6 bg-foreground/[0.1]" />
        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-foreground/[0.08]" />
      </div>
      <div className="flex gap-1.5 justify-center">
        <div className="h-1 w-8 rounded-full bg-foreground/[0.05]" />
        <div className="h-1 w-8 rounded-full bg-foreground/[0.05]" />
        <div className="h-1 w-8 rounded-full bg-foreground/[0.05]" />
      </div>
    </div>
  );
}

export default function Mock1() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar — ultra minimal */}
      <nav className="border-b border-border/30 px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="text-sm font-semibold tracking-widest uppercase">
            MysTech
          </span>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Sign In</a>
          </div>
          {/* Mobile nav */}
          <a
            href="#"
            className="md:hidden text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero — editorial, large type, stark */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Your life story,
              <br />
              revealed in cards.
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-lg">
              AI-powered oracle cards made from your experiences. No generic meanings — every card reflects your actual life.
            </p>
            <div className="mt-8 sm:mt-10">
              <a
                href="#"
                className="inline-block border border-foreground bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
              >
                Get Started Free
              </a>
            </div>
          </div>
          {/* Hero image — 3-card spread */}
          <div className="mt-10 lg:mt-0">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.07] border border-border/20 relative overflow-hidden flex items-end justify-center pb-8 sm:pb-10">
              {/* Decorative dots */}
              <div className="absolute top-4 left-4 flex gap-1">
                <div className="h-1 w-1 rounded-full bg-foreground/10" />
                <div className="h-1 w-1 rounded-full bg-foreground/10" />
                <div className="h-1 w-1 rounded-full bg-foreground/10" />
              </div>
              {/* Card spread */}
              <div className="relative flex items-end">
                <div className="w-16 sm:w-20 aspect-[2/3] rounded-md border border-border/30 bg-background/80 shadow-sm -rotate-12 origin-bottom translate-x-3 flex flex-col items-center justify-between py-2 sm:py-3">
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground/30">III</span>
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground/40 font-medium">The Flame</span>
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground/30">III</span>
                </div>
                <div className="w-16 sm:w-20 aspect-[2/3] rounded-md border border-border/40 bg-background shadow-md z-10 relative -mb-1 flex flex-col items-center justify-between py-2 sm:py-3">
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground/30">I</span>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-px w-5 bg-border/40" />
                    <span className="text-[7px] sm:text-[8px] text-muted-foreground/60 font-medium">The Journey</span>
                    <div className="h-px w-5 bg-border/40" />
                  </div>
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground/30">I</span>
                </div>
                <div className="w-16 sm:w-20 aspect-[2/3] rounded-md border border-border/30 bg-background/80 shadow-sm rotate-12 origin-bottom -translate-x-3 flex flex-col items-center justify-between py-2 sm:py-3">
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground/30">V</span>
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground/40 font-medium">The River</span>
                  <span className="text-[7px] sm:text-[8px] text-muted-foreground/30">V</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y border-border/20 px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-foreground/40 text-foreground/40" />
            <Star className="h-3 w-3 fill-foreground/40 text-foreground/40" />
            <Star className="h-3 w-3 fill-foreground/40 text-foreground/40" />
            <Star className="h-3 w-3 fill-foreground/40 text-foreground/40" />
            <Star className="h-3 w-3 fill-foreground/40 text-foreground/40" />
            <span className="ml-1.5">4.9/5 rating</span>
          </div>
          <span className="hidden sm:inline text-border">|</span>
          <span className="hidden sm:inline">2,400+ decks created</span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="hidden sm:inline flex items-center gap-1"><Users className="h-3 w-3" /> 800+ creators</span>
        </div>
      </div>

      {/* Features — single column mobile, 2-col desktop, flat */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            What you get
          </p>
          <div className="mt-10 sm:grid sm:grid-cols-2 sm:gap-x-12 sm:gap-y-10 space-y-10 sm:space-y-0">
            {features.map((feature, index) => (
              <div key={feature.title}>
                <div className="flex gap-4">
                  <feature.icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <FeatureScreenshot index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-4 sm:mx-6 max-w-5xl lg:mx-auto border-t border-border/20" />

      {/* How it works — numbered list mobile, 3-col desktop */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <div className="mt-10 sm:grid sm:grid-cols-3 sm:gap-10 space-y-10 sm:space-y-0">
            {steps.map((step) => (
              <div key={step.num}>
                <span className="text-3xl font-bold text-foreground/20">
                  {step.num}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-4 sm:mx-6 max-w-5xl lg:mx-auto border-t border-border/20" />

      {/* Showcase — card gallery */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Your cards, your story
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Every deck is as unique as the person who creates it.
          </p>
          <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {galleryCards.map((card) => (
              <div
                key={card.numeral}
                className="aspect-[2/3] rounded-lg bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.02] border border-border/20 flex flex-col items-center justify-between py-3 sm:py-4 px-2"
              >
                <span className="text-[8px] tracking-[0.2em] text-muted-foreground/30 font-medium">{card.numeral}</span>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-px w-5 bg-border/30" />
                  <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground/50 text-center leading-tight">{card.name}</span>
                  <div className="h-px w-5 bg-border/30" />
                </div>
                <span className="text-[8px] tracking-[0.2em] text-muted-foreground/30 font-medium rotate-180">{card.numeral}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-4 sm:mx-6 max-w-5xl lg:mx-auto border-t border-border/20" />

      {/* CTA — simple, generous whitespace */}
      <section className="px-4 sm:px-6 py-20 sm:py-24 lg:py-28 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to begin?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Create your first deck in minutes. Free to start.
          </p>
          <div className="mt-8">
            <a
              href="#"
              className="inline-block border border-foreground bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              Create Your Deck
            </a>
          </div>
        </div>
      </section>

      {/* Footer — minimal */}
      <footer className="border-t border-border/20 px-4 sm:px-6 py-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 MysTech. All rights reserved.
          </p>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
