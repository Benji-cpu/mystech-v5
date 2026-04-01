import type { ChronicleKnowledge, SpreadType } from "@/types";

// ── System prompts ──────────────────────────────────────────────────────

export const CHRONICLE_CONVERSATION_SYSTEM_PROMPT = `You are Lyra, a warm daily companion who helps seekers chronicle their lives through oracle cards. Each day you have a brief, purposeful conversation — then distill it into a personal oracle card.

Your personality:
- Warm, direct, insightful — never performatively mystical
- You help the seeker notice what matters today: turning points, tensions, recurring patterns, meaningful moments
- You listen for the symbolic, mythic dimension of everyday experience — what images, metaphors, or archetypes live in what they share?
- Keep exchanges brief (2-3 back-and-forth). You're a companion, not a therapist
- Speak naturally — "I" and "you" freely. No stage directions or asterisks

Your approach:
- Ask one focused, evocative question at a time — not "how are you?" but "what moment from today keeps replaying in your mind?" or "what felt heavy today — and what felt light?"
- Draw out specific images and sensations: "if that feeling had a color, what would it be?" or "where in your body do you feel that?"
- Notice patterns across previous conversations (when knowledge context is provided)
- On your 2nd or 3rd response, signal readiness to forge by reflecting back what you've heard. Use language like "I see today's card clearly now — it lives in..." or "The threads are woven. Today's card carries the energy of..." End with your reflective summary — do NOT ask another question after wrapping up.

Do NOT generate cards during dialogue — that happens in a separate step.

When a seeker expresses confusion or asks what their waypoint, retreat, or path concept means:
- Use the waypoint lens from context to give a brief (1-2 sentence) plain-language explanation — no jargon
- Then ask one grounding question that helps them explore that theme through their actual day
- Never dismiss confusion with "don't worry about it" — always honour the question before moving forward`;

export const CHRONICLE_ONBOARDING_SYSTEM_PROMPT = `You are Lyra, meeting a new seeker for the first time. You're beginning a Chronicle together — a daily practice of dialogue and oracle card creation.

Your goal in 2-3 exchanges:
- Learn what's alive in their life right now
- Understand their current emotional landscape
- Pick up on themes, symbols, or patterns they naturally gravitate toward
- Build rapport quickly — warm, curious, grounded

Start with: "Now that I know what draws you, tell me — what's alive in your life right now?"

Keep responses warm but brief (2-3 sentences). Ask one follow-up question per exchange.`;

// ── Greeting fallback (minimal, time-aware openers) ─────────────────────

export function buildChronicleGreeting({
  timeOfDay,
}: {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  // Keep signature accepting extra args for backward compat, but ignore them
  streakCount?: number;
  recentEntries?: { mood: string | null; themes: string[]; cardTitle?: string }[];
  knowledge?: ChronicleKnowledge | null;
  milestoneBadge?: { name: string; lyraMessage: string } | null;
  userName?: string;
  journeyContext?: { waypointName: string; waypointLens: string } | null;
  emergenceContext?: { cardTitle: string; cardType: string; detectedPattern: string } | null;
}): string {
  const openers: Record<string, string> = {
    morning: "What's alive for you this morning?",
    afternoon: "What's been on your mind today?",
    evening: "What stayed with you from today?",
    night: "What's surfacing in the quiet?",
  };
  return openers[timeOfDay] ?? openers.morning;
}

// ── AI greeting prompt builder ─────────────────────────────────────────

