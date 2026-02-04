import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StyleThumbnail } from "@/components/art-styles/style-thumbnail";
import { DeleteStyleButton } from "@/components/art-styles/delete-style-button";
import { ShareStyleButton } from "@/components/art-styles/share-style-button";

export default async function StyleDetailPage({
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

  // Access check for non-preset, non-owned styles
  if (!style.isPreset && style.createdBy !== user.id) {
    const [share] = await db
      .select()
      .from(artStyleShares)
      .where(
        and(
          eq(artStyleShares.styleId, styleId),
          eq(artStyleShares.sharedWithUserId, user.id!),
          eq(artStyleShares.accepted, true)
        )
      )
      .limit(1);

    if (!share) notFound();
  }

  const isOwner = style.createdBy === user.id;
  const isPreset = style.isPreset;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/art-styles"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Art Styles
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{style.name}</h1>
            <Badge variant={isPreset ? "secondary" : "outline"}>
              {isPreset ? "Preset" : "Custom"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{style.description}</p>
        </div>
      </div>

      {/* Preview gallery (gradient placeholders) */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Preview</h2>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <StyleThumbnail
              key={i}
              styleId={style.id}
              previewImages={
                (style.previewImages as string[])?.length > i
                  ? [(style.previewImages as string[])[i]]
                  : undefined
              }
              size="lg"
            />
          ))}
        </div>
      </section>

      {/* Style prompt */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Style Prompt
        </h2>
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm italic">{style.stylePrompt}</p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button asChild variant="outline">
          <Link href={`/decks/new?style=${style.id}`}>
            <Sparkles className="h-4 w-4" />
            Use This Style
          </Link>
        </Button>

        {isOwner && !isPreset && (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/art-styles/${style.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <ShareStyleButton styleId={style.id} />
            <DeleteStyleButton styleId={style.id} styleName={style.name} />
          </>
        )}
      </div>
    </div>
  );
}
