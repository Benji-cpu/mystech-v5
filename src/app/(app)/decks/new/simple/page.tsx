import { db } from "@/lib/db";
import { artStyles, artStyleShares } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, or, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SimpleCreateForm } from "@/components/decks/simple-create-form";
import { LYRA_SIMPLE_CREATE } from "@/components/guide/lyra-constants";
import type { ArtStyle, StyleCategory } from "@/types";

export default async function SimpleCreatePage() {
  const user = await requireAuth();

  // No deck limit — credits constrain card creation
  const atLimit = false;

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
    parameters: s.parameters ?? null,
    referenceImageUrls: s.referenceImageUrls ?? null,
    extractedDescription: s.extractedDescription ?? null,
    category: (s.category as StyleCategory) ?? null,
  }));

  const presets = styles.filter((s) => s.isPreset);
  const custom = styles.filter((s) => !s.isPreset);

  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-2xl px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <Link
          href="/decks/new"
          className="eyebrow inline-flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <header className="mt-6 text-center">
          <p className="eyebrow">Quick create</p>
          <h1
            className="display mt-3 text-[clamp(2rem,7vw,2.75rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            {LYRA_SIMPLE_CREATE.pageTitle}
          </h1>
          <p
            className="whisper mt-3 text-base"
            style={{ color: "var(--ink-soft)" }}
          >
            {LYRA_SIMPLE_CREATE.pageSubtitle}
          </p>
        </header>

        <div
          className="mt-8 rounded-3xl border p-6 hair"
          style={{ background: "var(--paper-card)" }}
        >
          <SimpleCreateForm
            presets={presets}
            customStyles={custom}
            atLimit={atLimit}
          />
        </div>
      </div>
    </div>
  );
}
