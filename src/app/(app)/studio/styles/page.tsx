import { or, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { EditorialShell, EditorialHeader } from "@/components/editorial";
import { TemplateBrowser } from "./template-browser";
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

export default async function StudioStylesPage() {
  const user = await requireAuth();

  const rows = await db
    .select()
    .from(artStyles)
    .where(
      or(eq(artStyles.isPreset, true), eq(artStyles.createdBy, user.id!))
    );

  const allStyles = rows.map(toArtStyle);

  return (
    <EditorialShell>
      <div className="mx-auto max-w-5xl space-y-10 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <EditorialHeader
          backHref="/studio"
          backLabel="Studio"
          title="Art Styles"
          whisper="Browse 45+ curated templates or create a custom style from reference images."
        />

        <TemplateBrowser styles={allStyles} currentUserId={user.id!} />
      </div>
    </EditorialShell>
  );
}
