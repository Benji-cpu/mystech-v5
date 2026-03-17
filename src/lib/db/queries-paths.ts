import { db } from "@/lib/db";
import {
  paths,
  retreats,
  waypoints,
  userPathProgress,
  userRetreatProgress,
  userWaypointProgress,
  readingJourneyContext,
  readings,
  readingCards,
  cards,
  decks,
  userProfiles,
} from "@/lib/db/schema";
import { eq, and, asc, desc, ne, sql, inArray } from "drizzle-orm";
import type {
  PathWithRetreats,
  PathStatus,
  JourneyPosition,
  CardJourneyMemory,
} from "@/types";

// ── Path queries ────────────────────────────────────────────────────

export async function getAllPaths() {
  return db.select().from(paths).orderBy(asc(paths.sortOrder));
}

export async function getPathById(pathId: string) {
  const [path] = await db.select().from(paths).where(eq(paths.id, pathId));
  return path ?? null;
}

export async function getPathWithRetreatsAndWaypoints(
  pathId: string
): Promise<PathWithRetreats | null> {
  const path = await getPathById(pathId);
  if (!path) return null;

  const pathRetreats = await db
    .select()
    .from(retreats)
    .where(eq(retreats.pathId, pathId))
    .orderBy(asc(retreats.sortOrder));

  const retreatsWithWaypoints = await Promise.all(
    pathRetreats.map(async (retreat) => {
      const retreatWaypoints = await db
        .select()
        .from(waypoints)
        .where(eq(waypoints.retreatId, retreat.id))
        .orderBy(asc(waypoints.sortOrder));
      return { ...retreat, waypoints: retreatWaypoints };
    })
  );

  return { ...path, retreats: retreatsWithWaypoints };
}

// ── Progress queries ────────────────────────────────────────────────

export async function getUserPathProgress(userId: string, pathId: string) {
  const [progress] = await db
    .select()
    .from(userPathProgress)
    .where(
      and(
        eq(userPathProgress.userId, userId),
        eq(userPathProgress.pathId, pathId)
      )
    );
  return progress ?? null;
}

