import type { ChronicleKnowledge, EmergenceEvent } from "@/types";

// ── AI-Powered emergence detection prompt ──────────────────────────────

export function buildEmergenceDetectionPrompt(
  knowledge: ChronicleKnowledge,
  recentEvents: EmergenceEvent[],
  cooldowns: { obstacleCooledDown: boolean; thresholdCooledDown: boolean },
): string {
  // Format emotional patterns
  const emotionalSection = (knowledge.emotionalPatterns ?? [])
    .map((p) => `- "${p.pattern}" (frequency: ${p.frequency}, last seen: ${p.lastSeen})`)
    .join("\n") || "None recorded";

  // Format themes
  const themeEntries = Object.entries(knowledge.themes ?? {});
  const themeSection = themeEntries
    .map(([theme, data]) => `- "${theme}" (count: ${data.count}, last seen: ${data.lastSeen})`)
    .join("\n") || "None recorded";

  // Format recurring symbols
  const symbolSection = (knowledge.recurringSymbols ?? [])
    .map((s) => `- "${s.symbol}" (count: ${s.count}, last seen: ${s.lastSeen})`)
    .join("\n") || "None recorded";

  // Format key events
  const eventSection = (knowledge.keyEvents ?? [])
    .map((e) => `- "${e.event}" (${e.date}) — themes: ${e.themes.join(", ")}`)
    .join("\n") || "None recorded";

  // Format recent emergence events for dedup
  const recentEmergenceSection = recentEvents
    .slice(0, 10)
    .map((e) => `- [${e.eventType}] "${e.detectedPattern}" (${e.createdAt.toISOString().split("T")[0]}, status: ${e.status})`)
    .join("\n") || "None";

  // Determine which types are eligible
  const eligibleTypes: string[] = [];
  if (cooldowns.obstacleCooledDown) eligibleTypes.push("obstacle");
  if (cooldowns.thresholdCooledDown) eligibleTypes.push("threshold");

  return `You are analyzing a seeker's Chronicle knowledge graph to determine if an emergence event should occur. Emergence events are rare, meaningful moments where the oracle surfaces a pattern the seeker hasn't consciously named.

## Eligible emergence types: ${eligibleTypes.join(", ")}

## Knowledge Graph

### Emotional Patterns (with frequency and recency)
${emotionalSection}

### Themes (with count and recency)
${themeSection}

### Recurring Symbols
${symbolSection}

### Key Life Events
${eventSection}

### Seeker Summary
${knowledge.summary ?? "No summary available"}

## Recent Emergence Events (avoid duplicating these)
${recentEmergenceSection}

## Instructions

Analyze the full knowledge graph for patterns worthy of emergence:

**Obstacles** (if eligible): Recurring shadow patterns, unresolved emotional loops, themes the seeker circles but hasn't confronted. Must be genuinely significant — a pattern that keeps resurfacing across multiple sessions, not a one-time mention. Look for:
- Emotional patterns with high frequency that are still active (seen recently)
- Themes that recur but never resolve
- Patterns the seeker dances around without directly addressing

**Thresholds** (if eligible): Patterns that were once dominant but have faded — the seeker moved through something organically. This marks transformation. Look for:
- Emotional patterns with high frequency but NOT seen recently (14+ days since last appearance)
- Themes that were once prominent but have naturally diminished
- Evidence of growth or integration

**Critical**: Only return shouldEmerge: true if the pattern is genuinely noteworthy. Most sessions should NOT produce emergence. Do not duplicate patterns already in the recent emergence events list. The confidence score should reflect how certain you are that this pattern deserves attention (0.0 = uncertain, 1.0 = extremely clear pattern).`;
}

// ── Emergence card prompts ──────────────────────────────────────────────

