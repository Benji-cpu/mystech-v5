import { redirect } from "next/navigation";

/** Legacy route — style editing now lives under /decks/styles. */
export default async function EditArtStylePage({
  params,
}: {
  params: Promise<{ styleId: string }>;
}) {
  const { styleId } = await params;
  redirect(`/decks/styles/${styleId}/edit`);
}
