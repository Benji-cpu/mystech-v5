import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { SimpleCreateForm } from "@/components/decks/simple-create-form";
import { LYRA_SIMPLE_CREATE } from "@/components/guide/lyra-constants";
import { EditorialShell, EditorialHeader, EditorialCard } from "@/components/editorial";
import type { ArtStyle, StyleCategory } from "@/types";

export default async function NewDeckPage() {
  await requireAuth();

  // No deck limit — credits constrain card creation
  const atLimit = false;

  const rows = await db.select().from(artStyles).where(eq(artStyles.isPreset, true));

  const presets: ArtStyle[] = rows.map((s) => ({
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

  return (
    <EditorialShell>
      <div className="mx-auto max-w-2xl px-6 pb-28 pt-24 sm:px-10 sm:pt-28">
        <EditorialHeader
          eyebrow="New deck"
          title={LYRA_SIMPLE_CREATE.pageTitle}
          whisper={LYRA_SIMPLE_CREATE.pageSubtitle}
          size="md"
        />

        <EditorialCard className="mt-8">
          <SimpleCreateForm presets={presets} atLimit={atLimit} />
        </EditorialCard>
      </div>
    </EditorialShell>
  );
}