export function buildChronicleGreetingPrompt({
  timeOfDay,
  streakCount,
  recentEntries,
  knowledge,
  userName,
  journeyContext,
  emergenceContext,
}: {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  streakCount: number;
  recentEntries?: { mood: string | null; themes: string[]; cardTitle?: string; cardMeaning?: string }[];
  knowledge?: ChronicleKnowledge | null;
  userName?: string;
  journeyContext?: { waypointName: string; waypointLens: string } | null;
  emergenceContext?: { cardTitle: string; cardType: string; detectedPattern: string } | null;
}): string {
  const contextLines: string[] = [];

  contextLines.push(`Time of day: ${timeOfDay}`);

  if (streakCount > 1) {
    contextLines.push(`The seeker has been showing up consistently (multiple days in a row)`);
  }

  // Yesterday's card — pass meaning/themes instead of title
  if (recentEntries?.[0]) {
    const yesterday = recentEntries[0];
    if (yesterday.cardMeaning) {
      contextLines.push(`Yesterday's reflection explored themes of: ${yesterday.cardMeaning}`);
    } else if (yesterday.themes.length > 0) {
      contextLines.push(`Yesterday's reflection touched on: ${yesterday.themes.join(", ")}`);
    }
  }

  // Mood streak — humanize instead of listing raw labels
  if (recentEntries && recentEntries.length >= 3) {
    const moods = recentEntries.slice(0, 3).map((e) => e.mood).filter(Boolean);
    if (moods.length === 3 && moods.every((m) => m === moods[0])) {
      contextLines.push(`The seeker has been in a ${moods[0]} state for several days`);
    }
  }

  // Recent themes (aggregated, no card titles)
  if (recentEntries && recentEntries.length > 0) {
    const recentThemes = [...new Set(recentEntries.flatMap((e) => e.themes).filter(Boolean))].slice(0, 6);
    if (recentThemes.length > 0) {
      contextLines.push(`Recent themes from their reflections: ${recentThemes.join(", ")}`);
    }
  }

  // Knowledge patterns
  if (knowledge) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const topEmotional = knowledge.emotionalPatterns
      ?.filter((p) => p.frequency >= 3 && new Date(p.lastSeen) >= sevenDaysAgo)
      .sort((a, b) => b.frequency - a.frequency)[0];

    if (topEmotional) {
      contextLines.push(`A recurring emotional thread: ${topEmotional.pattern} — this has come up often recently`);
    }

    const topSymbol = knowledge.recurringSymbols?.find((s) => s.count >= 3);
    if (topSymbol) {
      contextLines.push(`A recurring image in their words: ${topSymbol.symbol}`);
    }
  }

  // Waypoint — pass only the lens (what it means), not the name
  if (journeyContext) {
    contextLines.push(`Current practice focus: ${journeyContext.waypointLens}`);
  }

  if (emergenceContext) {
    contextLines.push(`An emergence pattern has surfaced: ${emergenceContext.detectedPattern}. The seeker just acknowledged this.`);
  }

  const contextBlock = contextLines.length > 0
    ? contextLines.map((l) => `- ${l}`).join("\n")
    : "- No prior context available — this may be a new seeker";

  return `You are Lyra, a warm daily companion who helps seekers chronicle their lives through oracle cards. You speak naturally — warm, direct, insightful, never performatively mystical.

Here is today's context for this seeker:
${contextBlock}

Write a greeting of exactly 2-3 sentences that opens today's Chronicle session. Weave the available signals into a cohesive invitation — do not list them as separate facts. End with a specific, evocative question that invites the seeker to respond.

${emergenceContext ? "Anchor the greeting on the emergence pattern — connect it to today's opening question." : ""}${journeyContext ? "Let the practice focus color your opening question — help the seeker explore that theme through their actual day, using plain language." : ""}

Rules:
- Flowing prose only — no markdown, no headers, no asterisks, no bullet points
- Never address the seeker by name in the greeting
- Do not mention streak numbers or statistics directly
- NEVER use card titles, waypoint names, path names, or retreat names — these are internal vocabulary the seeker may not understand
- Reference what things mean in plain, grounded language
- If you don't have enough context about the seeker, just ask a good opening question about their day`;
}

// ── Conversation context injection ──────────────────────────────────────

export function buildChronicleConversationContext({
  knowledge,
  recentEntries,
  interests,
  journeyContext,
  userName,
  emergenceContext,
}: {
  knowledge?: ChronicleKnowledge | null;
  recentEntries?: { mood: string | null; themes: string[]; entryDate: string }[];
  interests?: { spiritual: string[]; lifeDomains: string[] } | null;
  journeyContext?: {
    pathName: string;
    retreatName: string;
    waypointName: string;
    pathLens: string;
    retreatLens: string;
    waypointLens: string;
  } | null;
  userName?: string;
  emergenceContext?: {
    cardTitle: string;
    cardType: string;
    detectedPattern: string;
  } | null;
}): string {
  const parts: string[] = [];

  if (userName && userName !== "Seeker") {
    parts.push(`The seeker's name is ${userName}. Address them by name occasionally but naturally — not every response.`);
  }

  if (knowledge?.summary) {
    parts.push(`About this seeker:\n${knowledge.summary}`);
  }

  if (interests) {
    if (interests.spiritual.length > 0) {
      parts.push(`Spiritual interests: ${interests.spiritual.join(", ")}`);
    }
    if (interests.lifeDomains.length > 0) {
      parts.push(`Life focus areas: ${interests.lifeDomains.join(", ")}`);
    }
  }

  if (recentEntries && recentEntries.length > 0) {
    const recentThemes = recentEntries
      .flatMap((e) => e.themes)
      .filter(Boolean);
    if (recentThemes.length > 0) {
      parts.push(`Recent themes: ${[...new Set(recentThemes)].slice(0, 8).join(", ")}`);
    }

    const recentMoods = recentEntries
      .map((e) => e.mood)
      .filter(Boolean);
    if (recentMoods.length > 0) {
      parts.push(`Recent moods: ${recentMoods.join(", ")}`);
    }
  }

  if (emergenceContext) {
    parts.push(
      `Emergence context: Before today's conversation, the seeker was shown an emergence card: "${emergenceContext.cardTitle}" (${emergenceContext.cardType}), ` +
      `arising from the pattern: ${emergenceContext.detectedPattern}. They acknowledged it. Reference this naturally — connect their sharing ` +
      `back to this theme when organic, but don't over-reference it. Let them lead.`
    );
  }

  if (journeyContext) {
    parts.push(
      `Journey context — actively weave these themes into the conversation:\n` +
      `The seeker is walking the ${journeyContext.pathName} path. ` +
      `They are in the "${journeyContext.retreatName}" retreat, at waypoint: "${journeyContext.waypointName}".\n` +
      `Path lens: ${journeyContext.pathLens}\n` +
      `Retreat focus: ${journeyContext.retreatLens}\n` +
      `Waypoint intention: ${journeyContext.waypointLens}\n` +
      `Today's Chronicle IS their daily practice on this path. ` +
      `Frame your questions through the waypoint's lens when natural. ` +
      `For example, if the waypoint is about "What You Reject," ask what they've been pushing away today. ` +
      `The card forged today should feel connected to this waypoint's theme.`
    );
  }

  if (parts.length === 0) return "";
  return `\n--- Seeker Context ---\n${parts.join("\n")}\n--- End Context ---\n`;
}

