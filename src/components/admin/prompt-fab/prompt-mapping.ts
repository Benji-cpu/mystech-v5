type RouteMapping = {
  pattern: RegExp;
  keys: string[];
  schemas?: string[];
  label: string;
};

const ROUTE_PROMPT_MAP: RouteMapping[] = [
  {
    pattern: /^\/decks\/new\/simple$/,
    keys: ["DECK_GENERATION_SYSTEM_PROMPT", "DECK_GENERATION_USER_PROMPT"],
    schemas: ["generatedCardSchema", "generatedDeckSchema"],
    label: "Deck Generation — Simple Mode",
  },
  {
    pattern: /^\/decks\/new\/journey\/[^/]+\/chat$/,
    keys: [
      "JOURNEY_CONVERSATION_SYSTEM_PROMPT",
      "JOURNEY_OPENING_MESSAGE",
      "ANCHOR_EXTRACTION_PROMPT",
      "CARD_AWARE_SYSTEM_PROMPT",
    ],
    schemas: ["anchorSchema", "extractedAnchorsSchema"],
    label: "Journey — Conversation",
  },
  {
    pattern: /^\/decks\/new\/journey\/[^/]+\/review$/,
    keys: [
      "JOURNEY_CARD_GENERATION_SYSTEM_PROMPT",
      "JOURNEY_CARD_GENERATION_USER_PROMPT",
      "CARD_EDIT_PROMPT",
      "CARD_REGENERATION_PROMPT",
    ],
    schemas: ["generatedCardSchema", "cardUpdateSchema"],
    label: "Journey — Card Review",
  },
  {
    pattern: /^\/readings\/new$/,
    keys: [
      "READING_INTERPRETATION_SYSTEM_PROMPT",
      "READING_INTERPRETATION_USER_PROMPT",
    ],
    schemas: [],
    label: "Reading Interpretation",
  },
  {
    pattern: /^\/readings\/(?!new$)[^/]+$/,
    keys: [
      "READING_INTERPRETATION_SYSTEM_PROMPT",
      "READING_INTERPRETATION_USER_PROMPT",
    ],
    schemas: [],
    label: "Reading Interpretation",
  },
];

export function getRouteMappingForPath(pathname: string): RouteMapping | null {
  for (const mapping of ROUTE_PROMPT_MAP) {
    if (mapping.pattern.test(pathname)) {
      return mapping;
    }
  }
  return null;
}
