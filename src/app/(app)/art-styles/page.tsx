import Link from "next/link";
import { Plus, Palette } from "lucide-react";
import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, or, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { StyleCard } from "@/components/art-styles/style-card";
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

export default async function ArtStylesPage() {
  const user = await requireAuth();

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

  const presets = ownStyles.filter((s) => s.isPreset).map(toArtStyle);
  const custom = ownStyles
    .filter((s) => !s.isPreset && s.createdBy === user.id)
    .map(toArtStyle);
  const shared = sharedRows.map((r) => toArtStyle(r.style));

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-[#c9a94e]" />
            Art Styles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a visual style for your oracle card artwork
          </p>
        </div>
        <Button asChild>
          <Link href="/art-styles/new">
            <Plus className="h-4 w-4" />
            Create Custom
          </Link>
        </Button>
      </div>

      {/* Presets */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Preset Styles</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {presets.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              currentUserId={user.id!}
            />
          ))}
        </div>
      </section>

      {/* Custom */}
      {custom.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Custom Styles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {custom.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                currentUserId={user.id!}
              />
            ))}
          </div>
        </section>
      )}

      {/* Shared */}
      {shared.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Shared With You</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shared.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                currentUserId={user.id!}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
