import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { CustomStyleForm } from "@/components/art-styles/custom-style-form";

export default async function EditArtStylePage({
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

  // Only owner of non-preset styles can edit
  if (style.isPreset || style.createdBy !== user.id) {
    notFound();
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <Link
        href={`/art-styles/${style.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {style.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Edit Style</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your custom art style
        </p>
      </div>

      <CustomStyleForm
        initialData={{
          id: style.id,
          name: style.name,
          description: style.description,
        }}
      />
    </div>
  );
}
