import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import { StyleEditor } from "@/components/studio/style-editor";
import type { ArtStyle, StyleCategory, PlanType } from "@/types";

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

export default async function StyleEditorPage({
  params,
}: {
  params: Promise<{ styleId: string }>;
}) {
  const user = await requireAuth();
  const { styleId } = await params;

  const [style] = await db
    .select()
    .from(artStyles)
    .where(eq(artStyles.id, styleId))
    .limit(1);

  if (!style) notFound();

  // Access check — must be preset, public, or owned by the current user
  const canAccess =
    style.isPreset || style.isPublic || style.createdBy === user.id;
  if (!canAccess) notFound();

  const isOwner = style.createdBy === user.id;
  const plan: PlanType = await getUserPlan(user.id!);

  return (
    <StyleEditor
      style={toArtStyle(style)}
      isOwner={isOwner}
      plan={plan}
      userId={user.id!}
    />
  );
}
