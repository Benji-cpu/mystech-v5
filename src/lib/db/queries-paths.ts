import { db } from "@/lib/db";
import {
  circles,
  paths,
  retreats,
  waypoints,
  userCircleProgress,
  userPathProgress,
  userRetreatProgress,
  userWaypointProgress,
  readingPathContext,
  readings,
  readingCards,
  cards,
  retreatCards,
  decks,
  userProfiles,
  practices,
  practiceSegments,
  userPracticeProgress,
} from "@/lib/db/schema";
import { eq, and, asc, desc, ne, sql, inArray, isNull, or, isNotNull } from "drizzle-orm";
import type {
  PathWithRetreats,
  PathStatus,
  PathPosition,
  CardPathMemory,
  PlanType,
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

// ── Circle queries ──────────────────────────────────────────────────

export async function getAllCircles() {
  return db.select().from(circles).orderBy(asc(circles.sortOrder));
}

export async function getCircleById(circleId: string) {
  const [circle] = await db
    .select()
    .from(circles)
    .where(eq(circles.id, circleId));
  return circle ?? null;
}

export async function getCircleWithPaths(circleId: string) {
  const circle = await getCircleById(circleId);
  if (!circle) return null;

  const circlePaths = await db
    .select()
    .from(paths)
    .where(eq(paths.circleId, circleId))
    .orderBy(asc(paths.sortOrder));

  return { ...circle, paths: circlePaths };
}

export async function getUserCircleProgressAll(userId: string) {
  const rows = await db
    .select()
    .from(userCircleProgress)
    .where(eq(userCircleProgress.userId, userId));
  return rows.map((r) => ({
    ...r,
    status: r.status as "locked" | "active" | "completed",
  }));
}

export async function getUserCircleProgressRecord(
  userId: string,
  circleId: string
) {
  const [row] = await db
    .select()
    .from(userCircleProgress)
    .where(
      and(
        eq(userCircleProgress.userId, userId),
        eq(userCircleProgress.circleId, circleId)
      )
    );
  return row
    ? { ...row, status: row.status as "locked" | "active" | "completed" }
    : null;
}

/**
 * Derive the user's active circle from their active path.
 * No activeCircleId column — always computed.
 */
export async function getActiveCircle(userId: string) {
  const [profile] = await db
    .select({ activePathId: userProfiles.activePathId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile?.activePathId) return null;

  const [path] = await db
    .select({ circleId: paths.circleId })
    .from(paths)
    .where(eq(paths.id, profile.activePathId));

  if (!path?.circleId) return null;

  return getCircleById(path.circleId);
}

/**
 * Check if a path is unlocked for a user.
 * Rules:
 * 1. The path's circle must be active or completed
 * 2. All previous paths in the circle (by sortOrder) must be completed
 */
export async function isPathUnlocked(
  userId: string,
  pathId: string
): Promise<{ unlocked: boolean; reason?: "circle_locked" | "path_locked" }> {
  const path = await getPathById(pathId);
  if (!path) return { unlocked: false, reason: "path_locked" };

  // No circle assigned — always unlocked (backward compat)
  if (!path.circleId) return { unlocked: true };

  // Check circle status
  const circleProgress = await getUserCircleProgressRecord(
    userId,
    path.circleId
  );

  // No circle progress = first circle is auto-unlocked, others are locked
  if (!circleProgress) {
    const circle = await getCircleById(path.circleId);
    if (!circle) return { unlocked: false, reason: "circle_locked" };
    // First circle (sortOrder 0) is always accessible
    if (circle.sortOrder === 0) {
      // But still need to check path order within circle
    } else {
      return { unlocked: false, reason: "circle_locked" };
    }
  } else if (circleProgress.status === "locked") {
    return { unlocked: false, reason: "circle_locked" };
  }

  // Circle is active or completed — check sequential path order
  const circlePaths = await db
    .select()
    .from(paths)
    .where(eq(paths.circleId, path.circleId))
    .orderBy(asc(paths.sortOrder));

  for (const cp of circlePaths) {
    if (cp.id === pathId) {
      // This is the target path — all predecessors must be completed
      return { unlocked: true };
    }

    // Check if this predecessor path is completed
    const progress = await getUserPathProgress(userId, cp.id);
    if (!progress || progress.status !== "completed") {
      return { unlocked: false, reason: "path_locked" };
    }
  }

  return { unlocked: true };
}

/**
 * Complete a circle and unlock the next one.
 */
export async function completeCircle(userId: string, circleId: string) {
  // Mark current circle as completed
  await db
    .update(userCircleProgress)
    .set({
      status: "completed",
      completedAt: new Date(),
    })
    .where(
      and(
        eq(userCircleProgress.userId, userId),
        eq(userCircleProgress.circleId, circleId)
      )
    );

  // Find the next circle by sortOrder
  const currentCircle = await getCircleById(circleId);
  if (!currentCircle) return;

  const [nextCircle] = await db
    .select()
    .from(circles)
    .where(
      and(
        sql`${circles.sortOrder} > ${currentCircle.sortOrder}`,
        eq(circles.isPreset, true)
      )
    )
    .orderBy(asc(circles.sortOrder))
    .limit(1);

  if (nextCircle) {
    // Create or update circle progress for next circle
    const existing = await getUserCircleProgressRecord(userId, nextCircle.id);
    if (!existing) {
      await db.insert(userCircleProgress).values({
        userId,
        circleId: nextCircle.id,
        status: "active",
        pathsCompleted: 0,
        startedAt: new Date(),
      });
    } else if (existing.status === "locked") {
      await db
        .update(userCircleProgress)
        .set({ status: "active", startedAt: new Date() })
        .where(eq(userCircleProgress.id, existing.id));
    }
  }
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

// ── Path position (current Path + Retreat + Waypoint) ────────────

export async function getPathPosition(
  userId: string
): Promise<PathPosition | null> {
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

  // Derive circle info from path.circleId
  let circle = null;
  let circleProgress = null;
  if (path.circleId) {
    const [circleRow] = await db
      .select()
      .from(circles)
      .where(eq(circles.id, path.circleId));
    circle = circleRow ?? null;

    if (circle) {
      const [circleProgRow] = await db
        .select()
        .from(userCircleProgress)
        .where(
          and(
            eq(userCircleProgress.userId, userId),
            eq(userCircleProgress.circleId, circle.id)
          )
        );
      circleProgress = circleProgRow
        ? { ...circleProgRow, status: circleProgRow.status as "locked" | "active" | "completed" }
        : null;
    }
  }

  return {
    circle,
    circleProgress,
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
  const position = await getPathPosition(userId);
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
 * appeared during the same Retreat. Returns path memory for prompt injection.
 */
export async function getCardPathHistory(
  userId: string,
  cardIds: string[],
  currentReadingId: string,
  retreatId: string
): Promise<CardPathMemory[]> {
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
      readingPathContext,
      eq(readingCards.readingId, readingPathContext.readingId)
    )
    .innerJoin(retreats, eq(readingPathContext.retreatId, retreats.id))
    .innerJoin(waypoints, eq(readingPathContext.waypointId, waypoints.id))
    .innerJoin(cards, eq(readingCards.cardId, cards.id))
    .where(
      and(
        eq(readings.userId, userId),
        ne(readings.id, currentReadingId),
        eq(readingPathContext.retreatId, retreatId),
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

  // ── Circle gating ──
  const unlockCheck = await isPathUnlocked(userId, pathId);
  if (!unlockCheck.unlocked) {
    const message =
      unlockCheck.reason === "circle_locked"
        ? "Complete the previous circle first"
        : "Complete the previous path in this circle first";
    const err = new Error(message);
    (err as Error & { code: string }).code = unlockCheck.reason ?? "path_locked";
    throw err;
  }

  // Ensure circle progress exists for the path's circle
  let circleProgressId: string | null = null;
  if (pathData.circleId) {
    let cpRecord = await getUserCircleProgressRecord(userId, pathData.circleId);
    if (!cpRecord) {
      // Auto-create circle progress as active (first circle or newly unlocked)
      const [newCp] = await db
        .insert(userCircleProgress)
        .values({
          userId,
          circleId: pathData.circleId,
          status: "active",
          pathsCompleted: 0,
          startedAt: new Date(),
        })
        .returning();
      cpRecord = { ...newCp, status: newCp.status as "locked" | "active" | "completed" };
    }
    circleProgressId = cpRecord.id;
  }

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
        circleProgressId,
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
 * required readings are met. Returns the new path position.
 */
export async function recordPathReading(
  userId: string,
  readingId: string,
  pathPosition: PathPosition
) {
  const { path, retreat, waypoint, pathProgress, retreatProgress, waypointProgress } =
    pathPosition;

  // Snapshot path context (include circle if present)
  await db.insert(readingPathContext).values({
    readingId,
    circleId: path.circleId ?? null,
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

  // Check combined gate (readings + practice) and advance if met
  await checkAndAdvanceWaypoint(userId, pathPosition);
}

// ── Retreat card queries ─────────────────────────────────────────────

/**
 * Get seed obstacle cards + user's earned obstacle cards for a retreat.
 */
export async function getRetreatObstacleCards(retreatId: string, userId?: string) {
  return db
    .select()
    .from(retreatCards)
    .where(
      and(
        eq(retreatCards.retreatId, retreatId),
        eq(retreatCards.cardType, "obstacle"),
        userId
          ? or(isNull(retreatCards.userId), eq(retreatCards.userId, userId))
          : isNull(retreatCards.userId)
      )
    )
    .orderBy(asc(retreatCards.sortOrder));
}

/**
 * Get user's earned threshold card for a retreat.
 */
export async function getRetreatThresholdCard(retreatId: string, userId: string) {
  const [card] = await db
    .select()
    .from(retreatCards)
    .where(
      and(
        eq(retreatCards.retreatId, retreatId),
        eq(retreatCards.cardType, "threshold"),
        eq(retreatCards.userId, userId)
      )
    );
  return card ?? null;
}

/**
 * Get all retreat cards for all retreats in a path.
 * Returns seed obstacle cards (visible to everyone) + user-specific earned cards.
 */
export async function getAllRetreatCardsForPath(pathId: string, userId?: string) {
  const pathRetreats = await db
    .select({ id: retreats.id })
    .from(retreats)
    .where(eq(retreats.pathId, pathId));

  if (pathRetreats.length === 0) return [];

  const retreatIds = pathRetreats.map((r) => r.id);

  return db
    .select()
    .from(retreatCards)
    .where(
      and(
        inArray(retreatCards.retreatId, retreatIds),
        userId
          ? or(isNull(retreatCards.userId), eq(retreatCards.userId, userId))
          : isNull(retreatCards.userId)
      )
    )
    .orderBy(asc(retreatCards.sortOrder), desc(retreatCards.createdAt));
}

/**
 * Get all obstacle and threshold cards for a given path (retreat cards).
 * This replaces the old getPathCards that queried the user deck cards table.
 */
export async function getPathCards(userId: string, pathId: string) {
  return getAllRetreatCardsForPath(pathId, userId);
}

// ── Practice queries ──────────────────────────────────────────────────

/**
 * Get practice for a waypoint. Pro users get personalized version if it exists,
 * otherwise fall back to template (userId IS NULL).
 */
export async function getPracticeForWaypoint(
  waypointId: string,
  userId: string,
  plan: PlanType
) {
  // For Pro users, check for personalized practice first
  if (plan === "pro" || plan === "admin") {
    const [personalized] = await db
      .select()
      .from(practices)
      .where(
        and(
          eq(practices.waypointId, waypointId),
          eq(practices.userId, userId)
        )
      );
    if (personalized) return personalized;
  }

  // Fall back to template practice
  const [template] = await db
    .select()
    .from(practices)
    .where(
      and(
        eq(practices.waypointId, waypointId),
        isNull(practices.userId)
      )
    );
  return template ?? null;
}

/**
 * Get practice segments ordered by sortOrder.
 */
export async function getPracticeSegments(practiceId: string) {
  return db
    .select()
    .from(practiceSegments)
    .where(eq(practiceSegments.practiceId, practiceId))
    .orderBy(asc(practiceSegments.sortOrder));
}

/**
 * Get user's practice progress for a specific practice.
 */
export async function getUserPracticeProgressRecord(
  userId: string,
  practiceId: string
) {
  const [progress] = await db
    .select()
    .from(userPracticeProgress)
    .where(
      and(
        eq(userPracticeProgress.userId, userId),
        eq(userPracticeProgress.practiceId, practiceId)
      )
    );
  return progress ?? null;
}

/**
 * Mark a practice as complete (upsert).
 * - No row → insert with completedAt, lastPlayedAt, playCount = 1
 * - Row exists, completedAt null → set completedAt, lastPlayedAt, playCount = 1
 * - Row exists, completedAt set (replay) → update lastPlayedAt, increment playCount
 */
export async function markPracticeComplete(userId: string, practiceId: string) {
  const existing = await getUserPracticeProgressRecord(userId, practiceId);
  const now = new Date();

  if (!existing) {
    await db.insert(userPracticeProgress).values({
      userId,
      practiceId,
      completedAt: now,
      lastPlayedAt: now,
      playCount: 1,
    });
  } else if (!existing.completedAt) {
    await db
      .update(userPracticeProgress)
      .set({ completedAt: now, lastPlayedAt: now, playCount: 1 })
      .where(eq(userPracticeProgress.id, existing.id));
  } else {
    await db
      .update(userPracticeProgress)
      .set({
        lastPlayedAt: now,
        playCount: existing.playCount + 1,
      })
      .where(eq(userPracticeProgress.id, existing.id));
  }
}

/**
 * Batch query: get practice progress for multiple waypoints at once.
 * Returns a map of waypointId → { practiceId, completed, playCount }.
 */
export async function getPracticeProgressForWaypoints(
  userId: string,
  waypointIds: string[]
) {
  if (waypointIds.length === 0) return new Map<string, { practiceId: string; completed: boolean; playCount: number }>();

  // Find practices for these waypoints (template or personalized)
  const waypointPractices = await db
    .select({
      practiceId: practices.id,
      waypointId: practices.waypointId,
    })
    .from(practices)
    .where(
      and(
        inArray(practices.waypointId, waypointIds),
        or(isNull(practices.userId), eq(practices.userId, userId))
      )
    );

  if (waypointPractices.length === 0) return new Map<string, { practiceId: string; completed: boolean; playCount: number }>();

  const practiceIds = waypointPractices.map((p) => p.practiceId);

  // Get user's progress for these practices
  const progressRows = await db
    .select()
    .from(userPracticeProgress)
    .where(
      and(
        eq(userPracticeProgress.userId, userId),
        inArray(userPracticeProgress.practiceId, practiceIds)
      )
    );

  const progressByPracticeId = new Map(
    progressRows.map((p) => [p.practiceId, p])
  );

  // Build result map keyed by waypointId
  const result = new Map<string, { practiceId: string; completed: boolean; playCount: number }>();
  for (const wp of waypointPractices) {
    if (!wp.waypointId) continue;
    const prog = progressByPracticeId.get(wp.practiceId);
    result.set(wp.waypointId, {
      practiceId: wp.practiceId,
      completed: !!prog?.completedAt,
      playCount: prog?.playCount ?? 0,
    });
  }

  return result;
}

// ── Waypoint advancement (shared between readings + practices) ────────

/**
 * Check whether a waypoint's combined requirements are met and advance if so.
 * Combined gate: readingCount >= requiredReadings AND (no practice exists OR practice completed).
 * Uses optimistic guard to prevent double-advance races.
 */
export async function checkAndAdvanceWaypoint(
  userId: string,
  pathPosition: PathPosition
): Promise<void> {
  const { path, retreat, waypoint, pathProgress, retreatProgress } = pathPosition;

  // Re-read current waypoint progress (fresh from DB)
  const [freshWpProgress] = await db
    .select()
    .from(userWaypointProgress)
    .where(
      and(
        eq(userWaypointProgress.userId, userId),
        eq(userWaypointProgress.waypointId, waypoint.id)
      )
    );
  if (!freshWpProgress) return;

  // Check reading requirement
  if (freshWpProgress.readingCount < waypoint.requiredReadings) return;

  // Check practice requirement — is there a template practice for this waypoint?
  const [templatePractice] = await db
    .select({ id: practices.id })
    .from(practices)
    .where(
      and(
        eq(practices.waypointId, waypoint.id),
        isNull(practices.userId)
      )
    );

  if (templatePractice) {
    // Practice exists — check if user has completed ANY practice at this waypoint
    // (could be template or personalized version)
    const waypointPracticeIds = await db
      .select({ id: practices.id })
      .from(practices)
      .where(eq(practices.waypointId, waypoint.id));

    const practiceIds = waypointPracticeIds.map((p) => p.id);

    if (practiceIds.length > 0) {
      const [completedPractice] = await db
        .select()
        .from(userPracticeProgress)
        .where(
          and(
            eq(userPracticeProgress.userId, userId),
            inArray(userPracticeProgress.practiceId, practiceIds),
            isNotNull(userPracticeProgress.completedAt)
          )
        )
        .limit(1);

      if (!completedPractice) return; // Practice required but not completed
    }
  }

  // Optimistic guard: re-read status — if already completed, bail
  if (freshWpProgress.status === "completed") return;

  // ── Mark waypoint complete and cascade advancement ──

  await db
    .update(userWaypointProgress)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(userWaypointProgress.id, freshWpProgress.id));

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
        (err) => console.error("[paths] threshold card error:", err)
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

      // ── Circle completion check ──
      // If this path belongs to a circle, increment pathsCompleted
      // and check if all paths in the circle are done.
      if (path.circleId) {
        const circleProgRecord = await getUserCircleProgressRecord(
          userId,
          path.circleId
        );

        if (circleProgRecord && circleProgRecord.status === "active") {
          const newPathsCompleted = circleProgRecord.pathsCompleted + 1;

          // Count total paths in this circle
          const circlePaths = await db
            .select({ id: paths.id })
            .from(paths)
            .where(eq(paths.circleId, path.circleId));

          const totalPaths = circlePaths.length;

          await db
            .update(userCircleProgress)
            .set({ pathsCompleted: newPathsCompleted })
            .where(eq(userCircleProgress.id, circleProgRecord.id));

          if (newPathsCompleted >= totalPaths) {
            // All paths in this circle are complete — complete the circle
            await completeCircle(userId, path.circleId);
          }
        }
      }
    }
  }
}
