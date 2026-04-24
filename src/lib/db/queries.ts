import { db } from "@/lib/db";
import { decks, cards, artStyles, readings, readingCards, retreatCards, conversations, deckMetadata, subscriptions, users, userProfiles, deckAdoptions, cardFeedback, livingDeckSettings, chronicleSettings, chronicleEntries, chronicleKnowledge, astrologyProfiles, emergenceEvents, cardOverrides } from "@/lib/db/schema";
import { eq, and, asc, count, ne, desc, gte, gt, sql, isNotNull } from "drizzle-orm";
import type { Deck, DeckWithOwner, DraftDeckWithPhase, JourneyPhase, DraftCard, PlanType, UserProfile, UserContextProfile, ReadingLength, CardFeedbackType, VoicePreferences, VoiceSpeed, ChronicleEntry, ChronicleSettings, ChronicleKnowledge, ChronicleInterests, ChronicleBadge, AstrologyProfile, ActivityItem, EmergenceEvent } from "@/types";
import { getBadgeById } from "@/lib/chronicle/badges";

export async function getUserDisplayName(userId: string): Promise<string> {
  const [row] = await db
    .select({ displayName: users.displayName, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.displayName?.trim() || row?.name?.trim() || "Seeker";
}

export async function getDeckByIdForUser(deckId: string, userId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)));
  return deck ?? null;
}

/**
 * Count user's decks, excluding draft decks.
 * Draft decks are reserved for partial Journey mode saves and shouldn't
 * count against the user's deck limit.
 */
export async function getUserDeckCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(decks)
    .where(and(eq(decks.userId, userId), ne(decks.status, "draft")));
  return result?.count ?? 0;
}

export async function getCardsForDeck(deckId: string) {
  return db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(asc(cards.cardNumber));
}

export async function getArtStyleById(artStyleId: string) {
  const [style] = await db
    .select()
    .from(artStyles)
    .where(eq(artStyles.id, artStyleId));
  return style ?? null;
}

// --- Journey mode queries ---

export async function getConversationForDeck(deckId: string) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.deckId, deckId))
    .orderBy(asc(conversations.createdAt));
}

export async function getDeckMetadata(deckId: string) {
  const [metadata] = await db
    .select()
    .from(deckMetadata)
    .where(eq(deckMetadata.deckId, deckId));
  return metadata ?? null;
}

export async function getUserDraftDecks(userId: string): Promise<DraftDeckWithPhase[]> {
  const rows = await db
    .select({
      id: decks.id,
      userId: decks.userId,
      title: decks.title,
      description: decks.description,
      theme: decks.theme,
      status: decks.status,
      deckType: decks.deckType,
      cardCount: decks.cardCount,
      isPublic: decks.isPublic,
      shareToken: decks.shareToken,
      coverImageUrl: decks.coverImageUrl,
      artStyleId: decks.artStyleId,
      createdAt: decks.createdAt,
      updatedAt: decks.updatedAt,
      draftCards: deckMetadata.draftCards,
    })
    .from(decks)
    .leftJoin(deckMetadata, eq(decks.id, deckMetadata.deckId))
    .where(and(eq(decks.userId, userId), eq(decks.status, "draft")))
    .orderBy(desc(decks.updatedAt));

  return rows.map((row) => {
    const hasDraftCards = Array.isArray(row.draftCards) && row.draftCards.length > 0;
    const phase: JourneyPhase = hasDraftCards ? "review" : "chat";
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      description: row.description,
      theme: row.theme,
      status: row.status as Deck["status"],
      deckType: (row.deckType ?? "standard") as Deck["deckType"],
      cardCount: row.cardCount,
      isPublic: row.isPublic,
      shareToken: row.shareToken ?? null,
      coverImageUrl: row.coverImageUrl,
      artStyleId: row.artStyleId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      journeyPhase: phase,
      resumeHref: `/decks/new/journey/${row.id}/${phase}`,
    };
  });
}

// --- Reading queries ---

export async function getUserCompletedDecks(userId: string) {
  return db
    .select()
    .from(decks)
    .where(and(eq(decks.userId, userId), eq(decks.status, "completed")))
    .orderBy(desc(decks.updatedAt));
}

export async function getReadingByIdForUser(readingId: string, userId: string) {
  const [reading] = await db
    .select()
    .from(readings)
    .where(and(eq(readings.id, readingId), eq(readings.userId, userId)));
  return reading ?? null;
}

export async function getReadingCardsWithData(readingId: string) {
  return db
    .select({
      id: readingCards.id,
      readingId: readingCards.readingId,
      position: readingCards.position,
      positionName: readingCards.positionName,
      cardId: readingCards.cardId,
      retreatCardId: readingCards.retreatCardId,
      personCardId: readingCards.personCardId,
      createdAt: readingCards.createdAt,
      card: {
        id: cards.id,
        deckId: cards.deckId,
        cardNumber: cards.cardNumber,
        title: cards.title,
        meaning: cards.meaning,
        guidance: cards.guidance,
        imageUrl: cards.imageUrl,
        imageBlurData: cards.imageBlurData,
        imagePrompt: cards.imagePrompt,
        imageStatus: cards.imageStatus,
        cardType: cards.cardType,
        originContext: cards.originContext,
        createdAt: cards.createdAt,
        updatedAt: cards.updatedAt,
      },
      retreatCard: {
        id: retreatCards.id,
        retreatId: retreatCards.retreatId,
        cardType: retreatCards.cardType,
        source: retreatCards.source,
        title: retreatCards.title,
        meaning: retreatCards.meaning,
        guidance: retreatCards.guidance,
        imageUrl: retreatCards.imageUrl,
        imagePrompt: retreatCards.imagePrompt,
        imageStatus: retreatCards.imageStatus,
        originContext: retreatCards.originContext,
        createdAt: retreatCards.createdAt,
        updatedAt: retreatCards.updatedAt,
      },
    })
    .from(readingCards)
    .leftJoin(cards, eq(readingCards.cardId, cards.id))
    .leftJoin(retreatCards, eq(readingCards.retreatCardId, retreatCards.id))
    .where(eq(readingCards.readingId, readingId))
    .orderBy(asc(readingCards.position));
}

