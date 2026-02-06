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
  Star,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Personal Decks",
    description: "Cards born from your real experiences",
  },
  {
    icon: BookOpen,
    title: "AI Readings",
    description: "Deeply personal interpretations",
  },
  {
    icon: Palette,
    title: "Art Styles",
    description: "Choose or create your aesthetic",
  },
  {
    icon: Share2,
    title: "Share & Trade",
    description: "Connect with other creators",
  },
];

const steps = [
  {
    icon: MessageCircle,
    num: "01",
    title: "Share Your Story",
    description: "Chat with our AI mystic about your life experiences and what matters to you.",
  },
  {
    icon: Layers,
    num: "02",
    title: "Receive Your Deck",
    description: "Watch as your narrative becomes a personalized oracle card deck with unique art.",
  },
  {
    icon: Eye,
    num: "03",
    title: "Get Insights",
    description: "Draw cards for readings that speak directly to your journey and path forward.",
  },
];

const galleryCards = [
  { numeral: "I", name: "The Wanderer" },
  { numeral: "II", name: "The Flame" },
  { numeral: "III", name: "The Moon" },
  { numeral: "IV", name: "The Bridge" },
  { numeral: "V", name: "The Storm" },
  { numeral: "VI", name: "Quiet Strength" },
  { numeral: "VII", name: "The Guide" },
  { numeral: "VIII", name: "New Dawn" },
];

function FeatureScreenshot({ index }: { index: number }) {
  if (index === 0) {
    // Mini card stack
    return (
      <div className="mt-3 aspect-video rounded-md bg-primary/[0.04] border border-primary/10 p-2 flex items-center justify-center gap-1.5">
        {Array.from({ length: 4 }).map((_, j) => (
          <div key={j} className="w-1/5 aspect-[2/3] rounded-sm bg-primary/10 border border-primary/15" />
        ))}
      </div>
    );
  }
  if (index === 1) {
    // Reading: card + interpretation lines
    return (
      <div className="mt-3 aspect-video rounded-md bg-primary/[0.04] border border-primary/10 p-2 flex gap-2">
        <div className="w-1/3 rounded-sm bg-primary/10 border border-primary/15 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-primary/20" />
        </div>
        <div className="flex-1 flex flex-col gap-1 justify-center">
          <div className="h-1 w-3/4 rounded-full bg-primary/10" />
          <div className="h-1 w-full rounded-full bg-primary/[0.07]" />
          <div className="h-1 w-full rounded-full bg-primary/[0.07]" />
          <div className="h-1 w-1/2 rounded-full bg-primary/[0.07]" />
        </div>
      </div>
    );
  }
  if (index === 2) {
    // Style swatches
    return (
      <div className="mt-3 aspect-video rounded-md bg-primary/[0.04] border border-primary/10 p-2 flex flex-col items-center justify-center gap-1.5">
        <div className="flex gap-1.5">
          <div className="h-5 w-5 rounded-full bg-amber-500/25 border border-amber-500/20" />
          <div className="h-5 w-5 rounded-full bg-violet-500/25 border border-violet-500/20" />
          <div className="h-5 w-5 rounded-full bg-emerald-500/25 border border-emerald-500/20" />
          <div className="h-5 w-5 rounded-full bg-rose-500/25 border border-rose-500/20" />
        </div>
        <div className="h-1 w-2/3 rounded-full bg-primary/[0.07]" />
      </div>
    );
  }
  // Share network
  return (
    <div className="mt-3 aspect-video rounded-md bg-primary/[0.04] border border-primary/10 p-2 flex items-center justify-center">
      <div className="flex items-center gap-1.5">
        <div className="h-4 w-4 rounded-full bg-primary/15 border border-primary/10" />
        <div className="h-px w-3 bg-primary/15" />
        <div className="h-4 w-4 rounded-full bg-primary/15 border border-primary/10" />
        <div className="h-px w-3 bg-primary/15" />
        <div className="h-4 w-4 rounded-full bg-primary/15 border border-primary/10" />
      </div>
    </div>
  );
}

