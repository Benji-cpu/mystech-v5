"use client";

import { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Palette,
  Share2,
  Menu,
  X,
  MessageCircle,
  Layers,
  Eye,
  Play,
  Star,
} from "lucide-react";

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
    icon: MessageCircle,
    title: "Tell Your Story",
    description: "Share your experiences through a guided conversation with our AI mystic.",
  },
  {
    icon: Layers,
    title: "Get Your Deck",
    description: "We transform your narrative into a personalized oracle card deck with unique artwork.",
  },
  {
    icon: Eye,
    title: "Discover Insights",
    description: "Draw cards for AI-powered readings that speak directly to your journey.",
  },
];

const galleryCards = [
  { numeral: "I", name: "The Journey" },
  { numeral: "II", name: "Inner Light" },
  { numeral: "III", name: "The River" },
  { numeral: "IV", name: "New Dawn" },
  { numeral: "V", name: "The Mirror" },
  { numeral: "VI", name: "Transformation" },
  { numeral: "VII", name: "The Guide" },
  { numeral: "VIII", name: "The Path" },
];

function FeatureScreenshot({ index }: { index: number }) {
  if (index === 0) {
    // Deck fan of cards
    return (
      <div className="mt-4 aspect-video rounded-lg bg-accent/30 border border-border/30 flex items-end justify-center pb-3 overflow-hidden">
        <div className="relative flex items-end">
          <div className="w-8 sm:w-10 aspect-[2/3] rounded-sm bg-gradient-to-b from-primary/15 to-primary/5 border border-primary/10 -rotate-12 origin-bottom translate-x-2" />
          <div className="w-8 sm:w-10 aspect-[2/3] rounded-sm bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/15 z-10 relative -mb-0.5" />
          <div className="w-8 sm:w-10 aspect-[2/3] rounded-sm bg-gradient-to-b from-primary/15 to-primary/5 border border-primary/10 rotate-12 origin-bottom -translate-x-2" />
        </div>
      </div>
    );
  }
  if (index === 1) {
    // Reading: card + flowing text
    return (
      <div className="mt-4 aspect-video rounded-lg bg-accent/30 border border-border/30 p-2.5 flex gap-2">
        <div className="w-1/3 rounded-md bg-gradient-to-b from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-primary/25" />
        </div>
        <div className="flex-1 flex flex-col gap-1 justify-center">
          <div className="h-1.5 w-3/4 rounded-full bg-primary/10" />
          <div className="h-1 w-full rounded-full bg-muted-foreground/[0.06]" />
          <div className="h-1 w-full rounded-full bg-muted-foreground/[0.06]" />
          <div className="h-1 w-2/3 rounded-full bg-muted-foreground/[0.06]" />
        </div>
      </div>
    );
  }
  if (index === 2) {
    // Style palette bubbles
    return (
      <div className="mt-4 aspect-video rounded-lg bg-accent/30 border border-border/30 flex flex-col items-center justify-center gap-2">
        <div className="flex gap-2">
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-violet-400/30 to-violet-600/20" />
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20" />
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-600/20" />
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-rose-400/30 to-rose-600/20" />
        </div>
        <div className="h-1 w-16 rounded-full bg-muted-foreground/[0.06]" />
      </div>
    );
  }
  // Share connections
  return (
    <div className="mt-4 aspect-video rounded-lg bg-accent/30 border border-border/30 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10" />
          <div className="h-px w-4 bg-primary/15" />
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10" />
          <div className="h-px w-4 bg-primary/15" />
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10" />
        </div>
        <span className="text-[8px] text-muted-foreground/30">Share with friends</span>
      </div>
    </div>
  );
}

