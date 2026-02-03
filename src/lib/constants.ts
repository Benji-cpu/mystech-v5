import type { SpreadType } from '@/types';

// Plan limits
export const PLAN_LIMITS = {
  free: {
    cardsPerMonth: 10,
    readingsPerMonth: 5,
    imagesPerMonth: 5,
    maxDecks: 2,
    maxPersonCards: 5,
    spreads: ['three_card'] as const,
    readingHistory: 10,
  },
  pro: {
    cardsPerMonth: 100,
    readingsPerMonth: 50,
    imagesPerMonth: 100,
    maxDecks: Infinity,
    maxPersonCards: 50,
    spreads: ['single', 'three_card', 'five_card', 'celtic_cross'] as const,
    readingHistory: Infinity,
  },
} as const;

// Spread position definitions
export const SPREAD_POSITIONS: Record<
  SpreadType,
  { position: number; name: string }[]
> = {
  single: [
    { position: 0, name: 'Focus' },
  ],
  three_card: [
    { position: 0, name: 'Past' },
    { position: 1, name: 'Present' },
    { position: 2, name: 'Future' },
  ],
  five_card: [
    { position: 0, name: 'Situation' },
    { position: 1, name: 'Challenge' },
    { position: 2, name: 'Foundation' },
    { position: 3, name: 'Recent Past' },
    { position: 4, name: 'Near Future' },
  ],
  celtic_cross: [
    { position: 0, name: 'Present' },
    { position: 1, name: 'Challenge' },
    { position: 2, name: 'Foundation' },
    { position: 3, name: 'Recent Past' },
    { position: 4, name: 'Best Outcome' },
    { position: 5, name: 'Near Future' },
    { position: 6, name: 'Self' },
    { position: 7, name: 'Environment' },
    { position: 8, name: 'Hopes & Fears' },
    { position: 9, name: 'Final Outcome' },
  ],
};

// Art style presets
export const ART_STYLE_PRESETS = [
  {
    id: 'tarot-classic',
    name: 'Tarot Classic',
    description: 'Traditional tarot imagery with gilded gold borders and rich symbolism.',
    stylePrompt: 'classical tarot card art style, gilded gold borders, rich medieval symbolism, detailed ink illustrations with gold leaf accents, traditional occult imagery',
  },
  {
    id: 'watercolor-dream',
    name: 'Watercolor Dream',
    description: 'Soft watercolor washes with delicate, flowing brushstrokes.',
    stylePrompt: 'soft watercolor painting style, delicate washes of color, flowing wet-on-wet technique, dreamy translucent layers, gentle bleeding edges, pastel and muted tones',
  },
  {
    id: 'celestial',
    name: 'Celestial',
    description: 'Cosmic deep space imagery with nebulae, stars, and celestial bodies.',
    stylePrompt: 'cosmic celestial art, deep space nebulae, brilliant stars and constellations, aurora borealis colors, galaxy swirls, midnight blue and violet palette with golden star accents',
  },
  {
    id: 'botanical',
    name: 'Botanical',
    description: 'Detailed botanical illustrations with intricate plant and flower motifs.',
    stylePrompt: 'detailed botanical illustration style, intricate plant and flower drawings, scientific illustration quality, fine line work with subtle color, vintage herbarium aesthetic',
  },
  {
    id: 'abstract-mystic',
    name: 'Abstract Mystic',
    description: 'Sacred geometry patterns with abstract spiritual symbolism.',
    stylePrompt: 'sacred geometry art, abstract spiritual symbols, mandala patterns, geometric fractals, mystical energy visualization, gold and deep purple color scheme',
  },
  {
    id: 'dark-gothic',
    name: 'Dark Gothic',
    description: 'Dramatic gothic art with deep shadows and chiaroscuro lighting.',
    stylePrompt: 'dark gothic art style, dramatic chiaroscuro lighting, deep shadows and moody atmosphere, ornate Victorian gothic details, ravens and thorns motifs, rich blacks and deep reds',
  },
  {
    id: 'art-nouveau',
    name: 'Art Nouveau',
    description: 'Flowing organic lines and decorative natural forms in the Art Nouveau tradition.',
    stylePrompt: 'Art Nouveau style, flowing organic lines, decorative natural forms, Alphonse Mucha inspired, ornate floral borders, elegant curves and stylized figures, muted jewel tones',
  },
  {
    id: 'ethereal-light',
    name: 'Ethereal Light',
    description: 'Soft glowing art with pastel luminescence and dreamlike atmosphere.',
    stylePrompt: 'ethereal soft glow art, pastel luminescence, dreamy light rays, gentle bokeh effects, angelic radiance, opalescent and iridescent color palette, soft focus mystical atmosphere',
  },
] as const;