export default function Mock2() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar — dark with gold accent */}
      <nav className="border-b border-primary/10 bg-background/95 px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold tracking-wide text-primary">
              MysTech
            </span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-primary/60 transition-colors hover:text-primary">Features</a>
            <a href="#" className="text-sm text-primary/60 transition-colors hover:text-primary">Pricing</a>
            <a href="#" className="text-sm text-primary/60 transition-colors hover:text-primary">Sign In</a>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="md:hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="md:hidden mt-3 space-y-1 border-t border-primary/10 pt-3 max-w-6xl mx-auto">
            {["Features", "Pricing", "Sign In"].map((item) => (
              <a
                key={item}
                href="#"
                className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero — warm gold accents, pill badge */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              AI-Powered Oracle Cards
            </span>
            <h1 className="mt-4 sm:mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Your life story,{" "}
              <span className="text-primary">revealed in cards</span>.
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-lg">
              Create personalized oracle card decks from your real experiences. Every
              card reflects your journey.
            </p>
            <div className="mt-6 sm:mt-8 flex gap-3">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get Started Free
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-lg border border-primary/30 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                View Pricing
              </a>
            </div>
          </div>
          {/* Hero image — phone mockup with card */}
          <div className="mt-10 lg:mt-0 flex justify-center">
            <div className="w-52 sm:w-60 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] p-3 sm:p-4 shadow-lg shadow-primary/5">
              {/* Phone status bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="h-1 w-8 rounded-full bg-primary/15" />
                <div className="h-2 w-2 rounded-full bg-primary/15" />
              </div>
              {/* Card on screen */}
              <div className="aspect-[2/3] rounded-lg border border-primary/25 bg-gradient-to-b from-primary/15 to-primary/5 flex flex-col items-center justify-between py-4 px-3">
                <span className="text-[9px] tracking-[0.2em] text-primary/40 font-medium">I</span>
                <div className="flex flex-col items-center gap-1.5">
                  <Sparkles className="h-5 w-5 text-primary/30" />
                  <div className="h-px w-8 bg-primary/20" />
                  <span className="text-[10px] sm:text-xs font-medium text-primary/50">The Journey</span>
                  <div className="h-px w-8 bg-primary/20" />
                </div>
                <span className="text-[9px] tracking-[0.2em] text-primary/40 font-medium rotate-180">I</span>
              </div>
              {/* Bottom nav dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/15" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/15" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y border-primary/10 px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary/60 text-primary/60" />
            <Star className="h-3 w-3 fill-primary/60 text-primary/60" />
            <Star className="h-3 w-3 fill-primary/60 text-primary/60" />
            <Star className="h-3 w-3 fill-primary/60 text-primary/60" />
            <Star className="h-3 w-3 fill-primary/60 text-primary/60" />
          </div>
          <span className="text-xs text-primary/50">2,400+ decks created</span>
          <span className="hidden sm:inline text-xs text-primary/50">800+ active creators</span>
        </div>
      </div>

      {/* Features — 2-column compact grid with gold borders, 4-col on desktop */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-widest text-primary/70">
            Features
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-xl border border-primary/20 bg-accent/30 p-3 sm:p-4"
              >
                <feature.icon
                  className="h-5 w-5 text-primary"
                  strokeWidth={1.5}
                />
                <h3 className="mt-2 text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <FeatureScreenshot index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — horizontal scroll mobile, 3-col grid desktop */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium uppercase tracking-widest text-primary/70">
              How it works
            </p>
          </div>
        </div>
        {/* Mobile: horizontal scroll */}
        <div className="md:hidden mt-4 flex gap-3 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {steps.map((step) => (
            <div
              key={step.num}
              className="min-w-[220px] shrink-0 rounded-xl border border-primary/15 bg-accent/20 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary/50">
                  {step.num}
                </span>
                <step.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
          <div className="w-1 shrink-0" />
        </div>
        {/* Desktop: static 3-col grid */}
        <div className="hidden md:block px-6 mt-6">
          <div className="mx-auto max-w-6xl grid grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-xl border border-primary/15 bg-accent/20 p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary/50">
                    {step.num}
                  </span>
                  <step.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase — card gallery with gold borders */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-widest text-primary/70">
            Gallery
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            A glimpse at the oracle cards our community has created.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryCards.map((card) => (
              <div
                key={card.numeral}
                className="aspect-[2/3] rounded-lg bg-gradient-to-b from-primary/15 to-primary/5 border border-primary/20 flex flex-col items-center justify-between py-4 sm:py-5 px-3"
              >
                <span className="text-[9px] tracking-[0.2em] text-primary/30 font-medium">{card.numeral}</span>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-px w-6 bg-primary/15" />
                  <Sparkles className="h-4 w-4 text-primary/20" />
                  <span className="text-[10px] sm:text-xs font-medium text-primary/40 text-center leading-tight">{card.name}</span>
                  <div className="h-px w-6 bg-primary/15" />
                </div>
                <span className="text-[9px] tracking-[0.2em] text-primary/30 font-medium rotate-180">{card.numeral}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — dark section with gold accent */}
      <section className="border-t border-primary/15 px-4 sm:px-6 py-16 sm:py-20 lg:py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Ready to discover{" "}
            <span className="text-primary">your cards</span>?
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">
            Start free. No credit card required.
          </p>
          <div className="mt-6 sm:mt-8">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Create Your Deck
            </a>
          </div>
        </div>
      </section>

      {/* Footer — compact, gold accent */}
      <footer className="border-t border-primary/10 px-4 sm:px-6 py-5 sm:py-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary/70">MysTech</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">&copy; 2025 MysTech</p>
        </div>
      </footer>
    </div>
  );
}
