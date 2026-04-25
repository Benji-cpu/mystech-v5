import Link from "next/link";
import { Palette, Wand2, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { EditorialShell, EditorialHeader } from "@/components/editorial";

interface StudioCardProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  note?: string;
}

function StudioCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  note,
}: StudioCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border p-7 flex flex-col gap-4 transition-colors duration-300 hair hover:border-[var(--ink-soft)]"
      style={{ background: "var(--paper-card)" }}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border shrink-0"
            style={{
              background: "var(--paper-warm)",
              borderColor: "rgba(168, 134, 63, 0.25)",
              color: "var(--accent-gold)",
            }}
          >
            <Icon className="h-6 w-6" />
          </div>
          {badge && (
            <span
              className="eyebrow rounded-full px-2.5 py-1"
              style={{
                background: "var(--paper-warm)",
                color: "var(--accent-gold)",
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <h2
            className="display text-2xl leading-tight"
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-mute)" }}>
            {description}
          </p>
        </div>

        {note && (
          <p
            className="whisper text-xs border-t pt-3 hair"
            style={{ color: "var(--ink-mute)" }}
          >
            {note}
          </p>
        )}

        <div
          className="flex items-center gap-1 mt-auto transition-colors"
          style={{ color: "var(--ink-soft)" }}
        >
          <span className="text-xs font-medium">Open</span>
          <ChevronRight className="h-3.5 w-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default async function StudioPage() {
  await requireAuth();

  return (
    <EditorialShell>
      <div className="mx-auto max-w-3xl space-y-10 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <EditorialHeader
          eyebrow="Creator"
          title="Studio"
          whisper="Your creative workspace."
        />

        <section>
          <p className="eyebrow mb-5">Tools</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StudioCard
              href="/studio/styles"
              icon={Palette}
              title="Art Styles"
              description="Browse 45+ curated templates, create custom styles from reference images, and fine-tune every parameter."
              badge="45+ styles"
            />
            <StudioCard
              href="/studio/cards"
              icon={Wand2}
              title="Card Refinement"
              description="Refine individual card images with progressive controls, from simple regeneration to full parameter exposure."
              note="Select a card from a deck to begin refining its artwork."
            />
          </div>
        </section>
      </div>
    </EditorialShell>
  );
}
