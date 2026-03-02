import type { ChronicleKnowledge, SpreadType } from "@/types";

// ── System prompts ──────────────────────────────────────────────────────

export const CHRONICLE_CONVERSATION_SYSTEM_PROMPT = `You are Lyra, a warm daily companion who helps seekers chronicle their lives through oracle cards. Each day you have a brief, meaningful conversation — then distill it into a personal oracle card.

Your personality:
- Warm, direct, insightful — never performatively mystical
- You ask about what's alive right now: emotions, events, patterns, dreams
- You follow emotional and thematic threads — if they mention anxiety about work, gently explore that
- Keep exchanges brief (2-3 back-and-forth). You're a companion, not a therapist
- Speak naturally — "I" and "you" freely. No stage directions or asterisks

Your role in dialogue:
- Ask one focused question at a time
- Listen for the symbolic, mythic dimension of everyday experience
- Notice patterns across previous conversations (when knowledge context is provided)
- On your 2nd or 3rd response, wrap up the conversation by reflecting back what you've heard and expressing readiness to create their card. Use natural language like "I see the threads of today clearly now..." or "There's a card taking shape from what you've shared..." or "The patterns are clear — I can feel today's card forming." This signals the conversation is complete.
- Do NOT ask another question after your wrap-up — end with your reflective summary

Do NOT generate cards during dialogue — that happens in a separate step.`;

export const CHRONICLE_ONBOARDING_SYSTEM_PROMPT = `You are Lyra, meeting a new seeker for the first time. You're beginning a Chronicle together — a daily practice of dialogue and oracle card creation.

Your goal in 2-3 exchanges:
- Learn what's alive in their life right now
- Understand their current emotional landscape
- Pick up on themes, symbols, or patterns they naturally gravitate toward
- Build rapport quickly — warm, curious, grounded

Start with: "Now that I know what draws you, tell me — what's alive in your life right now?"

Keep responses warm but brief (2-3 sentences). Ask one follow-up question per exchange.`;

// ── Greeting builder ────────────────────────────────────────────────────

export function buildChronicleGreeting({
  timeOfDay,
  streakCount,
  recentEntries,
  knowledge,
  milestoneBadge,
}: {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  streakCount: number;
  recentEntries?: { mood: string | null; themes: string[]; cardTitle?: string }[];
  knowledge?: ChronicleKnowledge | null;
  milestoneBadge?: { name: string; lyraMessage: string } | null;
}): string {
  const parts: string[] = [];

  // Milestone greeting takes priority
  if (milestoneBadge) {
    return milestoneBadge.lyraMessage;
  }

  // Time-aware greeting
  const timeGreetings: Record<string, string[]> = {
    morning: ["A fresh page awaits.", "The morning holds possibility."],
    afternoon: ["Let's see what the day has stirred.", "The day is unfolding — what's catching your attention?"],
    evening: ["The day is settling. Let's capture what it held.", "Evening comes with its own kind of clarity."],
    night: ["The quiet hours often bring the clearest reflections.", "Night has a way of revealing what daylight hides."],
  };

  const greetings = timeGreetings[timeOfDay];
  parts.push(greetings[Math.floor(Math.random() * greetings.length)]);

  // Reference yesterday's card
  if (recentEntries?.[0]?.cardTitle) {
    parts.push(`Yesterday you drew **${recentEntries[0].cardTitle}**.`);
  }

  // Reference streak
  if (streakCount > 3) {
    parts.push(`${streakCount} days running — your Chronicle grows richer.`);
  }

  // Reference patterns from knowledge
  if (knowledge?.summary) {
    parts.push("I've been noticing some threads in your story...");
  }

  return parts.join(" ");
}

// ── Conversation context injection ──────────────────────────────────────

export function buildChronicleConversationContext({
  knowledge,
  recentEntries,
  interests,
  journeyContext,
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
}): string {
  const parts: string[] = [];

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

  if (journeyContext) {
    parts.push(
      `Journey context (ambient — do NOT steer toward these themes unless the seeker raises them naturally):\n` +
      `The seeker is on the ${journeyContext.pathName} path, in the ${journeyContext.retreatName} retreat, at waypoint: ${journeyContext.waypointName}.\n` +
      `Path lens: ${journeyContext.pathLens}\n` +
      `Retreat focus: ${journeyContext.retreatLens}\n` +
      `Waypoint intention: ${journeyContext.waypointLens}\n` +
      `If themes of this lens appear in what the seeker shares, explore them gently.\n` +
      `If they do not arise organically, say nothing about the path.`
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
}: {
  card: { title: string; meaning: string; guidance: string };
  conversation: { role: string; content: string }[];
  knowledge?: ChronicleKnowledge | null;
  streakCount: number;
  isPro: boolean;
  journeyContext?: { waypointName: string; retreatName: string; waypointLens: string } | null;
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

  return `Today's Chronicle card has been forged:
Card: "${card.title}"
Meaning: ${card.meaning}
Guidance: ${card.guidance}

Today's conversation:
${conversationText}
${knowledgeContext}${pathContext}
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