export async function getUserReadingCountThisMonth(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [result] = await db
    .select({ count: count() })
    .from(readings)
    .where(
      and(
        eq(readings.userId, userId),
        gte(readings.createdAt, startOfMonth)
      )
    );
  return result?.count ?? 0;
}

export async function getUserTotalReadingCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(readings)
    .where(eq(readings.userId, userId));
  return result?.count ?? 0;
}

export async function getUserCardCountThisMonth(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [result] = await db
    .select({ count: count() })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(
      and(
        eq(decks.userId, userId),
        gte(cards.createdAt, startOfMonth)
      )
    );
  return result?.count ?? 0;
}

export async function getUserImageCountThisMonth(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [result] = await db
    .select({ count: count() })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(
      and(
        eq(decks.userId, userId),
        eq(cards.imageStatus, "completed"),
        gte(cards.createdAt, startOfMonth)
      )
    );
  return result?.count ?? 0;
}

export async function getUserReadingsWithDeck(userId: string, limit?: number) {
  const query = db
    .select({
      id: readings.id,
      userId: readings.userId,
      deckId: readings.deckId,
      spreadType: readings.spreadType,
      question: readings.question,
      interpretation: readings.interpretation,
      shareToken: readings.shareToken,
      feedback: readings.feedback,
      createdAt: readings.createdAt,
      updatedAt: readings.updatedAt,
      deckTitle: decks.title,
      deckCoverImageUrl: decks.coverImageUrl,
    })
    .from(readings)
    .innerJoin(decks, eq(readings.deckId, decks.id))
    .where(and(eq(readings.userId, userId), ne(readings.spreadType, 'daily')))
    .orderBy(desc(readings.createdAt));

  if (limit && limit !== Infinity) {
    return query.limit(limit);
  }
  return query;
}

// --- Subscription / Plan queries ---

export async function getUserSubscription(userId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));
  return sub ?? null;
}

export async function getSubscriptionByStripeCustomerId(customerId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, customerId));
  return sub ?? null;
}

export async function getUserPlan(userId: string): Promise<PlanType> {
  // Check role first — admins bypass subscription check
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (user?.role === "admin") return "admin";

  const sub = await getUserSubscription(userId);
  if (!sub) return "free";

  // Active, past_due (grace period), or trialing all count as paid
  if (
    sub.plan === "pro" &&
    (sub.status === "active" || sub.status === "past_due")
  ) {
    return "pro";
  }

  // Canceled but still within paid period
  if (
    sub.plan === "pro" &&
    sub.status === "canceled" &&
    sub.currentPeriodEnd &&
    sub.currentPeriodEnd > new Date()
  ) {
    return "pro";
  }

  return "free";
}

// --- User profile queries ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      displayName: users.displayName,
      email: users.email,
      image: users.image,
      bio: users.bio,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));
  return user ?? null;
}

export async function updateUserProfile(
  userId: string,
  data: { displayName?: string | null; bio?: string | null }
) {
  const [updated] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      displayName: users.displayName,
      email: users.email,
      image: users.image,
      bio: users.bio,
      role: users.role,
      createdAt: users.createdAt,
    });
  return updated ?? null;
}

export async function getAllUserImageUrls(userId: string): Promise<string[]> {
  const cardImages = await db
    .select({ imageUrl: cards.imageUrl })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(eq(decks.userId, userId));

  const deckCovers = await db
    .select({ coverImageUrl: decks.coverImageUrl })
    .from(decks)
    .where(eq(decks.userId, userId));

  const urls: string[] = [];
  for (const row of cardImages) {
    if (row.imageUrl) urls.push(row.imageUrl);
  }
  for (const row of deckCovers) {
    if (row.coverImageUrl) urls.push(row.coverImageUrl);
  }
  return urls;
}

export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}

// --- Public share lookups (no auth) ---

export async function getSharedReadingByToken(token: string) {
  const [reading] = await db
    .select({
      id: readings.id,
      spreadType: readings.spreadType,
      question: readings.question,
      interpretation: readings.interpretation,
      createdAt: readings.createdAt,
      deckTitle: decks.title,
      deckCoverImageUrl: decks.coverImageUrl,
      artStyleId: decks.artStyleId,
      artStyleName: artStyles.name,
    })
    .from(readings)
    .innerJoin(decks, eq(readings.deckId, decks.id))
    .leftJoin(artStyles, eq(decks.artStyleId, artStyles.id))
    .where(eq(readings.shareToken, token));

  if (!reading) return null;

  const cardsData = await db
    .select({
      id: readingCards.id,
      readingId: readingCards.readingId,
      position: readingCards.position,
      positionName: readingCards.positionName,
      cardId: readingCards.cardId,
      retreatCardId: readingCards.retreatCardId,
      personCardId: readingCards.personCardId,
      createdAt: readingCards.createdAt,
      card: {
        id: cards.id,
        deckId: cards.deckId,
        cardNumber: cards.cardNumber,
        title: cards.title,
        meaning: cards.meaning,
        guidance: cards.guidance,
        imageUrl: cards.imageUrl,
        imageBlurData: cards.imageBlurData,
        imagePrompt: cards.imagePrompt,
        imageStatus: cards.imageStatus,
        cardType: cards.cardType,
        originContext: cards.originContext,
        createdAt: cards.createdAt,
        updatedAt: cards.updatedAt,
      },
      retreatCard: {
        id: retreatCards.id,
        retreatId: retreatCards.retreatId,
        cardType: retreatCards.cardType,
        source: retreatCards.source,
        title: retreatCards.title,
        meaning: retreatCards.meaning,
        guidance: retreatCards.guidance,
        imageUrl: retreatCards.imageUrl,
        imagePrompt: retreatCards.imagePrompt,
        imageStatus: retreatCards.imageStatus,
        originContext: retreatCards.originContext,
        createdAt: retreatCards.createdAt,
        updatedAt: retreatCards.updatedAt,
      },
    })
    .from(readingCards)
    .leftJoin(cards, eq(readingCards.cardId, cards.id))
    .leftJoin(retreatCards, eq(readingCards.retreatCardId, retreatCards.id))
    .where(eq(readingCards.readingId, reading.id))
    .orderBy(asc(readingCards.position));

  return { ...reading, cards: cardsData };
}