// ── Card generation from conversation ───────────────────────────────────

export function buildChronicleCardPrompt({
  conversation,
  existingCards,
  knowledge,
  preferences,
  artStyleName,
  journeyContext,
}: {
  conversation: { role: string; content: string }[];
  existingCards: { title: string; meaning: string }[];
  knowledge?: ChronicleKnowledge | null;
  preferences?: {
    lovedCards: { title: string; meaning: string }[];
    dismissedCards: { title: string; meaning: string }[];
  };
  artStyleName?: string;
  journeyContext?: { waypointName: string; waypointLens: string } | null;
}): string {
  const conversationText = conversation
    .map((m) => `${m.role === "user" ? "Seeker" : "Lyra"}: ${m.content}`)
    .join("\n");

  const recentCardTitles = existingCards.slice(0, 10).map((c) => c.title);
  const avoidSection =
    recentCardTitles.length > 0
      ? `\nRecent Chronicle cards (avoid repeating these themes): ${recentCardTitles.join(", ")}\n`
      : "";

  let knowledgeSection = "";
  if (knowledge?.summary) {
    knowledgeSection = `\nBroader context about this seeker:\n${knowledge.summary}\n`;
  }

  let preferencesSection = "";
  if (preferences && (preferences.lovedCards.length > 0 || preferences.dismissedCards.length > 0)) {
    const parts: string[] = [];
    if (preferences.lovedCards.length > 0) {
      const loved = preferences.lovedCards
        .slice(0, 5)
        .map((c) => `"${c.title}"`)
        .join(", ");
      parts.push(`They resonate with cards like: ${loved}.`);
    }
    if (preferences.dismissedCards.length > 0) {
      const dismissed = preferences.dismissedCards
        .slice(0, 3)
        .map((c) => `"${c.title}"`)
        .join(", ");
      parts.push(`They don't connect with: ${dismissed}.`);
    }
    preferencesSection = `\n${parts.join(" ")}\n`;
  }

  return `Today's conversation with the seeker:

${conversationText}
${knowledgeSection}${preferencesSection}${avoidSection}
Create a single oracle card that captures the essence of today's conversation. The card should feel like a crystallization of this moment — immediate, personal, and resonant.

The card should:
- Draw from the specific themes, emotions, and images in today's dialogue
- Feel like it belongs to THIS day in their journey
- Stand alone as a meaningful oracle card

The imagePrompt should:
- Describe a symbolic scene (2-3 sentences)
- Capture the feeling and themes of the conversation
- Focus on concrete visual subjects
${artStyleName ? `- Complement the "${artStyleName}" aesthetic` : ""}
- Describe ONLY the subject and composition — do NOT describe art technique or style
${journeyContext ? `\nJourney waypoint (if conversation touched on this theme, the card may echo it — but only if organic): "${journeyContext.waypointName}" — ${journeyContext.waypointLens}` : ""}
Return one card with: title, meaning, guidance, and imagePrompt.`;
}

// ── Mini-reading from today's card ──────────────────────────────────────

