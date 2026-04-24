import Link from "next/link";
import { Palette, Wand2, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import { PageHeader } from "@/components/layout/page-header";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { SectionHeader } from "@/components/ui/section-header";

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
      className="group relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] p-6 flex flex-col gap-4 transition-colors duration-300 hover:border-gold/30 hover:bg-white/[0.08]"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 h-full">
        {/* Icon row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 border border-gold/20 shrink-0">
            <Icon className="h-6 w-6 text-gold" />
          </div>
          {badge && (
            <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
              {badge}
            </span>
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1 flex-1">
          <h2 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
            {title}
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">{description}</p>
        </div>

        {/* Note */}
        {note && (
          <p className="text-xs text-white/30 italic border-t border-white/5 pt-3">
            {note}
          </p>
        )}

        {/* Arrow */}
        <div className="flex items-center gap-1 text-gold/60 group-hover:text-gold transition-colors mt-auto">
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
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-3xl space-y-10 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <header>
          <p className="eyebrow">Creator</p>
          <h1
            className="display mt-3 text-[clamp(2.25rem,8vw,3.25rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            Studio
          </h1>
          <p
            className="whisper mt-3 text-base leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            Your creative workspace.
          </p>
        </header>

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
    </div>
  );
}
