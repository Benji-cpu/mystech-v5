type RouteMapping = {
  pattern: RegExp;
  keys: string[];
  schemas?: string[];
  label: string;
};

const ROUTE_PROMPT_MAP: RouteMapping[] = [
  {
    pattern: /^\/decks\/new$/,
    keys: ["DECK_GENERATION_SYSTEM_PROMPT", "DECK_GENERATION_USER_PROMPT"],
    schemas: ["generatedCardSchema", "generatedDeckSchema"],
    label: "Deck Generation",
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
