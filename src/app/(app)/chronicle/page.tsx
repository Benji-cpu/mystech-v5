import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { getUserChronicleDeck } from "@/lib/db/queries";

export default async function ChroniclePage() {
  const user = await requireAuth();
  const deck = await getUserChronicleDeck(user.id!);

  if (!deck) {
    redirect("/chronicle/setup");
  }

  // Chronicle lives as a deck now — redirect to deck detail
  redirect(`/decks/${deck.id}`);
}
