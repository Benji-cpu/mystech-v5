import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserChronicleDeck,
  getTodayChronicleEntry,
  getChronicleSettings,
  getTodayChronicleCard,
  getChronicleEntries,
} from "@/lib/db/queries";
import { ChronicleFlow } from "@/components/chronicle/chronicle-flow";

export const metadata = {
  title: "Today's Chronicle — MysTech",
};

export default async function ChronicleTodayPage() {
  const user = await requireAuth();

  const deck = await getUserChronicleDeck(user.id!);

  if (!deck) {
    redirect("/chronicle/setup");
  }

  const [entry, settings, todayCard, pastEntries] = await Promise.all([
    getTodayChronicleEntry(user.id!),
    getChronicleSettings(deck.id),
    getTodayChronicleCard(user.id!),
    getChronicleEntries(user.id!, 1),
  ]);

  // First entry if there are no past completed entries (excluding today's)
  const isFirstEntry = pastEntries.length === 0 && !entry?.cardId;

  // Determine which phase to resume from
  const initialPhase =
    entry?.status === "completed"
      ? "complete"
      : entry?.cardId
      ? "card_reveal"
      : entry?.conversation && entry.conversation.length > 0
      ? "dialogue"
      : "greeting";

  return (
    <ChronicleFlow
      deckId={deck.id}
      initialEntry={entry}
      settings={settings}
      todayCard={todayCard}
      initialPhase={initialPhase}
      isFirstEntry={isFirstEntry}
    />
  );
}
