import { Play, Sparkles } from "lucide-react";

export function SeeItInAction() {
  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            See it in action
          </h2>
          <p className="mt-3 text-muted-foreground">
            Watch how easy it is to create your personalized deck.
          </p>
        </div>

        {/* Video placeholder */}
        <div className="aspect-video rounded-2xl bg-accent/30 border border-border/40 flex items-center justify-center">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/10">
            <Play className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Card gallery */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-gradient-to-b from-accent/60 to-accent/20 border border-border/20 flex items-center justify-center"
            >
              <Sparkles className="h-6 w-6 text-primary/30" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
