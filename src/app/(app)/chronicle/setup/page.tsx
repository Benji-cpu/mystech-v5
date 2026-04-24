import { requireAuth } from "@/lib/auth/helpers";
import { getUserChronicleDeck } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ChronicleSetupFlow } from "@/components/chronicle/chronicle-setup-flow";
import type { ArtStyle, StyleCategory } from "@/types";

export default async function ChronicleSetupPage() {
  const user = await requireAuth();

  // If this user already has a Chronicle deck, redirect them to the main page
  const deck = await getUserChronicleDeck(user.id!);
  if (deck) {
    redirect("/chronicle");
  }

  // Fetch preset art styles for the picker
  const rows = await db
    .select()
    .from(artStyles)
    .where(eq(artStyles.isPreset, true));

  const presetStyles: ArtStyle[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    stylePrompt: row.stylePrompt,
    previewImages: (row.previewImages ?? []) as string[],
    isPreset: row.isPreset,
    createdBy: row.createdBy,
    isPublic: row.isPublic,
    shareToken: row.shareToken ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    parameters: row.parameters ?? null,
    referenceImageUrls: row.referenceImageUrls ?? null,
    extractedDescription: row.extractedDescription ?? null,
    category: (row.category as StyleCategory) ?? null,
  }));

  return (
    <div className="daylight fixed inset-0 overflow-y-auto" style={{ background: "var(--paper)", zIndex: 1 }}>
      <ChronicleSetupFlow presetStyles={presetStyles} />
    </div>
  );
}