export async function getActivePathProgress(userId: string) {
  const [profile] = await db
    .select({ activePathId: userProfiles.activePathId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile?.activePathId) return null;

  return getUserPathProgress(userId, profile.activePathId);
}

export async function getAllUserPathProgress(userId: string) {
  return db
    .select()
    .from(userPathProgress)
    .where(eq(userPathProgress.userId, userId));
}

export async function getUserRetreatProgress(
  userId: string,
  retreatId: string
) {
  const [progress] = await db
    .select()
    .from(userRetreatProgress)
    .where(
      and(
        eq(userRetreatProgress.userId, userId),
        eq(userRetreatProgress.retreatId, retreatId)
      )
    );
  return progress ?? null;
}

export async function getUserWaypointProgress(
  userId: string,
  waypointId: string
) {
  const [progress] = await db
    .select()
    .from(userWaypointProgress)
    .where(
      and(
        eq(userWaypointProgress.userId, userId),
        eq(userWaypointProgress.waypointId, waypointId)
      )
    );
  return progress ?? null;
}

export async function getRetreatProgressForPath(
  userId: string,
  pathProgressId: string
) {
  return db
    .select()
    .from(userRetreatProgress)
    .where(
      and(
        eq(userRetreatProgress.userId, userId),
        eq(userRetreatProgress.pathProgressId, pathProgressId)
      )
    );
}

export async function getWaypointProgressForRetreat(
  userId: string,
  retreatProgressId: string
) {
  return db
    .select()
    .from(userWaypointProgress)
    .where(
      and(
        eq(userWaypointProgress.userId, userId),
        eq(userWaypointProgress.retreatProgressId, retreatProgressId)
      )
    );
}

// ── Journey position (current Path + Retreat + Waypoint) ────────────

export async function getJourneyPosition(
  userId: string
): Promise<JourneyPosition | null> {
  const [profile] = await db
    .select({ activePathId: userProfiles.activePathId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile?.activePathId) return null;

  const pathProgress = await getUserPathProgress(userId, profile.activePathId);
  if (!pathProgress || pathProgress.status !== "active") return null;
  if (!pathProgress.currentRetreatId || !pathProgress.currentWaypointId)
    return null;

  const [path, retreat, waypoint, retreatProg, waypointProg] =
    await Promise.all([
      getPathById(pathProgress.pathId),
      db
        .select()
        .from(retreats)
        .where(eq(retreats.id, pathProgress.currentRetreatId))
        .then((r) => r[0] ?? null),
      db
        .select()
        .from(waypoints)
        .where(eq(waypoints.id, pathProgress.currentWaypointId))
        .then((r) => r[0] ?? null),
      getUserRetreatProgress(userId, pathProgress.currentRetreatId),
      getUserWaypointProgress(userId, pathProgress.currentWaypointId),
    ]);

  if (!path || !retreat || !waypoint || !retreatProg || !waypointProg)
    return null;

  return {
    path,
    retreat,
    waypoint,
    pathProgress: { ...pathProgress, status: pathProgress.status as PathStatus },
    retreatProgress: { ...retreatProg, status: retreatProg.status as "active" | "completed", artifactThemes: (retreatProg.artifactThemes ?? []) as string[] },
    waypointProgress: { ...waypointProg, status: waypointProg.status as "active" | "completed" },
  };
}

// ── Daily pacing ────────────────────────────────────────────────────

/**
 * Check whether the user can advance to / work on the current waypoint.
 * Returns false if the waypoint has a `nextAvailableAt` timestamp in the future.
 */
export async function canAdvanceWaypoint(
  userId: string
): Promise<{ allowed: boolean; nextAvailableAt: Date | null }> {
  const position = await getJourneyPosition(userId);
  if (!position) return { allowed: true, nextAvailableAt: null };

  const wpProgress = position.waypointProgress;
  const nextAt = (wpProgress as { nextAvailableAt?: Date | null }).nextAvailableAt ?? null;

  if (!nextAt) return { allowed: true, nextAvailableAt: null };
  if (new Date() >= nextAt) return { allowed: true, nextAvailableAt: null };

  return { allowed: false, nextAvailableAt: nextAt };
}

// ── "Cards Remember" engine ─────────────────────────────────────────

/**
 * For each card drawn in a reading, find past readings where the same card
 * appeared during the same Retreat. Returns journey memory for prompt injection.
 */
export async function getCardJourneyHistory(
  userId: string,
  cardIds: string[],
  currentReadingId: string,
  retreatId: string
): Promise<CardJourneyMemory[]> {
  if (cardIds.length === 0) return [];

  // Find past readings with these cards in the same retreat
  const results = await db
    .select({
      cardTitle: cards.title,
      retreatName: retreats.name,
      waypointName: waypoints.name,
      question: readings.question,
      readingDate: readings.createdAt,
    })
    .from(readingCards)
    .innerJoin(readings, eq(readingCards.readingId, readings.id))
    .innerJoin(
      readingJourneyContext,
      eq(readingCards.readingId, readingJourneyContext.readingId)
    )
    .innerJoin(retreats, eq(readingJourneyContext.retreatId, retreats.id))
    .innerJoin(waypoints, eq(readingJourneyContext.waypointId, waypoints.id))
    .innerJoin(cards, eq(readingCards.cardId, cards.id))
    .where(
      and(
        eq(readings.userId, userId),
        ne(readings.id, currentReadingId),
        eq(readingJourneyContext.retreatId, retreatId),
        sql`${readingCards.cardId} IN (${sql.join(
          cardIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
    )
    .orderBy(desc(readings.createdAt))
    .limit(10);

  return results;
}

// ── Path activation ─────────────────────────────────────────────────

/**
 * Activate a Path for a user. Creates progress records if needed,
 * sets the first Retreat + Waypoint as current.
 */
export async function activatePath(userId: string, pathId: string) {
  const pathData = await getPathWithRetreatsAndWaypoints(pathId);
  if (!pathData) throw new Error("Path not found");

  // Check for existing progress
  let progress = await getUserPathProgress(userId, pathId);

  if (!progress) {
    // First time — create path, retreat, and waypoint progress
    const firstRetreat = pathData.retreats[0];
    if (!firstRetreat) throw new Error("Path has no retreats");
    const firstWaypoint = firstRetreat.waypoints[0];
    if (!firstWaypoint) throw new Error("Retreat has no waypoints");

    const [pathProg] = await db
      .insert(userPathProgress)
      .values({
        userId,
        pathId,
        status: "active",
        currentRetreatId: firstRetreat.id,
        currentWaypointId: firstWaypoint.id,
      })
      .returning();

    const [retreatProg] = await db
      .insert(userRetreatProgress)
      .values({
        userId,
        retreatId: firstRetreat.id,
        pathProgressId: pathProg.id,
        status: "active",
      })
      .returning();

    await db.insert(userWaypointProgress).values({
      userId,
      waypointId: firstWaypoint.id,
      retreatProgressId: retreatProg.id,
      status: "active",
    });

    progress = pathProg;
  } else if (progress.status === "paused") {
    // Resume — set back to active
    await db
      .update(userPathProgress)
      .set({ status: "active" })
      .where(eq(userPathProgress.id, progress.id));
  }

  // Pause any other active paths
  const allProgress = await getAllUserPathProgress(userId);
  for (const p of allProgress) {
    if (p.pathId !== pathId && p.status === "active") {
      await db
        .update(userPathProgress)
        .set({ status: "paused" })
        .where(eq(userPathProgress.id, p.id));
    }
  }

  // Set as active path on profile
  await db
    .update(userProfiles)
    .set({ activePathId: pathId, updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId));

  return progress;
}

// ── Waypoint completion + auto-advance ──────────────────────────────

/**
 * Record a reading against the current waypoint and auto-advance if the
 * required readings are met. Returns the new journey position.
 */
export async function recordJourneyReading(
  userId: string,
  readingId: string,
  journeyPosition: JourneyPosition
) {
  const { path, retreat, waypoint, pathProgress, retreatProgress, waypointProgress } =
    journeyPosition;

  // Snapshot journey context
  await db.insert(readingJourneyContext).values({
    readingId,
    pathId: path.id,
    retreatId: retreat.id,
    waypointId: waypoint.id,
    pathLensSnapshot: path.interpretiveLens,
    retreatLensSnapshot: retreat.retreatLens,
    waypointLensSnapshot: waypoint.waypointLens,
    waypointIntentionSnapshot: waypoint.suggestedIntention,
  });

  // Set pathId on reading for quick filtering
  await db
    .update(readings)
    .set({ pathId: path.id })
    .where(eq(readings.id, readingId));

  // Increment waypoint reading count
  const newWaypointCount = waypointProgress.readingCount + 1;
  await db
    .update(userWaypointProgress)
    .set({ readingCount: newWaypointCount })
    .where(eq(userWaypointProgress.id, waypointProgress.id));

  // Increment retreat reading count
  await db
    .update(userRetreatProgress)
    .set({ readingCount: retreatProgress.readingCount + 1 })
    .where(eq(userRetreatProgress.id, retreatProgress.id));

  // Check if waypoint is complete
  if (newWaypointCount >= waypoint.requiredReadings) {
    await db
      .update(userWaypointProgress)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(userWaypointProgress.id, waypointProgress.id));

    // Find next waypoint in this retreat
    const retreatWaypoints = await db
      .select()
      .from(waypoints)
      .where(eq(waypoints.retreatId, retreat.id))
      .orderBy(asc(waypoints.sortOrder));

    const currentWpIndex = retreatWaypoints.findIndex(
      (w) => w.id === waypoint.id
    );
    const nextWaypoint = retreatWaypoints[currentWpIndex + 1];

    if (nextWaypoint) {
      // Advance to next waypoint in same retreat
      await db
        .update(userPathProgress)
        .set({ currentWaypointId: nextWaypoint.id })
        .where(eq(userPathProgress.id, pathProgress.id));

      // Daily pacing: next waypoint unlocks at midnight tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      await db.insert(userWaypointProgress).values({
        userId,
        waypointId: nextWaypoint.id,
        retreatProgressId: retreatProgress.id,
        status: "active",
        nextAvailableAt: tomorrow,
      });
    } else {
      // Last waypoint in retreat — mark retreat complete
      await db
        .update(userRetreatProgress)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(userRetreatProgress.id, retreatProgress.id));

      // Fire-and-forget threshold card generation
      import("@/lib/ai/threshold-card").then(({ generateThresholdCard }) => {
        generateThresholdCard(userId, retreat.id, retreatProgress.id).catch(
          (err) => console.error("[journey] threshold card error:", err)
        );
      });

      // Find next retreat in path
      const pathRetreats = await db
        .select()
        .from(retreats)
        .where(eq(retreats.pathId, path.id))
        .orderBy(asc(retreats.sortOrder));

      const currentRetreatIndex = pathRetreats.findIndex(
        (r) => r.id === retreat.id
      );
      const nextRetreat = pathRetreats[currentRetreatIndex + 1];

      if (nextRetreat) {
        // Advance to first waypoint of next retreat
        const nextRetreatWaypoints = await db
          .select()
          .from(waypoints)
          .where(eq(waypoints.retreatId, nextRetreat.id))
          .orderBy(asc(waypoints.sortOrder));

        const firstWaypoint = nextRetreatWaypoints[0];
        if (!firstWaypoint) throw new Error("Next retreat has no waypoints");

        const [newRetreatProg] = await db
          .insert(userRetreatProgress)
          .values({
            userId,
            retreatId: nextRetreat.id,
            pathProgressId: pathProgress.id,
            status: "active",
          })
          .returning();

        // Daily pacing: next retreat's first waypoint unlocks tomorrow
        const tomorrowRetreat = new Date();
        tomorrowRetreat.setDate(tomorrowRetreat.getDate() + 1);
        tomorrowRetreat.setHours(0, 0, 0, 0);

        await db.insert(userWaypointProgress).values({
          userId,
          waypointId: firstWaypoint.id,
          retreatProgressId: newRetreatProg.id,
          status: "active",
          nextAvailableAt: tomorrowRetreat,
        });

        await db
          .update(userPathProgress)
          .set({
            currentRetreatId: nextRetreat.id,
            currentWaypointId: firstWaypoint.id,
          })
          .where(eq(userPathProgress.id, pathProgress.id));
      } else {
        // Last retreat — mark entire path complete
        await db
          .update(userPathProgress)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(userPathProgress.id, pathProgress.id));
      }
    }
  }
}

// ── Preferred deck for path cards ─────────────────────────────────────

/**
 * Find the best deck to attach path cards (threshold/obstacle) to.
 * Priority: most-used deck in this retreat's readings > chronicle deck > first completed deck.
 */
export async function getPreferredDeckForPathCards(
  userId: string,
  retreatId: string
) {
  // 1. Find the deck used most in this retreat's readings
  const deckUsage = await db
    .select({
      deckId: readings.deckId,
      count: sql<number>`count(*)::int`,
    })
    .from(readings)
    .innerJoin(
      readingJourneyContext,
      eq(readings.id, readingJourneyContext.readingId)
    )
    .where(
      and(
        eq(readings.userId, userId),
        eq(readingJourneyContext.retreatId, retreatId)
      )
    )
    .groupBy(readings.deckId)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  if (deckUsage.length > 0) {
    const [deck] = await db
      .select()
      .from(decks)
      .where(eq(decks.id, deckUsage[0].deckId));
    if (deck) return deck;
  }

  // 2. Fallback: chronicle deck
  const [chronicleDeck] = await db
    .select()
    .from(decks)
    .where(
      and(
        eq(decks.userId, userId),
        eq(decks.deckType, "chronicle")
      )
    )
    .limit(1);
  if (chronicleDeck) return chronicleDeck;

  // 3. Fallback: first completed deck
  const [firstDeck] = await db
    .select()
    .from(decks)
    .where(
      and(
        eq(decks.userId, userId),
        eq(decks.status, "completed")
      )
    )
    .orderBy(asc(decks.createdAt))
    .limit(1);

  return firstDeck ?? null;
}

// ── Path cards query ──────────────────────────────────────────────────

/**
 * Get all obstacle and threshold cards for a given path.
 */
export async function getPathCards(userId: string, pathId: string) {
  const result = await db
    .select({
      id: cards.id,
      deckId: cards.deckId,
      cardNumber: cards.cardNumber,
      title: cards.title,
      meaning: cards.meaning,
      guidance: cards.guidance,
      imageUrl: cards.imageUrl,
      imagePrompt: cards.imagePrompt,
      imageStatus: cards.imageStatus,
      cardType: cards.cardType,
      originContext: cards.originContext,
      createdAt: cards.createdAt,
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(
      and(
        eq(decks.userId, userId),
        inArray(cards.cardType, ["obstacle", "threshold"]),
        sql`${cards.originContext}->>'pathId' = ${pathId}`
      )
    )
    .orderBy(desc(cards.createdAt));

  return result;
}
