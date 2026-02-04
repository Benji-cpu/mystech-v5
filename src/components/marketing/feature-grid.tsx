import { Sparkles, BookOpen, Users, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Personalized Decks",
    description:
      "Create oracle card decks drawn from your own life experiences, memories, and personal symbolism.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Readings",
    description:
      "Receive insightful readings guided by AI that understands the meaning behind your unique cards.",
  },
  {
    icon: Palette,
    title: "Custom Art Styles",
    description:
      "Choose from mystical art styles or create your own — each deck is a visual masterpiece.",
  },
  {
    icon: Users,
    title: "Share & Connect",
    description:
      "Share readings with friends and explore how your personal oracle speaks to others.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need for mystical insight
          </h2>
          <p className="mt-3 text-muted-foreground">
            A complete platform for creating, reading, and sharing personal
            oracle cards.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 transition-colors hover:border-primary/30"
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
