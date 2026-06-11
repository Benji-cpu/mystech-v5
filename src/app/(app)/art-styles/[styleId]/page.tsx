import { redirect } from "next/navigation";

/** Legacy route — art styles now live under /decks/styles. */
export default async function ArtStyleDetailPage({
  params,
}: {
  params: Promise<{ styleId: string }>;
}) {
  const { styleId } = await params;
  redirect(`/decks/styles/${styleId}`);
}
