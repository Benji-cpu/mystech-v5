import Link from "next/link";
import { Plus, Palette } from "lucide-react";
import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, or, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { StyleCard } from "@/components/art-styles/style-card";
import { PageHeader } from "@/components/layout/page-header";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { SectionHeader } from "@/components/ui/section-header";
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
    <AnimatedPage className="p-4 sm:p-6 lg:p-8 space-y-8">
      <AnimatedItem>
        <PageHeader
          icon={Palette}
          title="Art Styles"
          subtitle="Choose a visual style for your oracle card artwork"
          action={
            <Button asChild>
              <Link href="/art-styles/new">
                <Plus className="h-4 w-4" />
                Create Custom
              </Link>
            </Button>
          }
        />
      </AnimatedItem>

      {/* Presets */}
      <AnimatedItem>
        <section>
          <SectionHeader className="mb-4">Preset Styles</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {presets.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                currentUserId={user.id!}
              />
            ))}
          </div>
        </section>
      </AnimatedItem>

      {/* Custom */}
      {custom.length > 0 && (
        <AnimatedItem>
          <section>
            <SectionHeader className="mb-4">Custom Styles</SectionHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {custom.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  currentUserId={user.id!}
                />
              ))}
            </div>
          </section>
        </AnimatedItem>
      )}

      {/* Shared */}
      {shared.length > 0 && (
        <AnimatedItem>
          <section>
            <SectionHeader className="mb-4">Shared With You</SectionHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {shared.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  currentUserId={user.id!}
                />
              ))}
            </div>
          </section>
        </AnimatedItem>
      )}
    </AnimatedPage>
  );
}
