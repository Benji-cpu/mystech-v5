import { redirect } from "next/navigation";

/** Legacy route — the style editor now lives under /decks/styles. */
export default async function StudioStyleEditorPage({
  params,
}: {
  params: Promise<{ styleId: string }>;
}) {
  const { styleId } = await params;
  redirect(`/decks/styles/${styleId}/edit`);
}
