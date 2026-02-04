import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getUserDeckCount } from "@/lib/db/queries";
import { PLAN_LIMITS } from "@/lib/constants";
import { eq, or, and } from "drizzle-orm";
import { SimpleCreateForm } from "@/components/decks/simple-create-form";
import type { ArtStyle } from "@/types";

export default async function SimpleCreatePage() {
  const user = await requireAuth();

  const deckCount = await getUserDeckCount(user.id!);
  const atLimit = deckCount >= PLAN_LIMITS.free.maxDecks;

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
  }));

  const presets = styles.filter((s) => s.isPreset);
  const custom = styles.filter((s) => !s.isPreset);

  return (
    <div className="max-w-2xl mx-auto">
      <SimpleCreateForm
        presets={presets}
        customStyles={custom}
        atLimit={atLimit}
      />
    </div>
  );
}
