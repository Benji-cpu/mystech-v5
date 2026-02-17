type SchemaField = { name: string; type: string; description: string };
type SchemaInfo = { name: string; label: string; fields: SchemaField[] };

export const SCHEMA_REGISTRY: Record<string, SchemaInfo> = {
  generatedCardSchema: {
    name: "generatedCardSchema",
    label: "Generated Card",
    fields: [
      {
        name: "cardNumber",
        type: "number",
        description: "Sequential card number starting from 1",
      },
      {
        name: "title",
        type: "string",
        description: "Evocative, meaningful card title (2-5 words)",
      },
      {
        name: "meaning",
        type: "string",
        description:
          "The card's core meaning relating to the deck theme (1-2 sentences)",
      },
      {
        name: "guidance",
        type: "string",
        description:
          "Personal, actionable guidance for the card holder (1-2 sentences)",
      },
      {
        name: "imagePrompt",
        type: "string",
        description:
          "Detailed visual description for AI image generation — symbolic, evocative imagery without text or words",
      },
    ],
  },
  generatedDeckSchema: {
    name: "generatedDeckSchema",
    label: "Generated Deck (Array Wrapper)",
    fields: [
      {
        name: "cards",
        type: "array",
        description: "Array of generated card objects",
      },
    ],
  },
  anchorSchema: {
    name: "anchorSchema",
    label: "Anchor (Theme/Emotion/Symbol)",
    fields: [
      {
        name: "theme",
        type: "string",
        description: "Life theme or experience extracted from conversation",
      },
      {
        name: "emotion",
        type: "string",
        description: "Dominant emotion associated with the theme",
      },
      {
        name: "symbol",
        type: "string",
        description: "Visual symbol representing the anchor",
      },
    ],
  },
  extractedAnchorsSchema: {
    name: "extractedAnchorsSchema",
    label: "Extracted Anchors (Array Wrapper)",
    fields: [
      {
        name: "anchors",
        type: "array",
        description: "Array of anchor objects extracted from conversation",
      },
    ],
  },
  cardUpdateSchema: {
    name: "cardUpdateSchema",
    label: "Card Update (Edit Result)",
    fields: [
      {
        name: "title",
        type: "string",
        description: "Updated card title",
      },
      {
        name: "meaning",
        type: "string",
        description: "Updated card meaning",
      },
      {
        name: "guidance",
        type: "string",
        description: "Updated card guidance",
      },
      {
        name: "imagePrompt",
        type: "string",
        description: "Updated image generation prompt",
      },
    ],
  },
};
