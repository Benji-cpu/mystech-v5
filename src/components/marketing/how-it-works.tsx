import { MessageCircle, Layers, Sparkles } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: MessageCircle,
    title: "Tell Your Story",
    description:
      "Share your experiences, memories, and themes with our AI guide. It listens deeply and finds the symbolism within.",
  },
  {
    number: 2,
    icon: Layers,
    title: "Get Your Deck",
    description:
      "Your stories are transformed into a unique oracle deck — each card a reflection of your personal journey.",
  },
  {
    number: 3,
    icon: Sparkles,
    title: "Discover Insights",
    description:
      "Draw cards and receive AI-powered readings that speak directly to your life, with meaning only you can truly understand.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            From story to spread in three simple steps.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {step.number}
              </div>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