export async function getSharedDeckByToken(token: string) {
  const [deck] = await db
    .select({
      id: decks.id,
      title: decks.title,
      description: decks.description,
      cardCount: decks.cardCount,
      coverImageUrl: decks.coverImageUrl,
      artStyleId: decks.artStyleId,
      createdAt: decks.createdAt,
    })
    .from(decks)
    .where(eq(decks.shareToken, token));

  if (!deck) return null;

  const deckCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deck.id))
    .orderBy(asc(cards.cardNumber));

  let artStyleName: string | null = null;
  if (deck.artStyleId) {
    const [style] = await db
      .select({ name: artStyles.name })
      .from(artStyles)
      .where(eq(artStyles.id, deck.artStyleId));
    artStyleName = style?.name ?? null;
  }

  return { ...deck, cards: deckCards, artStyleName };
}

export async function getSharedArtStyleByToken(token: string) {
  const [style] = await db
    .select()
    .from(artStyles)
    .where(eq(artStyles.shareToken, token));
  return style ?? null;
}

// --- User context for AI readings ---

export async function getUserReadingContext(userId: string) {
  // Run all three queries in parallel instead of sequentially
  const [profileResult, recentReadings, deckThemes] = await Promise.all([
    // Get user context profile
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)),
    // Get last 5 readings (verbatim for rolling window)
    db
      .select({
        question: readings.question,
        spreadType: readings.spreadType,
        feedback: readings.feedback,
      })
      .from(readings)
      .where(eq(readings.userId, userId))
      .orderBy(desc(readings.createdAt))
      .limit(5),
    // Get user's deck themes (limit 5)
    db
      .select({ title: decks.title, theme: decks.theme })
      .from(decks)
      .where(and(eq(decks.userId, userId), eq(decks.status, "completed")))
      .orderBy(desc(decks.updatedAt))
      .limit(5),
  ]);

  const profile = profileResult[0];

  return {
    contextSummary: profile?.contextSummary ?? null,
    readingLength: (profile?.readingLength as ReadingLength) ?? "brief",
    recentReadings: recentReadings.map((r) => ({
      question: r.question,
      spreadType: r.spreadType,
      feedback: r.feedback,
    })),
    deckThemes: deckThemes
      .map((d) => d.theme || d.title)
      .filter(Boolean) as string[],
  };
}

// --- User context profile queries ---

export async function getUserContextProfile(userId: string): Promise<UserContextProfile | null> {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile) return null;

  return {
    userId: profile.userId,
    lifeContext: profile.lifeContext,
    interests: profile.interests,
    readingPreferences: profile.readingPreferences,
    readingLength: (profile.readingLength as ReadingLength) ?? "brief",
    contextSummary: profile.contextSummary,
    contextVersion: profile.contextVersion,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function upsertUserContextProfile(
  userId: string,
  data: Partial<{
    contextSummary: string | null;
    contextVersion: number;
    lifeContext: string | null;
    readingPreferences: string | null;
  }>
) {
  const existing = await getUserContextProfile(userId);
  if (existing) {
    await db
      .update(userProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({
      userId,
      ...data,
      contextVersion: data.contextVersion ?? 0,
    });
  }
}

export async function getReadingCountSinceVersion(userId: string, version: number) {
  const [result] = await db
    .select({ count: count() })
    .from(readings)
    .where(eq(readings.userId, userId));
  // Count all readings - version is used as a marker for how many have been compressed
  return (result?.count ?? 0) - version;
}

export async function getRecentReadingsForCompression(userId: string, skipCount: number) {
  // Get readings that haven't been compressed yet (older than recent 5, newer than last compressed batch)
  return db
    .select({
      question: readings.question,
      spreadType: readings.spreadType,
      feedback: readings.feedback,
      deckTitle: decks.title,
      deckTheme: decks.theme,
    })
    .from(readings)
    .innerJoin(decks, eq(readings.deckId, decks.id))
    .where(eq(readings.userId, userId))
    .orderBy(desc(readings.createdAt))
    .limit(20)
    .offset(5); // Skip the 5 most recent (they're in the rolling window)
}

// --- Deck adoption queries ---

export async function getPublicDecks(userId: string): Promise<DeckWithOwner[]> {
  const rows = await db
    .select({
      id: decks.id,
      userId: decks.userId,
      title: decks.title,
      description: decks.description,
      theme: decks.theme,
      status: decks.status,
      deckType: decks.deckType,
      cardCount: decks.cardCount,
      isPublic: decks.isPublic,
      shareToken: decks.shareToken,
      coverImageUrl: decks.coverImageUrl,
      artStyleId: decks.artStyleId,
      createdAt: decks.createdAt,
      updatedAt: decks.updatedAt,
      ownerName: users.name,
      ownerImage: users.image,
      adoptedAt: deckAdoptions.adoptedAt,
    })
    .from(decks)
    .innerJoin(users, eq(decks.userId, users.id))
    .leftJoin(
      deckAdoptions,
      and(eq(deckAdoptions.deckId, decks.id), eq(deckAdoptions.userId, userId))
    )
    .where(
      and(
        eq(decks.status, "completed"),
        isNotNull(decks.shareToken),
        ne(decks.userId, userId)
      )
    )
    .orderBy(desc(decks.updatedAt));

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    title: r.title,
    description: r.description,
    theme: r.theme,
    status: r.status as Deck["status"],
    deckType: (r.deckType ?? "standard") as Deck["deckType"],
    cardCount: r.cardCount,
    isPublic: r.isPublic,
    shareToken: r.shareToken ?? null,
    coverImageUrl: r.coverImageUrl,
    artStyleId: r.artStyleId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    ownerName: r.ownerName,
    ownerImage: r.ownerImage,
    isAdopted: r.adoptedAt !== null,
  }));
}

