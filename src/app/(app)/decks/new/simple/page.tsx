import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, or, and } from "drizzle-orm";
import { SimpleCreateForm } from "@/components/decks/simple-create-form";
import { LYRA_SIMPLE_CREATE } from "@/components/guide/lyra-constants";
import { EditorialShell, EditorialHeader, EditorialCard } from "@/components/editorial";
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
    <EditorialShell>
      <div className="mx-auto max-w-2xl px-6 pb-28 pt-24 sm:px-10 sm:pt-28">
        <EditorialHeader
          eyebrow="Quick create"
          title={LYRA_SIMPLE_CREATE.pageTitle}
          whisper={LYRA_SIMPLE_CREATE.pageSubtitle}
          size="md"
        />

        <EditorialCard className="mt-8">
          <SimpleCreateForm
            presets={presets}
            customStyles={custom}
            atLimit={atLimit}
          />
        </EditorialCard>
      </div>
    </EditorialShell>
  );
}
