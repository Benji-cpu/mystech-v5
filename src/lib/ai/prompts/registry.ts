import {
  DECK_GENERATION_SYSTEM_PROMPT,
  buildDeckGenerationUserPrompt,
} from "./deck-generation";
import {
  JOURNEY_CONVERSATION_SYSTEM_PROMPT,
  JOURNEY_OPENING_MESSAGE,
  buildCardAwareSystemPrompt,
  buildAnchorExtractionPrompt,
} from "./conversation";
import {
  JOURNEY_CARD_GENERATION_SYSTEM_PROMPT,
  buildJourneyCardGenerationPrompt,
  buildCardEditPrompt,
  buildCardRegenerationPrompt,
} from "./journey-card-generation";
import {
  READING_INTERPRETATION_SYSTEM_PROMPT,
  buildReadingInterpretationPrompt,
} from "./reading-interpretation";
import {
  CHRONICLE_CONVERSATION_SYSTEM_PROMPT,
  CHRONICLE_ONBOARDING_SYSTEM_PROMPT,
  CHRONICLE_KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT,
} from "./chronicle";

export type PromptCategory = "deck" | "conversation" | "journey" | "reading" | "chronicle";

export type PromptRegistryEntry = {
  key: string;
  name: string;
  description: string;
  category: PromptCategory;
  defaultValue: string;
  isTemplate: boolean;
  templateParams?: string[];
};

