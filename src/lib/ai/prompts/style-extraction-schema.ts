import { z } from "zod";

/**
 * Zod schema for the structured output of Gemini style extraction.
 * Used with Vercel AI SDK `generateObject` to get typed results.
 */
export const styleExtractionSchema = z.object({
  colorPalette: z.object({
    primary: z.array(
      z.object({
        hex: z.string().describe("Hex color code, e.g. #2D1B4E"),
        name: z.string().describe("Descriptive color name, e.g. deep mystic violet"),
      })
    ).describe("1-3 primary/dominant colors"),
    secondary: z.array(
      z.object({
        hex: z.string(),
        name: z.string(),
      })
    ).describe("1-3 secondary/supporting colors"),
    accent: z.array(
      z.object({
        hex: z.string(),
        name: z.string(),
      })
    ).describe("1-2 accent/highlight colors"),
    temperature: z.enum(["warm", "cool", "neutral", "mixed"]),
    saturation: z.enum(["muted", "vibrant", "mixed"]),
    contrast: z.enum(["high", "medium", "low"]),
  }),
  lineQuality: z.object({
    weight: z.enum(["thin", "medium", "bold", "varied"]),
    style: z.enum(["clean", "sketchy", "organic", "geometric", "mixed"]),
    edges: z.enum(["hard", "soft", "blended", "mixed"]),
    outlines: z.enum(["strong", "none", "selective"]),
    description: z.string().describe("One sentence capturing the overall line character"),
  }),
  texture: z.object({
    surface: z.enum(["smooth", "grainy", "painterly", "digital-clean", "mixed"]),
    brushVisibility: z.enum(["none", "subtle", "moderate", "prominent"]),
    medium: z.enum(["traditional", "digital", "mixed"]),
    description: z.string().describe("One sentence capturing the textural quality"),
  }),
  composition: z.object({
    symmetry: z.enum(["symmetrical", "asymmetrical", "radial", "organic"]),
    negativeSpace: z.enum(["minimal", "moderate", "generous"]),
    density: z.enum(["sparse", "balanced", "dense"]),
    depth: z.enum(["flat", "moderate", "deep"]),
    description: z.string().describe("One sentence capturing the compositional approach"),
  }),
  mood: z.object({
    overall: z.string().describe("Primary mood descriptor"),
    lighting: z.enum(["soft", "dramatic", "flat", "luminous", "mixed"]),
    atmosphere: z.string().describe("Description of atmospheric effects"),
    emotionalRegister: z.enum(["intimate", "grand", "contemplative", "energetic", "mysterious"]),
    description: z.string().describe("One sentence capturing the overall feeling"),
  }),
  medium: z.object({
    primary: z.string().describe("Identified primary medium, e.g. watercolor, digital painting"),
    rendering: z.enum(["realistic", "stylized", "abstract", "semi-abstract"]),
    detailLevel: z.enum(["highly-detailed", "moderate", "minimalist"]),
    influences: z.array(z.string()).describe("Art movement or style influences"),
    signatureTechniques: z.array(z.string()).describe("Notable techniques observed"),
    description: z.string().describe("One sentence summarizing the medium and technique"),
  }),
  stylePrompt: z
    .string()
    .describe(
      "A complete, self-contained image generation prompt (3-5 sentences) that captures this exact style. Written as direct instructions to an image generation model."
    ),
  negativePrompt: z
    .string()
    .describe(
      "Comma-separated list of things to AVOID that would break the style consistency"
    ),
});

export type StyleExtractionOutput = z.infer<typeof styleExtractionSchema>;
