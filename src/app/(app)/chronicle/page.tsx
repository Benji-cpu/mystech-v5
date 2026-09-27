import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserChronicleDeck,
  getTodayChronicleEntry,
  getChronicleSettings,
  getTodayChronicleCard,
  getChronicleEntries,
  getChronicleKnowledge,
  getRecentChronicleEntries,
  getRecentChronicleCards,
  getPendingEmergenceEvent,
} from "@/lib/db/queries";
import { resolveUserName } from "@/lib/auth/get-user-name";
import { ChronicleFlow } from "@/components/chronicle/chronicle-flow";

export const metadata = {
  title: "Chronicle — MysTech",
};

/**
 * Chronicle — the optional deeper practice. Today's card is the daily ritual
 * and lives on /today; this is where a Chronicle keeper writes today's entry.
 */
export default async function ChroniclePage() {
  const user = await requireAuth();
  const deck = await getUserChronicleDeck(user.id!);
  if (!deck) redirect("/chronicle/setup");

  const [entry, settings, todayCard, pastEntries, knowledge, recentEntries, recentCards, pendingEmergence] =
    await Promise.all([
      getTodayChronicleEntry(user.id!),
      getChronicleSettings(deck.id),
      getTodayChronicleCard(user.id!),
      getChronicleEntries(user.id!, 1),
      getChronicleKnowledge(user.id!),
      getRecentChronicleEntries(user.id!, 3),
      getRecentChronicleCards(deck.id, 1),
      getPendingEmergenceEvent(user.id!),
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
      userName={resolveUserName(user)}
      knowledge={knowledge}
      recentEntries={recentEntries.map((e, i) => ({
        mood: e.mood,
        themes: e.themes ?? [],
        cardTitle: i === 0 ? recentCards[0]?.title : undefined,
      }))}
      pendingEmergence={pendingEmergence}
    />
  );
}
