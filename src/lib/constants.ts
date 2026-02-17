import type { SpreadType } from '@/types';

// Image generation: cards stuck in "generating" longer than this are auto-recovered to "failed"
export const STALE_GENERATION_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

// Master account — only this email can publish prompt overrides to all users
export const MASTER_EMAIL = "profbenjo@gmail.com";

// Plan limits — credit-based model
// Credits: 1 credit = 1 card (text + image bundled) or 1 image regen
// Readings: daily allowance, not credit-based
export const PLAN_LIMITS = {
  free: {
    credits: 11,               // lifetime total (never resets)
    creditsAreLifetime: true,
    readingsPerDay: 1,
    spreads: ['single', 'three_card'] as const,
    aiModel: 'standard' as const,
    voiceCharactersPerMonth: 50_000,
    voiceProvider: 'google' as const,
  },
  pro: {
    credits: 50,               // per month (resets monthly)
    creditsAreLifetime: false,
    readingsPerDay: 5,
    spreads: ['single', 'three_card', 'five_card', 'celtic_cross'] as const,
    aiModel: 'master_oracle' as const,
    voiceCharactersPerMonth: 200_000,
    voiceProvider: 'google' as const,
  },
  admin: {
    credits: Infinity,
    creditsAreLifetime: false,
    readingsPerDay: Infinity,
    spreads: ['single', 'three_card', 'five_card', 'celtic_cross'] as const,
    aiModel: 'master_oracle' as const,
    voiceCharactersPerMonth: Infinity,
    voiceProvider: 'google' as const,
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
    stylePrompt: 'Traditional tarot card with ornate gilded gold border frame, classical Rider-Waite inspired composition, rich medieval symbolism, detailed pen and ink illustration with gold leaf illumination, jewel tone palette of deep purple, emerald green, and ruby red, parchment texture background, esoteric iconography and archetypal figures',
    stabilityPreset: 'fantasy-art',
  },
  {
    id: 'watercolor-dream',
    name: 'Watercolor Dream',
    description: 'Soft watercolor washes with delicate, flowing brushstrokes.',
    stylePrompt: 'Watercolor oracle card, soft transparent washes bleeding to edges with organic vignette, wet-on-wet technique with gentle color bleeds, dreamy atmospheric layering, pastel palette of rose, lavender, sky blue, and mint, visible paper texture, impressionistic symbolic forms emerging from color fields, delicate and luminous',
    stabilityPreset: 'enhance',
  },
  {
    id: 'celestial',
    name: 'Celestial',
    description: 'Cosmic deep space imagery with nebulae, stars, and celestial bodies.',
    stylePrompt: 'Cosmic oracle card set in deep space, thin border of constellation lines and scattered stars, nebula clouds and star fields, constellation patterns forming symbolic shapes, aurora ribbons of teal, violet, magenta, and gold, midnight blue and deep purple gradient, luminous celestial bodies, sense of infinite depth',
    stabilityPreset: 'fantasy-art',
  },
  {
    id: 'botanical',
    name: 'Botanical',
    description: 'Detailed botanical illustrations with intricate plant and flower motifs.',
    stylePrompt: 'Botanical oracle card in vintage herbarium style, decorative border of intertwining vines, leaves, and pressed flowers, precise pen and ink line work with delicate watercolor tinting, cream parchment background, scientific illustration meets mystical symbolism, naturalistic palette of sage green, dusty rose, ochre, and sepia',
    stabilityPreset: 'enhance',
  },
  {
    id: 'abstract-mystic',
    name: 'Abstract Mystic',
    description: 'Sacred geometry patterns with abstract spiritual symbolism.',
    stylePrompt: 'Mystical oracle card composed of sacred geometry, mandala-like border frame of repeating geometric patterns, fractal recursion and glowing energy lines, luminous gold, amethyst purple, and turquoise against deep indigo background, third eye and chakra symbolism integrated geometrically, sense of divine mathematical order',
    stabilityPreset: 'digital-art',
  },
  {
    id: 'dark-gothic',
    name: 'Dark Gothic',
    description: 'Dramatic gothic art with deep shadows and chiaroscuro lighting.',
    stylePrompt: 'Dark gothic oracle card with ornate frame of thorns, wrought iron, and baroque ornamentation, dramatic Caravaggio chiaroscuro lighting, deep velvety shadows, macabre romantic symbolism with ravens, skulls, roses, cathedral architecture elements, rich palette of obsidian black, crimson, midnight purple, and tarnished silver',
    stabilityPreset: 'cinematic',
  },
  {
    id: 'art-nouveau',
    name: 'Art Nouveau',
    description: 'Flowing organic lines and decorative natural forms in the Art Nouveau tradition.',
    stylePrompt: 'Art Nouveau oracle card in the style of Alphonse Mucha, flowing organic border frame of intertwined vines and curvilinear decorative elements, central symbolic motif surrounded by ornamental panels, elegant whiplash curves and stylized natural forms, muted jewel tones of teal, amber, and mauve, stained glass aesthetic',
    stabilityPreset: 'fantasy-art',
  },
  {
    id: 'ethereal-light',
    name: 'Ethereal Light',
    description: 'Soft glowing art with pastel luminescence and dreamlike atmosphere.',
    stylePrompt: 'Ethereal luminous oracle card bathed in soft heavenly light, glowing halo vignette radiating from edges, gentle rays of divine radiance, dreamy soft-focus with subtle bokeh, angelic atmosphere, opalescent color shifts of pearl white, soft pink, lavender, and golden yellow, translucent overlapping light layers',
    stabilityPreset: 'cinematic',
  },
] as const;

// Gradient placeholders for art style thumbnails
export const ART_STYLE_GRADIENTS: Record<
  string,
  { gradient: string; icon: string }
> = {
  'tarot-classic': {
    gradient: 'from-amber-900 via-yellow-700 to-amber-800',
    icon: 'Crown',
  },
  'watercolor-dream': {
    gradient: 'from-pink-300 via-purple-200 to-blue-300',
    icon: 'Droplets',
  },
  celestial: {
    gradient: 'from-indigo-900 via-violet-800 to-blue-900',
    icon: 'Star',
  },
  botanical: {
    gradient: 'from-green-800 via-emerald-600 to-green-700',
    icon: 'Leaf',
  },
  'abstract-mystic': {
    gradient: 'from-purple-900 via-fuchsia-800 to-purple-700',
    icon: 'Hexagon',
  },
  'dark-gothic': {
    gradient: 'from-gray-900 via-red-950 to-gray-900',
    icon: 'Skull',
  },
  'art-nouveau': {
    gradient: 'from-teal-800 via-amber-700 to-teal-700',
    icon: 'Flower2',
  },
  'ethereal-light': {
    gradient: 'from-sky-200 via-rose-200 to-violet-200',
    icon: 'Sun',
  },
};