export async function getAdoptedDecks(userId: string): Promise<DeckWithOwner[]> {
  try {
    const rows = await db
      .select({
        id: decks.id,
        userId: decks.userId,
        title: decks.title,
        description: decks.description,
        theme: decks.theme,
        status: decks.status,
        deckType: decks.deckType,
        cardCount: decks.cardCount,
        isPublic: decks.isPublic,
        shareToken: decks.shareToken,
        coverImageUrl: decks.coverImageUrl,
        artStyleId: decks.artStyleId,
        createdAt: decks.createdAt,
        updatedAt: decks.updatedAt,
        ownerName: users.name,
        ownerImage: users.image,
      })
      .from(deckAdoptions)
      .innerJoin(decks, eq(deckAdoptions.deckId, decks.id))
      .innerJoin(users, eq(decks.userId, users.id))
      .where(eq(deckAdoptions.userId, userId))
      .orderBy(desc(deckAdoptions.adoptedAt));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      title: r.title,
      description: r.description,
      theme: r.theme,
      status: r.status as Deck["status"],
      deckType: (r.deckType ?? "standard") as Deck["deckType"],
      cardCount: r.cardCount,
      isPublic: r.isPublic,
      shareToken: r.shareToken ?? null,
      coverImageUrl: r.coverImageUrl,
      artStyleId: r.artStyleId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      ownerName: r.ownerName,
      ownerImage: r.ownerImage,
      isAdopted: true,
    }));
  } catch (error: unknown) {
    // Table may not exist yet if schema hasn't been pushed
    if (error instanceof Error && error.message.includes("does not exist")) {
      return [];
    }
    throw error;
  }
}

export async function adoptDeck(userId: string, deckId: string) {
  await db.insert(deckAdoptions).values({ userId, deckId }).onConflictDoNothing();
}

export async function unadoptDeck(userId: string, deckId: string) {
  await db
    .delete(deckAdoptions)
    .where(and(eq(deckAdoptions.userId, userId), eq(deckAdoptions.deckId, deckId)));
}

export async function hasAdoptedDeck(userId: string, deckId: string): Promise<boolean> {
  const [row] = await db
    .select({ userId: deckAdoptions.userId })
    .from(deckAdoptions)
    .where(and(eq(deckAdoptions.userId, userId), eq(deckAdoptions.deckId, deckId)))
    .limit(1);
  return !!row;
}

// --- Reading length preferences ---

export async function getUserReadingLength(userId: string): Promise<ReadingLength> {
  const [profile] = await db
    .select({ readingLength: userProfiles.readingLength })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));
  return (profile?.readingLength as ReadingLength) ?? "brief";
}

export async function upsertUserReadingLength(userId: string, readingLength: ReadingLength) {
  const existing = await getUserContextProfile(userId);
  if (existing) {
    await db
      .update(userProfiles)
      .set({ readingLength, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({
      userId,
      readingLength,
      contextVersion: 0,
    });
  }
}

// --- Card feedback queries ---

export async function getUserCardFeedback(userId: string, cardIds: string[]) {
  if (cardIds.length === 0) return {};
  const rows = await db
    .select({
      cardId: cardFeedback.cardId,
      feedback: cardFeedback.feedback,
    })
    .from(cardFeedback)
    .where(eq(cardFeedback.userId, userId));

  const map: Record<string, CardFeedbackType> = {};
  for (const row of rows) {
    if (cardIds.includes(row.cardId)) {
      map[row.cardId] = row.feedback as CardFeedbackType;
    }
  }
  return map;
}

export async function getUserCardPreferences(userId: string) {
  const rows = await db
    .select({
      feedback: cardFeedback.feedback,
      title: cards.title,
      meaning: cards.meaning,
    })
    .from(cardFeedback)
    .innerJoin(cards, eq(cardFeedback.cardId, cards.id))
    .where(eq(cardFeedback.userId, userId));

  const lovedCards: { title: string; meaning: string }[] = [];
  const dismissedCards: { title: string; meaning: string }[] = [];

  for (const row of rows) {
    const entry = { title: row.title, meaning: row.meaning };
    if (row.feedback === "loved") {
      lovedCards.push(entry);
    } else if (row.feedback === "dismissed") {
      dismissedCards.push(entry);
    }
  }

  return { lovedCards, dismissedCards };
}

// --- Living Deck queries (DEPRECATED — kept for backward compat with old /api/decks/living routes) ---

export async function getUserLivingDeck(userId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.userId, userId), eq(decks.deckType, "living")));
  return deck ?? null;
}

export async function getLivingDeckSettings(deckId: string) {
  const [settings] = await db
    .select()
    .from(livingDeckSettings)
    .where(eq(livingDeckSettings.deckId, deckId));
  return settings ?? null;
}

