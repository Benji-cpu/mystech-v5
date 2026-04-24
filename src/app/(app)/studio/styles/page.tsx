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
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-5xl space-y-10 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <header>
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
            Browse 45+ curated templates or create a custom style from reference images.
          </p>
        </header>

        <TemplateBrowser styles={allStyles} currentUserId={user.id!} />
      </div>
    </div>
  );
}
