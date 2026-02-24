import { requireAuth, isAdmin } from "@/lib/auth/helpers";
import { getUserCompletedDecks, getUserPlan } from "@/lib/db/queries";
import { ReadingFlow } from "@/components/readings/reading-flow";
import type { Deck, PlanType } from "@/types";

export default async function NewReadingPage() {
  const user = await requireAuth();
  const [rows, resolvedPlan] = await Promise.all([
    getUserCompletedDecks(user.id!),
    getUserPlan(user.id!),
  ]);
  const plan: PlanType = isAdmin(user) ? "admin" : resolvedPlan;

  const decks: Deck[] = rows.map((d) => ({
    id: d.id,
    userId: d.userId,
    title: d.title,
    description: d.description,
    theme: d.theme,
    status: d.status as Deck["status"],
    deckType: (d.deckType ?? "standard") as Deck["deckType"],
    cardCount: d.cardCount,
    isPublic: d.isPublic,
    shareToken: d.shareToken ?? null,
    coverImageUrl: d.coverImageUrl,
    artStyleId: d.artStyleId,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return <ReadingFlow decks={decks} userPlan={plan} userRole={user.role ?? "user"} />;
}