export async function canGenerateLivingDeckCard(deckId: string): Promise<boolean> {
  const settings = await getLivingDeckSettings(deckId);
  if (!settings?.lastCardGeneratedAt) return true;

  const now = new Date();
  const lastGen = new Date(settings.lastCardGeneratedAt);
  // Compare dates (not times) — allow one card per calendar day
  return (
    now.getUTCFullYear() !== lastGen.getUTCFullYear() ||
    now.getUTCMonth() !== lastGen.getUTCMonth() ||
    now.getUTCDate() !== lastGen.getUTCDate()
  );
}

export async function getRecentLivingDeckCards(deckId: string, limit = 10) {
  return db
    .select({
      title: cards.title,
      meaning: cards.meaning,
    })
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(desc(cards.createdAt))
    .limit(limit);
}

// --- Voice preference queries ---

export async function getVoicePreferences(userId: string): Promise<VoicePreferences> {
  const [profile] = await db
    .select({
      voiceEnabled: userProfiles.voiceEnabled,
      voiceAutoplay: userProfiles.voiceAutoplay,
      voiceSpeed: userProfiles.voiceSpeed,
      voiceId: userProfiles.voiceId,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile) {
    return { enabled: false, autoplay: true, speed: '1.0', voiceId: null };
  }

  return {
    enabled: profile.voiceEnabled,
    autoplay: profile.voiceAutoplay,
    speed: (profile.voiceSpeed as VoiceSpeed) ?? '1.0',
    voiceId: profile.voiceId,
  };
}

export async function getGuidanceEnabled(userId: string): Promise<boolean> {
  const [profile] = await db
    .select({ guidanceEnabled: userProfiles.guidanceEnabled })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return profile?.guidanceEnabled ?? true;
}

export async function upsertVoicePreferences(
  userId: string,
  prefs: Partial<{
    voiceEnabled: boolean;
    voiceAutoplay: boolean;
    voiceSpeed: string;
    voiceId: string | null;
  }>
) {
  const existing = await getUserContextProfile(userId);
  if (existing) {
    await db
      .update(userProfiles)
      .set({ ...prefs, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({
      userId,
      voiceEnabled: prefs.voiceEnabled ?? false,
      voiceAutoplay: prefs.voiceAutoplay ?? true,
      voiceSpeed: prefs.voiceSpeed ?? '1.0',
      voiceId: prefs.voiceId ?? null,
      contextVersion: 0,
    });
  }
}

// --- Chronicle queries ---

export async function getUserChronicleDeck(userId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.userId, userId), eq(decks.deckType, "chronicle")));
  return deck ?? null;
}

export async function getChronicleSettings(deckId: string): Promise<ChronicleSettings | null> {
  const [settings] = await db
    .select()
    .from(chronicleSettings)
    .where(eq(chronicleSettings.deckId, deckId));
  if (!settings) return null;
  return {
    deckId: settings.deckId,
    chronicleEnabled: settings.chronicleEnabled,
    generationMode: settings.generationMode as ChronicleSettings["generationMode"],
    lastCardGeneratedAt: settings.lastCardGeneratedAt,
    streakCount: settings.streakCount,
    longestStreak: settings.longestStreak,
    totalEntries: settings.totalEntries,
    lastEntryDate: settings.lastEntryDate,
    badgesEarned: (settings.badgesEarned ?? []) as ChronicleBadge[],
    interests: settings.interests as ChronicleInterests | null,
  };
}

export async function getTodayChronicleEntry(userId: string): Promise<ChronicleEntry | null> {
  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD' UTC
  const [entry] = await db
    .select()
    .from(chronicleEntries)
    .where(
      and(eq(chronicleEntries.userId, userId), eq(chronicleEntries.entryDate, today))
    );
  if (!entry) return null;
  return {
    id: entry.id,
    userId: entry.userId,
    deckId: entry.deckId,
    cardId: entry.cardId,
    entryDate: entry.entryDate,
    conversation: (entry.conversation ?? []) as ChronicleEntry["conversation"],
    mood: entry.mood,
    themes: (entry.themes ?? []) as string[],
    miniReading: entry.miniReading,
    status: entry.status as ChronicleEntry["status"],
    createdAt: entry.createdAt,
    completedAt: entry.completedAt,
  };
}

export async function getChronicleEntry(entryId: string, userId: string): Promise<ChronicleEntry | null> {
  const [entry] = await db
    .select()
    .from(chronicleEntries)
    .where(and(eq(chronicleEntries.id, entryId), eq(chronicleEntries.userId, userId)));
  if (!entry) return null;
  return {
    id: entry.id,
    userId: entry.userId,
    deckId: entry.deckId,
    cardId: entry.cardId,
    entryDate: entry.entryDate,
    conversation: (entry.conversation ?? []) as ChronicleEntry["conversation"],
    mood: entry.mood,
    themes: (entry.themes ?? []) as string[],
    miniReading: entry.miniReading,
    status: entry.status as ChronicleEntry["status"],
    createdAt: entry.createdAt,
    completedAt: entry.completedAt,
  };
}

export async function getChronicleEntries(userId: string, limit?: number) {
  const query = db
    .select({
      id: chronicleEntries.id,
      entryDate: chronicleEntries.entryDate,
      mood: chronicleEntries.mood,
      themes: chronicleEntries.themes,
      status: chronicleEntries.status,
      cardId: chronicleEntries.cardId,
      createdAt: chronicleEntries.createdAt,
      completedAt: chronicleEntries.completedAt,
      cardTitle: cards.title,
      cardImageUrl: cards.imageUrl,
      cardMeaning: cards.meaning,
      cardGuidance: cards.guidance,
      cardImageStatus: cards.imageStatus,
    })
    .from(chronicleEntries)
    .leftJoin(cards, eq(chronicleEntries.cardId, cards.id))
    .where(eq(chronicleEntries.userId, userId))
    .orderBy(desc(chronicleEntries.entryDate));

  if (limit && limit !== Infinity) {
    return query.limit(limit);
  }
  return query;
}

