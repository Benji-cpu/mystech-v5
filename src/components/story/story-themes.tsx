import { cn } from "@/lib/utils";
import type { ChronicleKnowledge } from "@/types";

const MAX_THEMES = 8;
const MAX_SYMBOLS = 6;

export function StoryThemes({
  knowledge,
  className,
}: {
  knowledge: ChronicleKnowledge | null;
  className?: string;
}) {
  if (!knowledge) return null;

  const themes = Object.entries(knowledge.themes ?? {})
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, MAX_THEMES);
  const symbols = (knowledge.recurringSymbols ?? [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_SYMBOLS);

  if (themes.length === 0 && symbols.length === 0) return null;

  return (
    <section className={cn(className)}>
      <p className="eyebrow">What you&rsquo;re working through</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {themes.map(([theme, data]) => (
          <span
            key={theme}
            className="rounded-full border px-3 py-1.5 text-xs capitalize hair"
            style={{ background: "var(--paper-card)", color: "var(--ink-soft)" }}
          >
            {theme}
            {data.count > 1 && (
              <span className="ml-1.5" style={{ color: "var(--ink-faint)" }}>
                ×{data.count}
              </span>
            )}
          </span>
        ))}
        {symbols.map((s) => (
          <span
            key={s.symbol}
            className="rounded-full border px-3 py-1.5 text-xs capitalize"
            style={{
              borderColor: "var(--accent-gold)",
              background: "var(--paper-warm)",
              color: "var(--accent-gold)",
            }}
          >
            ✦ {s.symbol}
          </span>
        ))}
      </div>
      {knowledge.summary && (
        <p
          className="whisper mt-4 text-sm leading-relaxed"
          style={{ color: "var(--ink-mute)" }}
        >
          {knowledge.summary}
        </p>
      )}
    </section>
  );
}