export default function Mock3() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar — frosted glass */}
      <nav className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold tracking-wide">MysTech</span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Sign In</a>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-b border-border/30 bg-background/95 px-5 py-3 backdrop-blur-lg">
            {["Features", "Pricing", "Sign In"].map((item) => (
              <a
                key={item}
                href="#"
                className="block rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero — soft gradient, breathable spacing */}
      <section className="bg-gradient-to-b from-accent/40 via-background to-background px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI-Powered Oracle Cards
          </span>
          <h1 className="mt-5 sm:mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            Your life story,
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              revealed in cards
            </span>
            .
          </h1>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-lg mx-auto">
            Create personalized oracle card decks from your real experiences.
            Every card reflects your unique journey.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
            >
              Get Started Free
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              View Pricing
            </a>
          </div>
        </div>
        {/* Hero image — app dashboard mockup */}
        <div className="mx-auto max-w-4xl mt-12 sm:mt-16">
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/10 to-accent/30 border border-border/20 overflow-hidden p-4 sm:p-6 flex flex-col">
            {/* Mock app header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary/30" />
                <div className="h-1.5 w-12 rounded-full bg-foreground/10" />
              </div>
              <div className="flex gap-1.5">
                <div className="h-1.5 w-8 rounded-full bg-foreground/[0.06]" />
                <div className="h-1.5 w-8 rounded-full bg-foreground/[0.06]" />
              </div>
            </div>
            {/* Mock card grid */}
            <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {["The Journey", "Inner Light", "The River", "New Dawn", "The Mirror", "The Guide"].map((name, i) => (
                <div key={i} className="rounded-md bg-gradient-to-b from-accent/60 to-accent/20 border border-border/20 flex flex-col items-center justify-center p-1 gap-0.5">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary/20" />
                  <span className="text-[6px] sm:text-[7px] text-muted-foreground/40 text-center leading-tight">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar — soft pills */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5 rounded-full bg-accent/40 px-4 py-2">
            <Star className="h-3.5 w-3.5 fill-primary/50 text-primary/50" />
            <span className="text-xs text-muted-foreground">4.9/5 rating</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-accent/40 px-4 py-2">
            <span className="text-xs text-muted-foreground">2,400+ decks created</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-accent/40 px-4 py-2">
            <span className="text-xs text-muted-foreground">800+ active creators</span>
          </div>
        </div>
      </div>

      {/* Features — single column mobile, 2-col md, 4-col lg, large rounded cards */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Everything you need
          </p>
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-gradient-to-br from-accent/60 to-accent/20 p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mt-3 text-base font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <FeatureScreenshot index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — vertical timeline mobile, 3-col desktop */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            How it works
          </p>

          {/* Mobile: vertical timeline */}
          <div className="sm:hidden relative mt-6">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={step.title} className="relative flex gap-5 pl-1">
                  <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-background">
                    <span className="text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <div className="pt-0.5">
                    <div className="flex items-center gap-2">
                      <step.icon
                        className="h-4 w-4 text-primary/60"
                        strokeWidth={1.5}
                      />
                      <h3 className="text-base font-semibold">{step.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: horizontal 3-col steps */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-6 mt-8">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl bg-gradient-to-br from-accent/50 to-accent/10 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30 bg-background">
                  <span className="text-sm font-bold text-primary">{i + 1}</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <step.icon className="h-4 w-4 text-primary/60" strokeWidth={1.5} />
                  <h3 className="text-base font-semibold">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase — video placeholder + card gallery */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            See it in action
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Watch how a deck comes to life from your story.
          </p>

          {/* Video placeholder */}
          <div className="mt-6 aspect-video rounded-2xl bg-accent/30 border border-border/40 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Poster background — subtle card grid */}
            <div className="absolute inset-0 opacity-30 p-6 sm:p-10 grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-md bg-accent/40" />
              ))}
            </div>
            {/* Play button + title */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/10">
                <Play className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-foreground/70">Deck Creation Walkthrough</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground/50 mt-0.5">2:34</p>
              </div>
            </div>
          </div>

          {/* Card gallery */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryCards.map((card) => (
              <div
                key={card.numeral}
                className="aspect-[2/3] rounded-xl bg-gradient-to-b from-accent/60 to-accent/20 border border-border/20 flex flex-col items-center justify-between py-4 sm:py-5 px-3"
              >
                <span className="text-[9px] tracking-[0.2em] text-muted-foreground/30 font-medium">{card.numeral}</span>
                <div className="flex flex-col items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary/20" />
                  <div className="h-px w-8 bg-border/30" />
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/50 text-center leading-tight">{card.name}</span>
                  <div className="h-px w-8 bg-border/30" />
                </div>
                <span className="text-[9px] tracking-[0.2em] text-muted-foreground/30 font-medium rotate-180">{card.numeral}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — gradient section */}
      <section className="bg-gradient-to-b from-background via-accent/30 to-background px-4 sm:px-6 py-16 sm:py-20 lg:py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to discover your cards?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Start free. No credit card required.
          </p>
          <div className="mt-8">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
            >
              Create Your Deck
            </a>
          </div>
        </div>
      </section>

      {/* Footer — spacious, centered */}
      <footer className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4">
          <div className="h-px w-16 bg-border/40" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">MysTech</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2025 MysTech. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