export async function getRecentChronicleEntries(userId: string, limit = 5) {
  return db
    .select()
    .from(chronicleEntries)
    .where(
      and(
        eq(chronicleEntries.userId, userId),
        eq(chronicleEntries.status, "completed")
      )
    )
    .orderBy(desc(chronicleEntries.entryDate))
    .limit(limit);
}

export async function getChronicleKnowledge(userId: string): Promise<ChronicleKnowledge | null> {
  const [knowledge] = await db
    .select()
    .from(chronicleKnowledge)
    .where(eq(chronicleKnowledge.userId, userId));
  if (!knowledge) return null;
  return {
    userId: knowledge.userId,
    themes: (knowledge.themes ?? {}) as ChronicleKnowledge["themes"],
    lifeAreas: (knowledge.lifeAreas ?? {}) as ChronicleKnowledge["lifeAreas"],
    recurringSymbols: (knowledge.recurringSymbols ?? []) as ChronicleKnowledge["recurringSymbols"],
    keyEvents: (knowledge.keyEvents ?? []) as ChronicleKnowledge["keyEvents"],
    emotionalPatterns: (knowledge.emotionalPatterns ?? []) as ChronicleKnowledge["emotionalPatterns"],
    personalityNotes: knowledge.personalityNotes,
    interests: knowledge.interests as ChronicleInterests | null,
    summary: knowledge.summary,
    version: knowledge.version,
  };
}

export async function upsertChronicleKnowledge(
  userId: string,
  data: Partial<Omit<ChronicleKnowledge, "userId">>
) {
  const existing = await getChronicleKnowledge(userId);
  if (existing) {
    await db
      .update(chronicleKnowledge)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chronicleKnowledge.userId, userId));
  } else {
    await db.insert(chronicleKnowledge).values({
      userId,
      themes: data.themes ?? {},
      lifeAreas: data.lifeAreas ?? {},
      recurringSymbols: data.recurringSymbols ?? [],
      keyEvents: data.keyEvents ?? [],
      emotionalPatterns: data.emotionalPatterns ?? [],
      personalityNotes: data.personalityNotes ?? null,
      interests: data.interests ?? null,
      summary: data.summary ?? null,
      version: data.version ?? 0,
    });
  }
}

export async function getRecentChronicleCards(deckId: string, limit = 10) {
  return db
    .select({
      title: cards.title,
      meaning: cards.meaning,
      createdAt: cards.createdAt,
    })
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(desc(cards.createdAt))
    .limit(limit);
}

export async function getTodayChronicleCard(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const [entry] = await db
    .select({
      cardId: chronicleEntries.cardId,
      cardTitle: cards.title,
      cardMeaning: cards.meaning,
      cardGuidance: cards.guidance,
      cardImageUrl: cards.imageUrl,
      cardImageStatus: cards.imageStatus,
    })
    .from(chronicleEntries)
    .leftJoin(cards, eq(chronicleEntries.cardId, cards.id))
    .where(
      and(
        eq(chronicleEntries.userId, userId),
        eq(chronicleEntries.entryDate, today),
        isNotNull(chronicleEntries.cardId)
      )
    );
  if (!entry?.cardId) return null;
  return {
    id: entry.cardId,
    title: entry.cardTitle!,
    meaning: entry.cardMeaning!,
    guidance: entry.cardGuidance!,
    imageUrl: entry.cardImageUrl,
    imageStatus: entry.cardImageStatus!,
  };
}

export async function updateChronicleStreak(deckId: string) {
  const settings = await getChronicleSettings(deckId);
  if (!settings) return;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = settings.streakCount;

  if (settings.lastEntryDate === today) {
    // Already updated today
    return settings;
  } else if (settings.lastEntryDate === yesterday) {
    // Consecutive day — increment streak
    newStreak = settings.streakCount + 1;
  } else if (!settings.lastEntryDate) {
    // First entry ever
    newStreak = 1;
  } else {
    // Missed day(s) — reset streak
    newStreak = 1;
  }

  const longestStreak = Math.max(settings.longestStreak, newStreak);

  await db
    .update(chronicleSettings)
    .set({
      streakCount: newStreak,
      longestStreak,
      lastEntryDate: today,
      totalEntries: settings.totalEntries + 1,
      updatedAt: new Date(),
    })
    .where(eq(chronicleSettings.deckId, deckId));

  return {
    ...settings,
    streakCount: newStreak,
    longestStreak,
    lastEntryDate: today,
    totalEntries: settings.totalEntries + 1,
  };
}

export async function getChronicleCompletedEntryCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(chronicleEntries)
    .where(
      and(
        eq(chronicleEntries.userId, userId),
        eq(chronicleEntries.status, "completed")
      )
    );
  return result?.count ?? 0;
}

export async function getLastChronicleCardTitle(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ cardTitle: cards.title })
    .from(chronicleEntries)
    .leftJoin(cards, eq(chronicleEntries.cardId, cards.id))
    .where(
      and(
        eq(chronicleEntries.userId, userId),
        eq(chronicleEntries.status, "completed")
      )
    )
    .orderBy(desc(chronicleEntries.completedAt))
    .limit(1);
  return row?.cardTitle ?? null;
}

// --- Astrology profile queries ---

export async function getAstrologyProfile(userId: string): Promise<AstrologyProfile | null> {
  const [profile] = await db
    .select()
    .from(astrologyProfiles)
    .where(eq(astrologyProfiles.userId, userId));
  return (profile as AstrologyProfile) ?? null;
}

// --- Activity feed ---

