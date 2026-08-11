import Link from "next/link";

const VARIANTS = [
  {
    href: "/mock/reading-v2/threshold",
    name: "A — The Threshold",
    lead: "The deck leads",
    body:
      "Your deck stands in the middle of the screen, breathing, tappable. Depth is a single 44px strip of glyphs. The intention is one line in the thumb zone. Tap the button to draw; hold it to breathe first.",
  },
  {
    href: "/mock/reading-v2/invocation",
    name: "B — Invocation",
    lead: "The question leads",
    body:
      "The screen is nearly empty — just what you're here to ask, in serif, centred. The deck is a ghost behind the words. Deck and depth collapse into one hairline of tappable text above the action.",
  },
];

export default function ReadingV2Index() {
  return (
    <div className="daylight min-h-screen px-5 py-10" style={{ background: "var(--paper)" }}>
      <div className="mx-auto max-w-md">
        <p className="eyebrow">Pre-reading, re-envisioned</p>
        <h1 className="display mt-2 text-[28px] leading-tight" style={{ color: "var(--ink)" }}>
          Two ways into the cards
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Both hold to the same rules: one viewport, never a scroll, every control in the
          bottom third, and deck + depth treated as state you can tap rather than questions
          you must answer. They differ only in what owns the screen.
        </p>

        <div className="mt-8 space-y-3">
          {VARIANTS.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="block rounded-2xl p-5"
              style={{ background: "var(--paper-card)", border: "1px solid var(--line)" }}
            >
              <p className="eyebrow" style={{ color: "var(--accent-gold)" }}>
                {v.lead}
              </p>
              <p className="display mt-1 text-[18px]" style={{ color: "var(--ink)" }}>
                {v.name}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-mute)" }}>
                {v.body}
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-[12px] leading-relaxed" style={{ color: "var(--ink-faint)" }}>
          Best viewed at 390px. Both stop at the moment the cards are drawn — the existing
          ceremony picks up from there.
        </p>
      </div>
    </div>
  );
}
