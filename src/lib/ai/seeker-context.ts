/**
 * Unified seeker context — the single builder for "what the app knows about
 * you" when talking to the AI. Consolidates the three layers that were
 * previously assembled inline in /api/ai/reading:
 *
 *   1. user context   — profile summary, recent readings, deck themes
 *                       (userProfiles + readings + decks via getUserReadingContext;
 *                       the profile summary already folds in chronicle knowledge
 *                       through context compression)
 *   2. astro context  — birth chart big three + current celestial weather
 *                       (astrologyProfiles + getCurrentCelestialContext)
 *   3. journey context — the path/retreat/waypoint lens snapshot for a
 *                       specific reading, plus "cards remember" history
 *                       (readingPathContext + getCardPathHistory)
 *
 * The chronicle dialogue routes intentionally consume only the chronicle
 * knowledge slice directly (getChronicleKnowledge) — their prompts are
 * conversational, not interpretive, and don't take the full bundle.
 */
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  astrologyProfiles,
  readingPathContext,
  paths,
  retreats,
  waypoints,
  circles,
} from "@/lib/db/schema";
import { getUserReadingContext, getUserDisplayName } from "@/lib/db/queries";
import { getCardPathHistory } from "@/lib/db/queries-paths";
import { getCurrentCelestialContext } from "@/lib/astrology/birth-chart";
import type {
  AstrologicalReadingContext,
  PathContextForPrompt,
  ReadingLength,
} from "@/types";

export interface SeekerContext {
  userContext: {
    contextSummary: string | null;
    recentReadings: { question: string | null; spreadType: string; feedback: string | null }[];
    deckThemes: string[];
  };
  readingLength: ReadingLength;
  userName: string;
  astroContext?: AstrologicalReadingContext;
  journeyContext?: PathContextForPrompt;
}

export async function buildSeekerContext(
  userId: string,
  opts?: {
    /**
     * Attach the journey-lens snapshot recorded for this reading (if any).
     * cardIds may be a promise so callers can keep their card fetch parallel.
     */
    reading?: { readingId: string; cardIds: string[] | Promise<string[]> };
  }
): Promise<SeekerContext> {
  const [userContextWithLength, astroProfileResult, userName] = await Promise.all([
    getUserReadingContext(userId),
    db.select().from(astrologyProfiles).where(eq(astrologyProfiles.userId, userId)),
    getUserDisplayName(userId),
  ]);

  const { readingLength, ...userContext } = userContextWithLength;

  // Layer 2: astrology, if a birth chart exists
  let astroContext: AstrologicalReadingContext | undefined;
  const astroProfile = astroProfileResult[0];
  if (astroProfile) {
    const celestial = getCurrentCelestialContext();
    astroContext = {
      sunSign: astroProfile.sunSign,
      moonSign: astroProfile.moonSign,
      risingSign: astroProfile.risingSign,
      elementBalance: astroProfile.elementBalance as AstrologicalReadingContext["elementBalance"],
      currentMoonPhase: celestial.moonPhase,
      currentMoonSign: celestial.moonSign,
    };
  }

  // Layer 3: journey lens snapshot for a specific reading
  let journeyContext: PathContextForPrompt | undefined;
  if (opts?.reading) {
    const { readingId, cardIds } = opts.reading;
    const [journeyContextRow] = await db
      .select()
      .from(readingPathContext)
      .where(eq(readingPathContext.readingId, readingId));

    if (journeyContextRow) {
      const cardsRemember = await getCardPathHistory(
        userId,
        await cardIds,
        readingId,
        journeyContextRow.retreatId
      );

      journeyContext = {
        circleName: null,
        circleNumber: null,
        pathName: "",
        pathLens: journeyContextRow.pathLensSnapshot,
        retreatName: "",
        retreatLens: journeyContextRow.retreatLensSnapshot,
        waypointName: "",
        waypointLens: journeyContextRow.waypointLensSnapshot,
        suggestedIntention: journeyContextRow.waypointIntentionSnapshot,
        cardsRemember,
      };

      const [pathRow, retreatRow, waypointRow] = await Promise.all([
        db.select({ name: paths.name }).from(paths).where(eq(paths.id, journeyContextRow.pathId)).then((r) => r[0]),
        db.select({ name: retreats.name }).from(retreats).where(eq(retreats.id, journeyContextRow.retreatId)).then((r) => r[0]),
        db.select({ name: waypoints.name }).from(waypoints).where(eq(waypoints.id, journeyContextRow.waypointId)).then((r) => r[0]),
      ]);
      journeyContext.pathName = pathRow?.name ?? "Unknown Path";
      journeyContext.retreatName = retreatRow?.name ?? "Unknown Retreat";
      journeyContext.waypointName = waypointRow?.name ?? "Unknown Waypoint";

      if (journeyContextRow.circleId) {
        const [circleRow] = await db
          .select({ name: circles.name, circleNumber: circles.circleNumber })
          .from(circles)
          .where(eq(circles.id, journeyContextRow.circleId));
        if (circleRow) {
          journeyContext.circleName = circleRow.name;
          journeyContext.circleNumber = circleRow.circleNumber;
        }
      }
    }
  }

  return { userContext, readingLength, userName, astroContext, journeyContext };
}
