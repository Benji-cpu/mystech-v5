import Link from "next/link";
import { Sparkles, BookOpen, Users, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Oracle Cards
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your life story,{" "}
              <span className="text-primary">revealed in cards</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Transform your experiences into a personalized oracle deck. Let AI
              weave your memories into meaningful cards, then discover what the
              universe has to say.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/login">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
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

      {/* CTA */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to discover your cards?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Start with a free account. Create your first deck in minutes.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/login">Begin Your Journey</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
