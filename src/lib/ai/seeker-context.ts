/**
 * Unified seeker context — the single builder for "what the app knows about
 * you" when interpreting a reading: profile summary, recent readings and deck
 * themes (userProfiles + readings + decks via getUserReadingContext; the
 * profile summary already folds in chronicle knowledge through context
 * compression).
 *
 * The chronicle dialogue routes intentionally consume only the chronicle
 * knowledge slice directly (getChronicleKnowledge) — their prompts are
 * conversational, not interpretive, and don't take the full bundle.
 */
import { getUserReadingContext, getUserDisplayName } from "@/lib/db/queries";
import type { ReadingLength } from "@/types";

export interface SeekerContext {
  userContext: {
    contextSummary: string | null;
    recentReadings: { question: string | null; spreadType: string; feedback: string | null }[];
    deckThemes: string[];
  };
  readingLength: ReadingLength;
  userName: string;
}

export async function buildSeekerContext(userId: string): Promise<SeekerContext> {
  const [userContextWithLength, userName] = await Promise.all([
    getUserReadingContext(userId),
    getUserDisplayName(userId),
  ]);

  const { readingLength, ...userContext } = userContextWithLength;
  return { userContext, readingLength, userName };
}
