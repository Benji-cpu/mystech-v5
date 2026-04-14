import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, or, and } from "drizzle-orm";
import { SimpleCreateForm } from "@/components/decks/simple-create-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { LYRA_SIMPLE_CREATE } from "@/components/guide/lyra-constants";
import type { ArtStyle, StyleCategory } from "@/types";

export default async function SimpleCreatePage() {
  const user = await requireAuth();

  // No deck limit — credits constrain card creation
  const atLimit = false;

  // Get all available art styles (presets + user's own + accepted shares)
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

  const allMap = new Map<string, (typeof ownStyles)[0]>();
  for (const s of [...ownStyles, ...sharedRows.map((r) => r.style)]) {
    allMap.set(s.id, s);
  }

  const styles: ArtStyle[] = Array.from(allMap.values()).map((s) => ({
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
  }));

  const presets = styles.filter((s) => s.isPreset);
  const custom = styles.filter((s) => !s.isPreset);

  return (
    <div className="max-w-2xl mx-auto p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8 lg:pt-24">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-white/90 font-display leading-relaxed">
          {LYRA_SIMPLE_CREATE.pageTitle}
        </h1>
        <p className="mt-1 text-white/50 text-sm">
          {LYRA_SIMPLE_CREATE.pageSubtitle}
        </p>
      </div>
      <GlassPanel className="p-6">
        <SimpleCreateForm
          presets={presets}
          customStyles={custom}
          atLimit={atLimit}
        />
      </GlassPanel>
    </div>
  );
}