export async function getUserActivityFeed(userId: string, limit = 15): Promise<ActivityItem[]> {
  const [deckRows, readingRows, chronicleRows, chronicleSettingsRows, astroRow, adoptionRows] = await Promise.all([
    // 1. Decks (non-draft)
    db
      .select({
        id: decks.id,
        title: decks.title,
        status: decks.status,
        coverImageUrl: decks.coverImageUrl,
        createdAt: decks.createdAt,
        updatedAt: decks.updatedAt,
      })
      .from(decks)
      .where(and(eq(decks.userId, userId), ne(decks.status, "draft")))
      .orderBy(desc(decks.createdAt))
      .limit(limit),

    // 2. Readings
    db
      .select({
        id: readings.id,
        spreadType: readings.spreadType,
        question: readings.question,
        createdAt: readings.createdAt,
        deckTitle: decks.title,
      })
      .from(readings)
      .innerJoin(decks, eq(readings.deckId, decks.id))
      .where(eq(readings.userId, userId))
      .orderBy(desc(readings.createdAt))
      .limit(limit),

    // 3. Chronicle entries (completed)
    db
      .select({
        id: chronicleEntries.id,
        mood: chronicleEntries.mood,
        themes: chronicleEntries.themes,
        completedAt: chronicleEntries.completedAt,
        createdAt: chronicleEntries.createdAt,
        cardTitle: cards.title,
      })
      .from(chronicleEntries)
      .leftJoin(cards, eq(chronicleEntries.cardId, cards.id))
      .where(
        and(
          eq(chronicleEntries.userId, userId),
          eq(chronicleEntries.status, "completed")
        )
      )
      .orderBy(desc(chronicleEntries.completedAt))
      .limit(limit),

    // 4. Chronicle settings (for badges)
    db
      .select({
        badgesEarned: chronicleSettings.badgesEarned,
      })
      .from(chronicleSettings)
      .innerJoin(decks, eq(chronicleSettings.deckId, decks.id))
      .where(eq(decks.userId, userId)),

    // 5. Astrology profile
    db
      .select({
        sunSign: astrologyProfiles.sunSign,
        createdAt: astrologyProfiles.createdAt,
      })
      .from(astrologyProfiles)
      .where(eq(astrologyProfiles.userId, userId))
      .limit(1),

    // 6. Deck adoptions
    db
      .select({
        deckId: deckAdoptions.deckId,
        adoptedAt: deckAdoptions.adoptedAt,
        deckTitle: decks.title,
        ownerName: users.name,
      })
      .from(deckAdoptions)
      .innerJoin(decks, eq(deckAdoptions.deckId, decks.id))
      .innerJoin(users, eq(decks.userId, users.id))
      .where(eq(deckAdoptions.userId, userId))
      .orderBy(desc(deckAdoptions.adoptedAt))
      .limit(limit),
  ]);

  const items: ActivityItem[] = [];

  // Process decks
  for (const row of deckRows) {
    items.push({
      id: `deck_created-${row.id}`,
      timestamp: row.createdAt,
      type: "deck_created",
      deckId: row.id,
      deckTitle: row.title,
    });
    if (row.status === "completed") {
      items.push({
        id: `deck_completed-${row.id}`,
        timestamp: row.updatedAt,
        type: "deck_completed",
        deckId: row.id,
        deckTitle: row.title,
        coverImageUrl: row.coverImageUrl,
      });
    }
  }

  // Process readings
  for (const row of readingRows) {
    items.push({
      id: `reading-${row.id}`,
      timestamp: row.createdAt,
      type: "reading_performed",
      readingId: row.id,
      spreadType: row.spreadType as import("@/types").SpreadType,
      question: row.question,
      deckTitle: row.deckTitle,
    });
  }

  // Process chronicle entries
  for (const row of chronicleRows) {
    items.push({
      id: `chronicle-${row.id}`,
      timestamp: row.completedAt ?? row.createdAt,
      type: "chronicle_entry",
      entryId: row.id,
      mood: row.mood,
      themes: (row.themes ?? []) as string[],
      cardTitle: row.cardTitle,
    });
  }

  // Process badges
  for (const settingsRow of chronicleSettingsRows) {
    const badges = (settingsRow.badgesEarned ?? []) as ChronicleBadge[];
    for (const badge of badges) {
      const def = getBadgeById(badge.id);
      if (def) {
        items.push({
          id: `badge-${badge.id}`,
          timestamp: new Date(badge.earnedAt),
          type: "badge_earned",
          badgeId: badge.id,
          badgeName: def.label,
          badgeEmoji: def.emoji,
        });
      }
    }
  }

  // Process astrology
  if (astroRow.length > 0) {
    items.push({
      id: `astrology-${userId}`,
      timestamp: astroRow[0].createdAt,
      type: "astrology_setup",
      sunSign: astroRow[0].sunSign,
    });
  }

  // Process adoptions
  for (const row of adoptionRows) {
    items.push({
      id: `adoption-${row.deckId}`,
      timestamp: row.adoptedAt,
      type: "deck_adopted",
      deckId: row.deckId,
      deckTitle: row.deckTitle,
      ownerName: row.ownerName,
    });
  }

  // Sort by timestamp DESC and limit
  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return items.slice(0, limit);
}

// ── Seeker Context for Autonomous Obstacle Detection ──────────────────

export interface SeekerContext {
  emotionalPatterns: { pattern: string; frequency: number }[];
  recentMoods: string[];
  previousObstacles: { title: string; meaning: string }[];
  knowledgeSummary: string | null;
  lifeContext: string | null;
}