export function buildChronicleObstacleCardPrompt({
  detectedPattern,
  patternFrequency,
  knowledgeSummary,
  relevantExcerpts,
  existingObstacles,
  artStyleName,
}: {
  detectedPattern: string;
  patternFrequency: number;
  knowledgeSummary: string;
  relevantExcerpts: string[];
  existingObstacles: { title: string; meaning: string }[];
  artStyleName?: string;
}): string {
  const excerptSection =
    relevantExcerpts.length > 0
      ? `\nRecent conversation excerpts related to this pattern:\n${relevantExcerpts.map((e) => `- "${e}"`).join("\n")}\n`
      : "";

  const existingSection =
    existingObstacles.length > 0
      ? `\nExisting cards in this deck (avoid duplicating these themes): ${existingObstacles.map((o) => `"${o.title}"`).join(", ")}\n`
      : "";

  return `Create an Obstacle Card emerging from this seeker's Chronicle practice. The emotional pattern "${detectedPattern}" has surfaced ${patternFrequency} times across their journal entries.

Unlike deck-creation obstacles, this one emerges from lived daily experience. Name this recurring shadow with compassion. The card should feel inevitable — like something they've been circling.

${knowledgeSummary ? `About this seeker:\n${knowledgeSummary}\n` : ""}${excerptSection}${existingSection}
The card should:
- Name the shadow pattern without judgment
- Acknowledge its persistence with compassion
- Offer guidance for sitting with (not fixing) this pattern
- Feel personal and specific, not generic

The imagePrompt should:
- Describe a symbolic scene (2-3 sentences) that embodies this shadow pattern
- Use imagery that feels heavy but not hopeless
- Focus on concrete visual subjects
${artStyleName ? `- Complement the "${artStyleName}" aesthetic` : ""}
- Describe ONLY the subject and composition — do NOT describe art technique or style

Return one card with: title, meaning, guidance, and imagePrompt.`;
}

export function buildChronicleThresholdCardPrompt({
  detectedPattern,
  knowledgeSummary,
  relevantExcerpts,
  artStyleName,
}: {
  detectedPattern: string;
  knowledgeSummary: string;
  relevantExcerpts: string[];
  artStyleName?: string;
}): string {
  const excerptSection =
    relevantExcerpts.length > 0
      ? `\nRecent conversation excerpts:\n${relevantExcerpts.map((e) => `- "${e}"`).join("\n")}\n`
      : "";

  return `Create a Threshold Card honoring growth. The pattern "${detectedPattern}" was once dominant in this seeker's journal but has recently faded — they've moved through something. This card marks the crossing. It should feel earned, not prescribed.

${knowledgeSummary ? `About this seeker:\n${knowledgeSummary}\n` : ""}${excerptSection}
The card should:
- Honor the transformation that has occurred
- Name what was released or integrated
- Celebrate the growth without being saccharine
- Feel like a milestone marker on their path

The imagePrompt should:
- Describe a symbolic scene (2-3 sentences) that embodies crossing a threshold
- Use imagery that feels luminous and earned
- Focus on concrete visual subjects
${artStyleName ? `- Complement the "${artStyleName}" aesthetic` : ""}
- Describe ONLY the subject and composition — do NOT describe art technique or style

Return one card with: title, meaning, guidance, and imagePrompt.`;
}

// ── AI-generated Lyra delivery message prompt ──────────────────────────

export function buildEmergenceLyraMessagePrompt({
  eventType,
  detectedPattern,
  patternEvidence,
  cardTitle,
  cardMeaning,
  knowledgeSummary,
  userName,
}: {
  eventType: "obstacle" | "threshold";
  detectedPattern: string;
  patternEvidence: string;
  cardTitle: string;
  cardMeaning: string;
  knowledgeSummary: string;
  userName?: string;
}): string {
  const seekerRef = userName && userName !== "Seeker" ? userName : "the seeker";

  const typeGuidance = eventType === "obstacle"
    ? `This is an obstacle emergence — a shadow pattern the seeker keeps circling. Compassionately name it. Acknowledge its weight without trying to fix it.`
    : `This is a threshold emergence — a pattern the seeker has moved through organically. Honor the growth with warmth. Mark it as a crossing.`;

  return `You are Lyra, a warm daily companion. Before today's Chronicle conversation begins, you need to present an emergence card to ${seekerRef}.

${typeGuidance}

Pattern detected: "${detectedPattern}"
Evidence: ${patternEvidence}
Card title: "${cardTitle}"
Card meaning: ${cardMeaning}
${knowledgeSummary ? `About this seeker: ${knowledgeSummary}` : ""}

Write a 2-3 sentence message that:
- Opens with "Before we begin today..." framing
- References specific details from the seeker's chronicle (from the evidence)
- Includes the card title in bold: **${cardTitle}**
- Feels personal and specific, never generic
- Does NOT use stage directions or asterisks
- Speaks naturally as Lyra — warm, direct, insightful`;
}

// Fallback template if AI message generation fails
export function buildEmergenceLyraMessageFallback(
  eventType: "obstacle" | "threshold",
  detectedPattern: string,
  cardTitle: string,
): string {
  if (eventType === "obstacle") {
    return `Before we begin today, I need to show you something. Over these past weeks, a pattern has been gathering weight in our conversations — ${detectedPattern}. It's asked to be seen, and I've given it a name: **${cardTitle}**.`;
  }

  return `Before we begin today... I want you to see something. The ${detectedPattern} that once colored so many of our conversations — it's shifted. You've moved through something, and this card honors that crossing: **${cardTitle}**.`;
}
