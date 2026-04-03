import { Palette } from "lucide-react";
import { or, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { PageHeader } from "@/components/layout/page-header";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
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
    <AnimatedPage className="p-4 sm:p-6 lg:p-8 space-y-8">
      <AnimatedItem>
        <PageHeader
          icon={Palette}
          title="Art Styles"
          subtitle="Browse 45+ curated templates or create a custom style from reference images"
        />
      </AnimatedItem>

      <AnimatedItem>
        <TemplateBrowser styles={allStyles} currentUserId={user.id!} />
      </AnimatedItem>
    </AnimatedPage>
  );
}
