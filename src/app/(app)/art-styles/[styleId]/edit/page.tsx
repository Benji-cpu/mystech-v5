import { notFound } from "next/navigation";
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
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-lg space-y-8 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <header>
          <p className="eyebrow">Edit</p>
          <h1
            className="display mt-3 text-[clamp(2rem,7vw,2.75rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            Edit style
          </h1>
          <p className="whisper mt-3 text-base" style={{ color: "var(--ink-soft)" }}>
            Update your custom art style.
          </p>
        </header>

        <CustomStyleForm
          initialData={{
            id: style.id,
            name: style.name,
            description: style.description,
          }}
        />
      </div>
    </div>
  );
}
