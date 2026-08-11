import Link from "next/link";

export default function MockHub() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mock Hub</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Approved reference implementations. Experimental prototypes were
          archived in the v5 simplification overhaul (recoverable from git
          history).
        </p>

        <Link
          href="/mock/approved"
          className="mt-8 block rounded-2xl border border-primary/30 bg-primary/5 p-6 transition-colors hover:border-primary/50 hover:bg-primary/10"
        >
          <h2 className="text-lg font-semibold">Approved Mocks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference implementations approved for production — reading
            ceremony, background system, and card morph techniques.
          </p>
        </Link>

        <h2 className="mt-10 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Pre-reading explorations
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Rethinking everything before the cards are drawn. Newest first — each
          one discards a premise the previous one kept.
        </p>

        <div className="mt-4 space-y-3">
          {[
            {
              href: "/mock/reading-v4",
              name: "v4 — In Hand",
              body:
                "No setup at all. Swipe between decks, press and hold to lift cards off the stack (dwell time is depth), release to draw. The question is captured after the draw, not before.",
            },
            {
              href: "/mock/reading-v3",
              name: "v3 — The Fold",
              body:
                "One surface. Setup is a one-time step that replaces onboarding, collapses to a single line, and re-opens in place. No navigation anywhere.",
            },
            {
              href: "/mock/reading-v2",
              name: "v2 — Two ways in (superseded)",
              body:
                "Deck-led vs question-led as two separate routes. Kept for reference; the choice became a setting in v3.",
            },
          ].map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="block rounded-2xl border border-border bg-card/40 p-5 transition-colors hover:border-primary/40"
            >
              <h3 className="font-semibold">{m.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