export async function getSeekerContextForGeneration(userId: string): Promise<SeekerContext | null> {
  const [knowledgeResult, moodsResult, obstaclesResult, profileResult] = await Promise.all([
    // 1. Chronicle knowledge → emotional patterns + summary
    db
      .select({
        emotionalPatterns: chronicleKnowledge.emotionalPatterns,
        summary: chronicleKnowledge.summary,
      })
      .from(chronicleKnowledge)
      .where(eq(chronicleKnowledge.userId, userId))
      .limit(1),

    // 2. Recent chronicle moods (last 7 completed entries)
    db
      .select({ mood: chronicleEntries.mood })
      .from(chronicleEntries)
      .where(and(eq(chronicleEntries.userId, userId), eq(chronicleEntries.status, "completed"), isNotNull(chronicleEntries.mood)))
      .orderBy(desc(chronicleEntries.createdAt))
      .limit(7),

    // 3. Existing obstacle cards in user's decks
    db
      .select({ title: cards.title, meaning: cards.meaning })
      .from(cards)
      .innerJoin(decks, eq(cards.deckId, decks.id))
      .where(and(eq(decks.userId, userId), eq(cards.cardType, "obstacle")))
      .orderBy(desc(cards.createdAt))
      .limit(10),

    // 4. User profile → lifeContext
    db
      .select({ lifeContext: userProfiles.lifeContext })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1),
  ]);

  const knowledge = knowledgeResult[0];
  const rawPatterns = (knowledge?.emotionalPatterns ?? []) as { pattern: string; frequency: number; lastSeen: string }[];
  const emotionalPatterns = rawPatterns
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)
    .map(({ pattern, frequency }) => ({ pattern, frequency }));

  const recentMoods = moodsResult
    .map((r) => r.mood)
    .filter((m): m is string => !!m);

  const previousObstacles = obstaclesResult.map(({ title, meaning }) => ({ title, meaning }));

  const knowledgeSummary = knowledge?.summary ?? null;
  const lifeContext = profileResult[0]?.lifeContext ?? null;

  // Return null if there's truly nothing — new user with no data
  const hasData = emotionalPatterns.length > 0 || recentMoods.length > 0 || previousObstacles.length > 0 || knowledgeSummary || lifeContext;
  if (!hasData) return null;

  return { emotionalPatterns, recentMoods, previousObstacles, knowledgeSummary, lifeContext };
}

// ── Emergence events ────────────────────────────────────────────────────

export async function getPendingEmergenceEvent(userId: string): Promise<EmergenceEvent | null> {
  const [event] = await db
    .select()
    .from(emergenceEvents)
    .where(
      and(
        eq(emergenceEvents.userId, userId),
        eq(emergenceEvents.status, "ready")
      )
    )
    .orderBy(asc(emergenceEvents.createdAt))
    .limit(1);
  return (event as EmergenceEvent) ?? null;
}

export async function getEmergenceEventHistory(userId: string, limit = 20): Promise<EmergenceEvent[]> {
  return db
    .select()
    .from(emergenceEvents)
    .where(eq(emergenceEvents.userId, userId))
    .orderBy(desc(emergenceEvents.createdAt))
    .limit(limit) as Promise<EmergenceEvent[]>;
}

export async function createEmergenceEvent(data: {
  userId: string;
  deckId: string;
  eventType: string;
  detectedPattern: string;
  patternFrequency: number;
  relevantExcerpts?: string[];
  aiEvidence?: string;
  confidence?: number;
}): Promise<EmergenceEvent> {
  const [event] = await db
    .insert(emergenceEvents)
    .values({
      userId: data.userId,
      deckId: data.deckId,
      eventType: data.eventType,
      status: "pending",
      detectedPattern: data.detectedPattern,
      patternFrequency: data.patternFrequency,
      relevantExcerpts: data.relevantExcerpts ?? [],
      aiEvidence: data.aiEvidence ?? null,
      confidence: data.confidence ?? null,
    })
    .returning();
  return event as EmergenceEvent;
}

export async function getEmergenceEventForUser(
  eventId: string,
  userId: string
): Promise<EmergenceEvent | null> {
  const [event] = await db
    .select()
    .from(emergenceEvents)
    .where(and(eq(emergenceEvents.id, eventId), eq(emergenceEvents.userId, userId)))
    .limit(1);
  return event ? (event as EmergenceEvent) : null;
}

export async function hasEmergenceEventToday(userId: string): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [row] = await db
    .select({ id: emergenceEvents.id })
    .from(emergenceEvents)
    .where(
      and(
        eq(emergenceEvents.userId, userId),
        gte(emergenceEvents.createdAt, todayStart)
      )
    )
    .limit(1);
  return !!row;
}

export async function updateEmergenceEvent(
  id: string,
  data: Partial<Pick<EmergenceEvent, "status" | "cardId" | "lyraMessage" | "deliveredAt">>
): Promise<void> {
  await db
    .update(emergenceEvents)
    .set(data)
    .where(eq(emergenceEvents.id, id));
}

/**
 * Check which cards (by ID) have been refined in Studio.
 * Returns a map of cardId → true for cards that have a cardOverride row.
 */
export async function getCardOverrideMap(
  cardIds: string[]
): Promise<Record<string, boolean>> {
  if (cardIds.length === 0) return {};
  const rows = await db
    .select({ cardId: cardOverrides.cardId })
    .from(cardOverrides)
    .where(sql`${cardOverrides.cardId} IN ${cardIds}`);
  const map: Record<string, boolean> = {};
  for (const row of rows) {
    map[row.cardId] = true;
  }
  return map;
}

/**
 * Get recently refined cards for a user (cards with overrides, ordered by override updatedAt).
 */
export async function getRecentlyRefinedCards(userId: string, limit = 5) {
  return db
    .select({
      cardId: cardOverrides.cardId,
      cardTitle: cards.title,
      imageUrl: cards.imageUrl,
      imageStatus: cards.imageStatus,
      deckId: cards.deckId,
      updatedAt: cardOverrides.updatedAt,
    })
    .from(cardOverrides)
    .innerJoin(cards, eq(cardOverrides.cardId, cards.id))
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(eq(decks.userId, userId))
    .orderBy(desc(cardOverrides.updatedAt))
    .limit(limit);
}
