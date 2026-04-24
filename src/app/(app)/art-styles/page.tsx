import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, or, and } from "drizzle-orm";
import { StyleCard } from "@/components/art-styles/style-card";
import type { ArtStyle, StyleCategory } from "@/types";

function toArtStyle(s: typeof artStyles.$inferSelect): ArtStyle {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    stylePrompt: s.stylePrompt,
    previewImages: (s.previewImages as string[]) ?? [],
    isPreset: s.isPreset,
    createdBy: s.createdBy,
    isPublic: s.isPublic,
    shareToken: s.shareToken,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    parameters: s.parameters ?? null,
    referenceImageUrls: s.referenceImageUrls ?? null,
    extractedDescription: s.extractedDescription ?? null,
    category: (s.category as StyleCategory) ?? null,
  };
}

export default async function ArtStylesPage() {
  const user = await requireAuth();

  const ownStyles = await db
    .select()
    .from(artStyles)
    .where(
      or(eq(artStyles.isPreset, true), eq(artStyles.createdBy, user.id!))
    );

  const sharedRows = await db
    .select({ style: artStyles })
    .from(artStyleShares)
    .innerJoin(artStyles, eq(artStyleShares.styleId, artStyles.id))
    .where(
      and(
        eq(artStyleShares.sharedWithUserId, user.id!),
        eq(artStyleShares.accepted, true)
      )
    );

  const presets = ownStyles.filter((s) => s.isPreset).map(toArtStyle);
  const custom = ownStyles
    .filter((s) => !s.isPreset && s.createdBy === user.id)
    .map(toArtStyle);
  const shared = sharedRows.map((r) => toArtStyle(r.style));

  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-5xl space-y-12 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Studio</p>
            <h1
              className="display mt-3 text-[clamp(2.25rem,8vw,3.25rem)] leading-[0.98]"
              style={{ color: "var(--ink)" }}
            >
              Art Styles
            </h1>
            <p
              className="whisper mt-3 text-base leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              Choose or craft a visual language for your card artwork.
            </p>
          </div>
          <Link
            href="/art-styles/new"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            <Plus size={14} strokeWidth={2} />
            Custom
          </Link>
        </header>

        <section>
          <p className="eyebrow mb-5">Presets</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {presets.map((style) => (
              <StyleCard key={style.id} style={style} currentUserId={user.id!} />
            ))}
          </div>
        </section>

        {custom.length > 0 && (
          <section>
            <p className="eyebrow mb-5">Your custom styles</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {custom.map((style) => (
                <StyleCard key={style.id} style={style} currentUserId={user.id!} />
              ))}
            </div>
          </section>
        )}

        {shared.length > 0 && (
          <section>
            <p className="eyebrow mb-5">Shared with you</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {shared.map((style) => (
                <StyleCard key={style.id} style={style} currentUserId={user.id!} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