export function buildChronicleMiniReadingPrompt({
  card,
  conversation,
  knowledge,
  streakCount,
  isPro,
  journeyContext,
  userName,
}: {
  card: { title: string; meaning: string; guidance: string };
  conversation: { role: string; content: string }[];
  knowledge?: ChronicleKnowledge | null;
  streakCount: number;
  isPro: boolean;
  journeyContext?: { waypointName: string; retreatName: string; waypointLens: string } | null;
  userName?: string;
}): string {
  const conversationText = conversation
    .map((m) => `${m.role === "user" ? "Seeker" : "Lyra"}: ${m.content}`)
    .join("\n");

  const depth = isPro ? "3-5 sentences" : "1-2 sentences";

  let knowledgeContext = "";
  if (knowledge?.summary) {
    knowledgeContext = `\nBroader journey context:\n${knowledge.summary}\n`;
  }

  let pathContext = "";
  if (journeyContext) {
    pathContext = `\nPath waypoint: "${journeyContext.waypointName}" in ${journeyContext.retreatName}. ${journeyContext.waypointLens}\n`;
  }

  let nameContext = "";
  if (userName && userName !== "Seeker") {
    nameContext = `\nThe seeker's name is ${userName}. You may use it once naturally.\n`;
  }

  return `Today's Chronicle card has been forged:
Card: "${card.title}"
Meaning: ${card.meaning}
Guidance: ${card.guidance}

Today's conversation:
${conversationText}
${knowledgeContext}${pathContext}${nameContext}
Write a mini-reading (${depth}) connecting today's card to the seeker's journey. Reference specific moments from today's conversation. ${isPro && streakCount > 7 ? "You may reference patterns you've noticed across their Chronicle." : ""}

Speak as Lyra — warm, direct, insightful. No headers or formatting.`;
}

// ── Knowledge extraction (structured output) ────────────────────────────

export const CHRONICLE_KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT = `You are a factual analyst extracting structured data from a conversation. Your output feeds an AI knowledge system — be precise and literal. No mystic language. Extract only what's explicitly stated or strongly implied.`;

export function buildKnowledgeExtractionPrompt(
  conversation: { role: string; content: string }[]
): string {
  const conversationText = conversation
    .map((m) => `${m.role === "user" ? "Seeker" : "Lyra"}: ${m.content}`)
    .join("\n");

  return `Extract structured knowledge from this conversation:

${conversationText}

Extract:
- themes: Key themes discussed (e.g., "career transition", "relationship anxiety", "creative block")
- mood: Primary emotional tone (one word: e.g., "hopeful", "anxious", "reflective")
- lifeAreas: Life domains touched on (e.g., "career", "relationships", "health")
- symbols: Any recurring symbols, metaphors, or images mentioned
- keyEvent: If a significant life event was mentioned, describe it briefly (null if none)

Be factual. Only extract what was actually discussed.`;
}

// ── Chronicle position assignment for readings ──────────────────────────

export function buildChroniclePositionPrompt({
  chronicleCard,
  spreadType,
  positions,
  question,
}: {
  chronicleCard: { title: string; meaning: string; guidance: string };
  spreadType: SpreadType;
  positions: { index: number; name: string }[];
  question: string | null;
}): string {
  const positionList = positions
    .map((p) => `${p.index}: ${p.name}`)
    .join("\n");

  return `The seeker is performing a ${spreadType.replace("_", " ")} reading. They have a Chronicle card from today that should be placed in the most meaningful position.

Chronicle Card: "${chronicleCard.title}"
Meaning: ${chronicleCard.meaning}
Guidance: ${chronicleCard.guidance}

${question ? `Seeker's question: "${question}"` : "No specific question — general life guidance reading."}

Available positions:
${positionList}

Which position number best suits this Chronicle card? Consider the card's meaning and the significance of each position. Return only the position number (0-indexed).`;
}

// ── Enhanced interpretation context for Chronicle cards in readings ─────

export function buildChronicleReadingContext({
  chronicleCard,
  entryThemes,
  entryDate,
  knowledge,
}: {
  chronicleCard: { title: string; meaning: string };
  entryThemes: string[];
  entryDate: string;
  knowledge?: ChronicleKnowledge | null;
}): string {
  const parts: string[] = [];

  parts.push(
    `One of the cards in this reading — "${chronicleCard.title}" — is a Chronicle card, forged from the seeker's daily reflection on ${entryDate}.`
  );

  if (entryThemes.length > 0) {
    parts.push(
      `It emerged from their reflection about: ${entryThemes.join(", ")}.`
    );
  }

  parts.push(
    `When interpreting this card, honor its personal origin — reference the fact that it came from their own daily practice.`
  );

  if (knowledge?.summary) {
    parts.push(
      `\nBroader Chronicle journey context:\n${knowledge.summary}`
    );
  }

  return `\n--- Chronicle Card Context ---\n${parts.join(" ")}\n--- End Chronicle Context ---\n`;
}
