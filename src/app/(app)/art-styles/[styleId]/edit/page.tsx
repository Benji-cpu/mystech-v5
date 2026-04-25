import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { artStyles } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import { CustomStyleForm } from "@/components/art-styles/custom-style-form";
import { EditorialShell, EditorialHeader } from "@/components/editorial";

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
    <EditorialShell>
      <div className="mx-auto max-w-lg space-y-8 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <EditorialHeader
          backHref={`/art-styles/${style.id}`}
          backLabel="Style"
          eyebrow="Edit"
          title="Edit style"
          whisper="Update your custom art style."
          size="md"
        />

        <CustomStyleForm
          initialData={{
            id: style.id,
            name: style.name,
            description: style.description,
          }}
        />
      </div>
    </EditorialShell>
  );
}