export const PROMPT_REGISTRY: Record<string, PromptRegistryEntry> = {
  DECK_GENERATION_SYSTEM_PROMPT: {
    key: "DECK_GENERATION_SYSTEM_PROMPT",
    name: "Deck Generation System Prompt",
    description: "System prompt for simple mode deck card generation",
    category: "deck",
    defaultValue: DECK_GENERATION_SYSTEM_PROMPT,
    isTemplate: false,
  },
  DECK_GENERATION_USER_PROMPT: {
    key: "DECK_GENERATION_USER_PROMPT",
    name: "Deck Generation User Prompt",
    description: "User prompt template for simple mode. Variables: {title}, {description}, {cardCount}, {artStyleName}, {artStyleDescription}",
    category: "deck",
    defaultValue: buildDeckGenerationUserPrompt("{title}", "{description}", 10, "{artStyleName}", "{artStyleDescription}"),
    isTemplate: true,
    templateParams: ["title", "description", "cardCount", "artStyleName", "artStyleDescription"],
  },
  JOURNEY_CONVERSATION_SYSTEM_PROMPT: {
    key: "JOURNEY_CONVERSATION_SYSTEM_PROMPT",
    name: "Journey Conversation System Prompt",
    description: "System prompt for the journey mode AI conversation",
    category: "conversation",
    defaultValue: JOURNEY_CONVERSATION_SYSTEM_PROMPT,
    isTemplate: false,
  },
  JOURNEY_OPENING_MESSAGE: {
    key: "JOURNEY_OPENING_MESSAGE",
    name: "Journey Opening Message",
    description: "The first message the AI sends when starting a journey",
    category: "conversation",
    defaultValue: JOURNEY_OPENING_MESSAGE,
    isTemplate: false,
  },
  ANCHOR_EXTRACTION_PROMPT: {
    key: "ANCHOR_EXTRACTION_PROMPT",
    name: "Anchor Extraction Prompt",
    description: "Prompt to extract themes/emotions/symbols from conversation. Variable: {conversationHistory}",
    category: "conversation",
    defaultValue: buildAnchorExtractionPrompt("{conversationHistory}"),
    isTemplate: true,
    templateParams: ["conversationHistory"],
  },
  CARD_AWARE_SYSTEM_PROMPT: {
    key: "CARD_AWARE_SYSTEM_PROMPT",
    name: "Card-Aware System Prompt Addon",
    description: "Appended to journey system prompt when draft cards exist. Variable: {draftCards}",
    category: "conversation",
    defaultValue: "The seeker has already generated draft cards. They may return to discuss broader edits.\nCurrent cards:\n{draftCards}\n\nYou can suggest changes to specific cards by referencing their number and title.",
    isTemplate: true,
    templateParams: ["draftCards"],
  },
  JOURNEY_CARD_GENERATION_SYSTEM_PROMPT: {
    key: "JOURNEY_CARD_GENERATION_SYSTEM_PROMPT",
    name: "Journey Card Generation System Prompt",
    description: "System prompt for generating cards from journey conversation",
    category: "journey",
    defaultValue: JOURNEY_CARD_GENERATION_SYSTEM_PROMPT,
    isTemplate: false,
  },
  JOURNEY_CARD_GENERATION_USER_PROMPT: {
    key: "JOURNEY_CARD_GENERATION_USER_PROMPT",
    name: "Journey Card Generation User Prompt",
    description: "User prompt template for journey card generation. Variables: {title}, {theme}, {cardCount}, {anchors}, {conversationSummary}, {artStyleName}, {artStyleDescription}",
    category: "journey",
    defaultValue: buildJourneyCardGenerationPrompt("{title}", "{theme}", 10, [], "{conversationSummary}", "{artStyleName}", "{artStyleDescription}"),
    isTemplate: true,
    templateParams: ["title", "theme", "cardCount", "anchors", "conversationSummary", "artStyleName", "artStyleDescription"],
  },
  CARD_EDIT_PROMPT: {
    key: "CARD_EDIT_PROMPT",
    name: "Card Edit Prompt",
    description: "Prompt for AI-assisted card editing. Variables: {currentCard}, {instruction}",
    category: "journey",
    defaultValue: buildCardEditPrompt(
      { title: "{title}", meaning: "{meaning}", guidance: "{guidance}", imagePrompt: "{imagePrompt}" },
      "{instruction}"
    ),
    isTemplate: true,
    templateParams: ["currentCard", "instruction", "conversationContext"],
  },
  CARD_REGENERATION_PROMPT: {
    key: "CARD_REGENERATION_PROMPT",
    name: "Card Regeneration Prompt",
    description: "Prompt for regenerating a removed card. Variables: {cardNumber}, {title}, {theme}, {anchors}, {existingCards}",
    category: "journey",
    defaultValue: buildCardRegenerationPrompt(1, "{title}", "{theme}", [], []),
    isTemplate: true,
    templateParams: ["cardNumber", "title", "theme", "anchors", "existingCards"],
  },
  READING_INTERPRETATION_SYSTEM_PROMPT: {
    key: "READING_INTERPRETATION_SYSTEM_PROMPT",
    name: "Reading Interpretation System Prompt",
    description: "System prompt for AI reading interpretation",
    category: "reading",
    defaultValue: READING_INTERPRETATION_SYSTEM_PROMPT,
    isTemplate: false,
  },
  READING_INTERPRETATION_USER_PROMPT: {
    key: "READING_INTERPRETATION_USER_PROMPT",
    name: "Reading Interpretation User Prompt",
    description: "User prompt template for reading interpretation. Variables: {spreadType}, {question}, {cards}, {paragraphs}",
    category: "reading",
    defaultValue: buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "{question}",
      cards: [{ positionName: "{positionName}", title: "{title}", meaning: "{meaning}", guidance: "{guidance}" }],
    }),
    isTemplate: true,
    templateParams: ["spreadType", "question", "cards"],
  },
  CHRONICLE_CONVERSATION_SYSTEM_PROMPT: {
    key: "CHRONICLE_CONVERSATION_SYSTEM_PROMPT",
    name: "Chronicle Conversation System Prompt",
    description: "System prompt for daily Chronicle dialogue with Lyra",
    category: "chronicle",
    defaultValue: CHRONICLE_CONVERSATION_SYSTEM_PROMPT,
    isTemplate: false,
  },
  CHRONICLE_ONBOARDING_SYSTEM_PROMPT: {
    key: "CHRONICLE_ONBOARDING_SYSTEM_PROMPT",
    name: "Chronicle Onboarding System Prompt",
    description: "System prompt for first-time Chronicle setup conversation",
    category: "chronicle",
    defaultValue: CHRONICLE_ONBOARDING_SYSTEM_PROMPT,
    isTemplate: false,
  },
  CHRONICLE_KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT: {
    key: "CHRONICLE_KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT",
    name: "Chronicle Knowledge Extraction",
    description: "System prompt for extracting structured knowledge from Chronicle conversations",
    category: "chronicle",
    defaultValue: CHRONICLE_KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT,
    isTemplate: false,
  },
};

export function getPromptsByCategory(category: PromptCategory): PromptRegistryEntry[] {
  return Object.values(PROMPT_REGISTRY).filter((p) => p.category === category);
}

export function getAllPromptKeys(): string[] {
  return Object.keys(PROMPT_REGISTRY);
}
