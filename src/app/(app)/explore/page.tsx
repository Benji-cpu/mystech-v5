import { Compass } from "lucide-react";
import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getPublicDecks } from "@/lib/db/queries";
import { eq, or, and } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { ExploreTabs } from "@/components/explore/explore-tabs";
import { LYRA_EXPLORE } from "@/components/guide/lyra-constants";
import type { ArtStyle } from "@/types";

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
  };
}

export default async function ExplorePage() {
  const user = await requireAuth();

  // Fetch public decks and art styles in parallel
  const [publicDecks, ownStyles, sharedRows] = await Promise.all([
    getPublicDecks(user.id!),
    db
      .select()
      .from(artStyles)
      .where(
        or(eq(artStyles.isPreset, true), eq(artStyles.createdBy, user.id!))
      ),
    db
      .select({ style: artStyles })
      .from(artStyleShares)
      .innerJoin(artStyles, eq(artStyleShares.styleId, artStyles.id))
      .where(
        and(
          eq(artStyleShares.sharedWithUserId, user.id!),
          eq(artStyleShares.accepted, true)
        )
      ),
  ]);

  const presets = ownStyles.filter((s) => s.isPreset).map(toArtStyle);
  const custom = ownStyles
    .filter((s) => !s.isPreset && s.createdBy === user.id)
    .map(toArtStyle);
  const shared = sharedRows.map((r) => toArtStyle(r.style));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <PageHeader
        icon={Compass}
        title="Explore"
        subtitle={LYRA_EXPLORE.subtitle}
      />

      <ExploreTabs
        publicDecks={publicDecks}
        artStyles={{ presets, custom, shared }}
        currentUserId={user.id!}
      />
    </div>
  );
}
