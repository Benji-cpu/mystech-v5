import {
  DECK_GENERATION_SYSTEM_PROMPT,
  buildDeckGenerationUserPrompt,
} from "./deck-generation";
import {
  READING_INTERPRETATION_SYSTEM_PROMPT,
  buildReadingInterpretationPrompt,
} from "./reading-interpretation";
import {
  CHRONICLE_CONVERSATION_SYSTEM_PROMPT,
  CHRONICLE_ONBOARDING_SYSTEM_PROMPT,
  CHRONICLE_KNOWLEDGE_EXTRACTION_SYSTEM_PROMPT,
} from "./chronicle";

export type PromptCategory = "deck" | "reading" | "chronicle";

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
    description: "User prompt template for simple mode. Variables: {vision}, {cardCount}, {artStyleName}, {artStyleDescription}",
    category: "deck",
    defaultValue: buildDeckGenerationUserPrompt("{vision}", 10, "{artStyleName}", "{artStyleDescription}"),
    isTemplate: true,
    templateParams: ["vision", "cardCount", "artStyleName", "artStyleDescription"],
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
