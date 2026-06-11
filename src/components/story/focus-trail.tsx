import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FocusTrailData {
  pathId: string;
  pathName: string;
  waypointName: string;
  totalSteps: number;
  completedSteps: number;
  artifacts: {
    id: string;
    title: string;
    imageUrl: string | null;
    cardType: string;
  }[];
}

const MAX_DOTS = 24;

export function FocusTrail({
  trail,
  className,
}: {
  trail: FocusTrailData;
  className?: string;
}) {
  const total = Math.max(trail.totalSteps, 1);
  const shownDots = Math.min(total, MAX_DOTS);
  const completedDots = Math.round((trail.completedSteps / total) * shownDots);

  return (
    <section className={cn(className)}>
      <Link
        href={`/paths/${trail.pathId}`}
        className="block rounded-3xl border p-6 hair transition-colors hover:border-[var(--ink-soft)]"
        style={{ background: "var(--paper-card)" }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow" style={{ color: "var(--accent-gold)" }}>
            Current focus
          </p>
          <span className="text-xs" style={{ color: "var(--ink-mute)" }}>
            {trail.completedSteps} of {trail.totalSteps} steps
          </span>
        </div>

        <p className="display mt-2 text-xl leading-tight" style={{ color: "var(--ink)" }}>
          {trail.pathName}
        </p>

        {/* Trail dots */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {Array.from({ length: shownDots }).map((_, i) => {
            const done = i < completedDots;
            const current = i === completedDots;
            return (
              <span
                key={i}
                className="h-2 w-2 rounded-full border"
                style={
                  done
                    ? { background: "var(--accent-gold)", borderColor: "var(--accent-gold)" }
                    : current
                      ? { background: "transparent", borderColor: "var(--accent-gold)" }
                      : { background: "transparent", borderColor: "var(--line)" }
                }
              />
            );
          })}
        </div>

        <p className="mt-3 text-xs" style={{ color: "var(--ink-mute)" }}>
          Now: {trail.waypointName} →
        </p>

        {/* Earned artifact cards */}
        {trail.artifacts.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            {trail.artifacts.slice(0, 5).map((a) => (
              <div
                key={a.id}
                title={a.title}
                className="relative h-14 w-10 overflow-hidden rounded-sm border"
                style={{ borderColor: "var(--accent-gold)" }}
              >
                {a.imageUrl ? (
                  <Image src={a.imageUrl} alt={a.title} fill sizes="40px" className="object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-xs"
                    style={{ background: "var(--paper-warm)", color: "var(--accent-gold)" }}
                  >
                    ✦
                  </div>
                )}
              </div>
            ))}
            <span className="ml-1 text-xs" style={{ color: "var(--ink-faint)" }}>
              earned along the way
            </span>
          </div>
        )}
      </Link>

      <div className="mt-2 text-right">
        <Link
          href="/paths"
          className="text-xs hover:underline"
          style={{ color: "var(--ink-mute)" }}
        >
          Change focus
        </Link>
      </div>
    </section>
  );
}
