import { MessageCircle, Layers, Eye } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: MessageCircle,
    title: "Tell Your Story",
    description:
      "Share your experiences through a guided conversation with our AI mystic.",
  },
  {
    number: 2,
    icon: Layers,
    title: "Get Your Deck",
    description:
      "We transform your narrative into a personalized oracle card deck with unique artwork.",
  },
  {
    number: 3,
    icon: Eye,
    title: "Discover Insights",
    description:
      "Draw cards for AI-powered readings that speak directly to your journey.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            From story to spread in three simple steps.
          </p>
        </div>

        {/* Desktop: 3-col grid of rounded cards */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl bg-gradient-to-br from-accent/50 to-accent/10 p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30 bg-background">
                <span className="text-sm font-bold text-primary">
                  {step.number}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <step.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="relative sm:hidden space-y-6">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
          {steps.map((step) => (
            <div key={step.number} className="relative flex gap-5 pl-1">
              <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-background">
                <span className="text-xs font-bold text-primary">
                  {step.number}
                </span>
              </div>
              <div className="pt-0.5">
                <div className="flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
