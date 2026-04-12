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
  daily: [
    { position: 0, name: 'Chronicle' },
  ],
  quick: [
    { position: 0, name: 'Insight' },
  ],
};

// Spread layout positions (percentage-based for desktop absolute positioning)
// Matches CeremonySpreadLayout positioning for visual consistency
export const SPREAD_LAYOUT_POSITIONS: Record<
  SpreadType,
  { x: number; y: number; rotation?: number }[]
> = {
  single: [
    { x: 50, y: 50 },
  ],
  three_card: [
    { x: 20, y: 50 },
    { x: 50, y: 50 },
    { x: 80, y: 50 },
  ],
  five_card: [
    { x: 50, y: 50 },   // 0: Situation (center)
    { x: 50, y: 15 },   // 1: Challenge (top)
    { x: 50, y: 85 },   // 2: Foundation (bottom)
    { x: 15, y: 50 },   // 3: Recent Past (left)
    { x: 85, y: 50 },   // 4: Near Future (right)
  ],
  celtic_cross: [
    { x: 30, y: 50 },                 // 0: Present
    { x: 30, y: 50, rotation: 90 },   // 1: Challenge (crossing)
    { x: 30, y: 80 },                 // 2: Foundation
    { x: 15, y: 50 },                 // 3: Recent Past
    { x: 30, y: 20 },                 // 4: Best Outcome
    { x: 45, y: 50 },                 // 5: Near Future
    { x: 75, y: 85 },                 // 6: Self
    { x: 75, y: 62 },                 // 7: Environment
    { x: 75, y: 38 },                 // 8: Hopes & Fears
    { x: 75, y: 15 },                 // 9: Final Outcome
  ],
  daily: [
    { x: 50, y: 50 },
  ],
  quick: [
    { x: 50, y: 50 },
  ],
};

// Art style presets
export const ART_STYLE_PRESETS = [
  // ── Classical & Historical (8) ──────────────────────────────────────
  {
    id: 'tarot-classic',
    name: 'Tarot Classic',
    description: 'Traditional tarot imagery with gilded gold borders and rich symbolism.',
    stylePrompt: 'Traditional tarot card with ornate gilded gold border frame, classical Rider-Waite inspired composition, rich medieval symbolism, detailed pen and ink illustration with gold leaf illumination, jewel tone palette of deep purple, emerald green, and ruby red, parchment texture background, esoteric iconography and archetypal figures',
    stabilityPreset: 'fantasy-art',
    category: 'classical',
  },
  {
    id: 'art-nouveau',
    name: 'Art Nouveau',
    description: 'Flowing organic lines and decorative natural forms in the Art Nouveau tradition.',
    stylePrompt: 'Art Nouveau oracle card in the style of Alphonse Mucha, flowing organic border frame of intertwined vines and curvilinear decorative elements, central symbolic motif surrounded by ornamental panels, elegant whiplash curves and stylized natural forms, muted jewel tones of teal, amber, and mauve, stained glass aesthetic',
    stabilityPreset: 'fantasy-art',
    category: 'classical',
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    description: 'Bold geometric patterns with luxurious gold and onyx elegance.',
    stylePrompt: 'Art Deco oracle card with bold geometric symmetry, stepped zigzurat forms and sunburst radiating lines, chrome and gold metallic accents on deep onyx black background, streamlined chevron and fan motifs, Chrysler Building inspired ornamentation, palette of gold, silver, emerald, and jet black, Gatsby-era luxury and precision',
    stabilityPreset: 'digital-art',
    category: 'classical',
  },
  {
    id: 'medieval-illuminated',
    name: 'Medieval Illuminated',
    description: 'Richly decorated manuscript pages with gold leaf and vibrant pigments.',
    stylePrompt: 'Medieval illuminated manuscript oracle card, intricate marginalia border with fantastical creatures and intertwined foliage, burnished gold leaf lettering and halos, tempera pigments on vellum texture, rich lapis lazuli blue, vermillion red, and malachite green, miniature painting style with flattened perspective, Book of Kells inspired knotwork details',
    stabilityPreset: 'fantasy-art',
    category: 'classical',
  },
  {
    id: 'byzantine',
    name: 'Byzantine',
    description: 'Iconic golden mosaic art inspired by Eastern Orthodox sacred traditions.',
    stylePrompt: 'Byzantine mosaic oracle card, tessellated gold leaf background with glass tesserae texture, frontal hieratic figures with elongated proportions and large solemn eyes, rich palette of gold, deep crimson, royal purple, and lapis blue, ornate halo patterns, architectural arches and dome motifs, sacred geometry and divine light radiating from symbolic forms',
    stabilityPreset: 'fantasy-art',
    category: 'classical',
  },
  {
    id: 'surrealism',
    name: 'Surrealism',
    description: 'Dreamlike impossible landscapes melting between reality and imagination.',
    stylePrompt: 'Surrealist oracle card inspired by Salvador Dali and Remedios Varo, melting impossible architecture and morphing organic forms, juxtaposed scale and dreamlike spatial distortion, hyper-detailed oil painting technique, palette of desert ochre, twilight blue, flesh pink, and shadow amber, symbolic eyes and clocks, biomorphic shapes floating in vast metaphysical landscapes',
    stabilityPreset: 'digital-art',
    category: 'classical',
  },
  {
    id: 'impressionism',
    name: 'Impressionism',
    description: 'Luminous broken brushstrokes capturing fleeting light and atmosphere.',
    stylePrompt: 'Impressionist oracle card in the tradition of Monet and Renoir, visible broken brushstrokes and dappled light, plein air atmospheric quality with soft edges, palette of sunlit yellow, cerulean blue, rose pink, and spring green, light dissolving forms into color vibration, gentle garden and water motifs, golden hour luminosity suffusing the entire composition',
    stabilityPreset: 'enhance',
    category: 'classical',
  },
  {
    id: 'ukiyo-e',
    name: 'Ukiyo-e',
    description: 'Japanese woodblock prints with bold outlines and flat vivid color.',
    stylePrompt: 'Ukiyo-e woodblock print oracle card in the tradition of Hokusai and Hiroshige, bold black outlines with flat areas of vivid color, dramatic wave and mountain motifs, stylized clouds and pine branches, palette of indigo blue, vermillion red, sage green, and cream, visible wood grain texture, cartouche text panels, atmospheric perspective through layered planes of color',
    stabilityPreset: 'line-art',
    category: 'classical',
  },

  // ── Modern & Contemporary Digital (10) ─────────────────────────────
  {
    id: 'abstract-mystic',
    name: 'Abstract Mystic',
    description: 'Sacred geometry patterns with abstract spiritual symbolism.',
    stylePrompt: 'Mystical oracle card composed of sacred geometry, mandala-like border frame of repeating geometric patterns, fractal recursion and glowing energy lines, luminous gold, amethyst purple, and turquoise against deep indigo background, third eye and chakra symbolism integrated geometrically, sense of divine mathematical order',
    stabilityPreset: 'digital-art',
    category: 'modern',
  },
  {
    id: 'minimalist-geometric',
    name: 'Minimalist Geometric',
    description: 'Clean geometric shapes with restrained color and elegant negative space.',
    stylePrompt: 'Minimalist geometric oracle card, clean precise shapes on vast negative space, single symbolic form reduced to essential geometry, Bauhaus and Swiss design influence, limited palette of charcoal black, warm white, and one accent color, thin hairline borders, mathematical proportion and grid alignment, quiet contemplative power through reduction and restraint',
    stabilityPreset: 'digital-art',
    category: 'modern',
  },
  {
    id: 'flat-design',
    name: 'Flat Design',
    description: 'Modern vector illustration with bold colors and crisp layered shapes.',
    stylePrompt: 'Flat design vector oracle card with clean geometric shapes and no gradients or shadows, bold saturated color blocks, modern digital illustration style, playful symbolic iconography, palette of coral, teal, golden yellow, and soft charcoal, crisp edges and uniform line weights, contemporary graphic design aesthetic with layered cut-paper feel',
    stabilityPreset: 'digital-art',
    category: 'modern',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon-drenched dystopian tech aesthetic with holographic glitches.',
    stylePrompt: 'Cyberpunk oracle card with neon light trails and holographic interference patterns, circuit board geometry and data stream motifs, rain-slicked chrome surfaces reflecting electric pink, cyan, and violet, dark carbon fiber background, glitch distortion artifacts, augmented reality overlay elements, Blade Runner inspired atmospheric haze and towering megastructure silhouettes',
    stabilityPreset: 'neon-punk',
    category: 'modern',
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Retro-digital nostalgia with pastel grids and Roman busts.',
    stylePrompt: 'Vaporwave aesthetic oracle card with wireframe grid receding into sunset horizon, glitched classical marble bust fragments, palm trees and retro computer windows, palette of hot pink, electric cyan, soft lavender, and sunset orange on deep purple, VHS scan lines and chromatic aberration, Japanese katakana accents, nostalgic digital dreamscape',
    stabilityPreset: 'neon-punk',
    category: 'modern',
  },
  {
    id: 'solarpunk',
    name: 'Solarpunk',
    description: 'Optimistic eco-futurism where lush nature merges with green technology.',
    stylePrompt: 'Solarpunk oracle card depicting harmonious fusion of verdant nature and clean technology, solar panel mosaics integrated into living architecture, bioluminescent plants and crystal energy conductors, palette of vivid emerald green, solar gold, sky blue, and terracotta, Art Nouveau curves meeting futuristic transparent materials, hopeful utopian atmosphere with abundant plant life',
    stabilityPreset: 'digital-art',
    category: 'modern',
  },
  {
    id: 'cottagecore',
    name: 'Cottagecore',
    description: 'Idyllic pastoral charm with wildflowers, herbs, and cozy handcrafted warmth.',
    stylePrompt: 'Cottagecore oracle card with soft hand-illustrated pastoral scene, wildflower meadows and herb bundles tied with twine, honey bees and butterflies, thatched cottage elements, hand-stitched embroidery border motif, palette of butter yellow, dusty rose, sage green, and warm linen cream, pressed flower aesthetic, gentle nostalgic warmth and rural simplicity',
    stabilityPreset: 'enhance',
    category: 'modern',
  },
  {
    id: 'dark-academia',
    name: 'Dark Academia',
    description: 'Scholarly gothic elegance with antique books and candlelit mystery.',
    stylePrompt: 'Dark academia oracle card with aged leather book textures and antique library atmosphere, classical columns and gothic arched windows, candlelight illumination casting warm pools of light, scattered manuscript pages and astronomical instruments, palette of deep mahogany brown, forest green, midnight navy, and aged parchment gold, intellectual mysticism and scholarly melancholy',
    stabilityPreset: 'cinematic',
    category: 'modern',
  },
  {
    id: 'retrowave',
    name: 'Retrowave',
    description: 'Synthwave 80s nostalgia with chrome typography and sunset grids.',
    stylePrompt: 'Retrowave synthwave oracle card with chrome metallic text effects, perspective grid floor extending to distant mountain horizon, massive setting sun with horizontal stripe bands, palette of electric magenta, hot orange, chrome silver, and deep indigo, laser beam light streaks, retro sports car and palm tree silhouettes, 1980s VHS box art aesthetic with scan lines',
    stabilityPreset: 'neon-punk',
    category: 'modern',
  },
  {
    id: 'glitch-art',
    name: 'Glitch Art',
    description: 'Corrupted digital beauty with pixel sorting and chromatic distortion.',
    stylePrompt: 'Glitch art oracle card with intentional digital corruption and pixel sorting bands, chromatic RGB channel separation, data moshing artifacts revealing hidden symbolic forms beneath, fragmented scanlines and displaced image blocks, palette of electric cyan, magenta, acid green, and static gray on black, beauty emerging from digital entropy and broken data streams',
    stabilityPreset: 'neon-punk',
    category: 'modern',
  },

  // ── Cultural & Spiritual (6) ───────────────────────────────────────
  {
    id: 'egyptian',
    name: 'Egyptian',
    description: 'Ancient Egyptian temple art with hieroglyphs and sacred geometry.',
    stylePrompt: 'Ancient Egyptian oracle card with temple wall painting aesthetic, hieroglyphic border cartouches and sacred ankh symbols, composite figure drawing with profile faces and frontal torsos, winged scarab and Eye of Horus motifs, palette of lapis lazuli blue, gold leaf, terracotta red, and papyrus cream, geometric precision of pyramid proportions, Nile lotus and reed patterns',
    stabilityPreset: 'fantasy-art',
    category: 'cultural',
  },
  {
    id: 'celtic',
    name: 'Celtic',
    description: 'Intricate Celtic knotwork with spirals and mythological symbolism.',
    stylePrompt: 'Celtic oracle card with elaborate interlaced knotwork border that has no beginning or end, triskele spirals and triquetra symbols, mythological animals woven into endless loops, illuminated manuscript influence with dot ornamentation, palette of forest green, burnished gold, deep crimson, and slate blue, ancient stone carving texture, druidic tree of life and rune elements',
    stabilityPreset: 'fantasy-art',
    category: 'cultural',
  },
  {
    id: 'hindu-buddhist',
    name: 'Hindu-Buddhist',
    description: 'Vibrant sacred art with lotus mandalas, mudras, and divine iconography.',
    stylePrompt: 'Hindu-Buddhist sacred art oracle card, ornate mandala border with lotus petal layers, mudra hand gestures and dharma wheel symbolism, rich thangka painting technique with fine gold line detail, multiple arms and divine attributes, palette of saffron orange, deep maroon, turquoise, gold, and lotus pink, flame aureoles and cloud scrolls, meditative serenity and cosmic dance',
    stabilityPreset: 'fantasy-art',
    category: 'cultural',
  },
  {
    id: 'mesoamerican',
    name: 'Mesoamerican',
    description: 'Bold Aztec and Mayan motifs with stepped pyramids and cosmic serpents.',
    stylePrompt: 'Mesoamerican oracle card combining Aztec and Mayan artistic traditions, stepped pyramid geometric borders with glyph blocks, feathered serpent Quetzalcoatl motifs and jaguar symbolism, sun stone calendar elements, bold carved stone relief aesthetic, palette of jade green, obsidian black, cinnabar red, turquoise blue, and maize gold, cosmic mythology and sacred astronomy',
    stabilityPreset: 'fantasy-art',
    category: 'cultural',
  },
  {
    id: 'african-traditional',
    name: 'African Traditional',
    description: 'Rich West African textile and mask patterns with earth-tone warmth.',
    stylePrompt: 'African traditional art oracle card inspired by West African textile and mask traditions, bold geometric Kente cloth border patterns, Adinkra symbol integration representing wisdom concepts, carved wooden mask stylization with symmetrical features, palette of warm earth tones including burnt sienna, indigo, ochre gold, terracotta, and ivory, Baule and Yoruba artistic influence, rhythm and pattern repetition',
    stabilityPreset: 'digital-art',
    category: 'cultural',
  },
  {
    id: 'indigenous-native',
    name: 'Indigenous Native',
    description: 'Pacific Northwest formline art with bold ovoids and spirit animals.',
    stylePrompt: 'Indigenous Pacific Northwest formline art oracle card, bold ovoid and U-form design language, spirit animal transformation figures with nested inner forms, cedar and salmon motifs, traditional red and black on natural cedar background, precise symmetrical composition with slight asymmetric tension, totem pole carving influence, palette of vermillion red, black, teal, and natural wood tones, reverent connection to land and spirit world',
    stabilityPreset: 'digital-art',
    category: 'cultural',
  },

  // ── Illustration & Fine Craft (9) ──────────────────────────────────
  {
    id: 'botanical',
    name: 'Botanical',
    description: 'Detailed botanical illustrations with intricate plant and flower motifs.',
    stylePrompt: 'Botanical oracle card in vintage herbarium style, decorative border of intertwining vines, leaves, and pressed flowers, precise pen and ink line work with delicate watercolor tinting, cream parchment background, scientific illustration meets mystical symbolism, naturalistic palette of sage green, dusty rose, ochre, and sepia',
    stabilityPreset: 'enhance',
    category: 'illustration',
  },
  {
    id: 'watercolor-dream',
    name: 'Watercolor Dream',
    description: 'Soft watercolor washes with delicate, flowing brushstrokes.',
    stylePrompt: 'Watercolor oracle card, soft transparent washes bleeding to edges with organic vignette, wet-on-wet technique with gentle color bleeds, dreamy atmospheric layering, pastel palette of rose, lavender, sky blue, and mint, visible paper texture, impressionistic symbolic forms emerging from color fields, delicate and luminous',
    stabilityPreset: 'enhance',
    category: 'illustration',
  },
  {
    id: 'medical-anatomical',
    name: 'Medical Anatomical',
    description: 'Vintage anatomical diagrams revealing the mystical architecture of the body.',
    stylePrompt: 'Vintage medical anatomical oracle card in the style of Gray\'s Anatomy and Andreas Vesalius engravings, detailed cross-section and écorché figure studies, precise copperplate engraving line work, anatomical heart and nervous system motifs intertwined with esoteric symbols, palette of sepia ink, faded parchment cream, arterial red, and venous blue, scientific wonder meets spiritual mystery',
    stabilityPreset: 'line-art',
    category: 'illustration',
  },
  {
    id: 'woodcut-linocut',
    name: 'Woodcut & Linocut',
    description: 'Bold relief print art with stark contrasts and hand-carved texture.',
    stylePrompt: 'Woodcut linocut print oracle card with bold black and white contrast and visible carved groove texture, stark graphic shapes with rough hand-cut edges, dramatic chiaroscuro through parallel hatching lines, Expressionist influence with emotional intensity, limited palette of black ink on cream paper with optional single accent color of deep red or blue, folk art narrative quality',
    stabilityPreset: 'line-art',
    category: 'illustration',
  },
  {
    id: 'pen-and-ink',
    name: 'Pen & Ink',
    description: 'Intricate crosshatched illustrations with obsessive fine-line detail.',
    stylePrompt: 'Pen and ink oracle card with obsessively detailed crosshatching and stipple work, fine nib precision creating depth through line density alone, no color — pure black India ink on bright white paper, Victorian-era scientific illustration quality, elaborate decorative frame of swirling organic and geometric patterns, Albrecht Dürer and Gustave Doré engraving influence, mesmerizing textural complexity',
    stabilityPreset: 'line-art',
    category: 'illustration',
  },
  {
    id: 'charcoal-graphite',
    name: 'Charcoal & Graphite',
    description: 'Dramatic tonal drawings with velvety shadows and expressive smudging.',
    stylePrompt: 'Charcoal and graphite oracle card with rich tonal gradations from deep velvet black to luminous white, expressive smudged edges and gestural mark-making, dramatic spotlight lighting creating deep atmospheric shadow, visible paper tooth texture, soft blended passages contrasting with sharp decisive lines, monochromatic with warm charcoal undertones, raw emotional intensity and chiaroscuro drama',
    stabilityPreset: 'cinematic',
    category: 'illustration',
  },
  {
    id: 'comic-book',
    name: 'Comic Book',
    description: 'Dynamic superhero-style panels with bold inks and halftone dots.',
    stylePrompt: 'Comic book oracle card with dynamic action composition and dramatic foreshortening, bold black ink outlines with confident brushwork, Ben-Day dot halftone shading pattern, Kirby crackle energy effects and motion lines, primary color palette of red, blue, yellow, and black with white highlights, speech bubble and panel border elements, Marvel and DC bronze age aesthetic, heroic symbolic figures',
    stabilityPreset: 'comic-book',
    category: 'illustration',
  },
  {
    id: 'childrens-book',
    name: 'Children\'s Book',
    description: 'Whimsical storybook illustration with gentle charm and wonder.',
    stylePrompt: 'Children\'s book illustration oracle card with gentle whimsical charm, soft rounded character forms and friendly symbolic creatures, gouache and colored pencil mixed media texture, warm inviting composition with magical realism elements, palette of soft peach, sky blue, meadow green, and sunshine yellow, Beatrix Potter and Studio Ghibli influenced warmth, sense of wonder and gentle storytelling',
    stabilityPreset: 'enhance',
    category: 'illustration',
  },
  {
    id: 'collage-mixed-media',
    name: 'Collage & Mixed Media',
    description: 'Layered paper collage with torn edges and found-object textures.',
    stylePrompt: 'Collage mixed media oracle card with layered torn paper fragments and found imagery, vintage magazine cutouts and ephemera overlapping with paint strokes, visible glue edges and tape, hand-drawn elements over photographic fragments, washi tape and stamp marks, eclectic palette mixing sepia photographs with bright acrylic paint splashes, Kurt Schwitters and Robert Rauschenberg influenced assemblage',
    stabilityPreset: 'digital-art',
    category: 'illustration',
  },

  // ── Photography & Fine Art Processes (5) ────────────────────────────
  {
    id: 'ethereal-light',
    name: 'Ethereal Light',
    description: 'Soft glowing art with pastel luminescence and dreamlike atmosphere.',
    stylePrompt: 'Ethereal luminous oracle card bathed in soft heavenly light, glowing halo vignette radiating from edges, gentle rays of divine radiance, dreamy soft-focus with subtle bokeh, angelic atmosphere, opalescent color shifts of pearl white, soft pink, lavender, and golden yellow, translucent overlapping light layers',
    stabilityPreset: 'cinematic',
    category: 'photography',
  },
  {
    id: 'stained-glass',
    name: 'Stained Glass',
    description: 'Luminous cathedral windows with jewel-tone glass and dark lead lines.',
    stylePrompt: 'Stained glass window oracle card with thick dark lead came lines separating jewel-tone glass segments, luminous backlit translucency effect with light streaming through colored glass, Gothic cathedral rose window composition, deep ruby red, sapphire blue, emerald green, and amber gold with pure white highlights, sacred symbolic figures in medieval ecclesiastical style, radiant divine light',
    stabilityPreset: 'digital-art',
    category: 'photography',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Rich impasto brushwork with luminous glazes and Old Master depth.',
    stylePrompt: 'Oil painting oracle card with rich impasto brushwork and visible palette knife texture, luminous Old Master glazing technique building depth through transparent layers, Rembrandt lighting with warm golden highlights against deep umber shadows, buttery paint consistency and confident brushstrokes, palette of titanium white, cadmium yellow, burnt sienna, ultramarine blue, and alizarin crimson, gallery-worthy fine art quality',
    stabilityPreset: 'cinematic',
    category: 'photography',
  },
  {
    id: 'daguerreotype',
    name: 'Daguerreotype',
    description: 'Haunting early photography on silver plates with mirror-like luminance.',
    stylePrompt: 'Daguerreotype oracle card mimicking early 1840s photographic process, mirror-like silver plate surface with ethereal ghostly figure, slightly blurred long-exposure quality, ornate velvet-lined case border, tarnished silver patina with iridescent rainbow oxidation at edges, monochromatic silver-gray tonal range, haunting Victorian-era spiritual photography aesthetic, memento mori symbolism',
    stabilityPreset: 'analog-film',
    category: 'photography',
  },
  {
    id: 'cyanotype',
    name: 'Cyanotype',
    description: 'Prussian blue sun-printed botanical silhouettes on textured paper.',
    stylePrompt: 'Cyanotype sun print oracle card in the tradition of Anna Atkins, deep Prussian blue photogram silhouettes of botanical specimens and symbolic objects, white negative space revealing intricate detail, rough handmade paper texture with uneven coating edges, tonal range from deep midnight blue to pale sky blue and white, organic imperfections and light leaks, contact print intimacy and scientific beauty',
    stabilityPreset: 'analog-film',
    category: 'photography',
  },

  // ── Period & Vintage (5) ───────────────────────────────────────────
  {
    id: 'dark-gothic',
    name: 'Dark Gothic',
    description: 'Dramatic gothic art with deep shadows and chiaroscuro lighting.',
    stylePrompt: 'Dark gothic oracle card with ornate frame of thorns, wrought iron, and baroque ornamentation, dramatic Caravaggio chiaroscuro lighting, deep velvety shadows, macabre romantic symbolism with ravens, skulls, roses, cathedral architecture elements, rich palette of obsidian black, crimson, midnight purple, and tarnished silver',
    stabilityPreset: 'cinematic',
    category: 'period',
  },
  {
    id: 'victorian',
    name: 'Victorian',
    description: 'Ornate 19th-century parlor elegance with sepia tones and filigree.',
    stylePrompt: 'Victorian era oracle card with elaborate ornamental filigree border, sepia-toned engraving style with fine crosshatching, cameo portraits and silhouette motifs, decorative scrollwork and acanthus leaf patterns, palette of sepia brown, dusty mauve, bottle green, and antique gold, calling card and cabinet photo aesthetic, velvet and lace texture, refined parlor elegance and spiritualist séance atmosphere',
    stabilityPreset: 'analog-film',
    category: 'period',
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    description: 'Brass clockwork mechanisms and Victorian-industrial mechanical fantasy.',
    stylePrompt: 'Steampunk oracle card with intricate brass clockwork mechanisms and copper gear assemblies, exposed mechanical innards and pressure gauge readouts, leather strapping and riveted iron plates, steam clouds and glass vacuum tubes, palette of polished brass gold, aged copper green, mahogany brown, and iron gray, Victorian industrial typography, airship and automaton motifs, Jules Verne scientific romance aesthetic',
    stabilityPreset: '3d-model',
    category: 'period',
  },
  {
    id: 'vintage-poster',
    name: 'Vintage Poster',
    description: 'Bold lithographic poster art with hand-lettered typography.',
    stylePrompt: 'Vintage lithographic poster oracle card in the style of Toulouse-Lautrec and vintage travel posters, bold flat color areas with slight registration offset, strong graphic silhouettes and simplified forms, hand-lettered decorative typography, limited spot color palette of vermillion, navy blue, golden yellow, and olive green on cream stock, visible paper grain and slight ink buildup texture, nostalgic advertising art charm',
    stabilityPreset: 'analog-film',
    category: 'period',
  },
  {
    id: 'psychedelic-poster',
    name: 'Psychedelic Poster',
    description: 'Mind-bending 1960s concert poster art with flowing lettering and acid colors.',
    stylePrompt: 'Psychedelic 1960s concert poster oracle card with flowing melting letterforms and organic Art Nouveau revival curves, vibrating complementary color combinations of electric orange and blue, hot pink and green, saturated acid palette, kaleidoscopic mandala patterns and op-art optical illusions, Victor Moscoso and Wes Wilson inspired typography, trippy swirling forms and consciousness-expanding visual complexity',
    stabilityPreset: 'neon-punk',
    category: 'period',
  },

  // ── Nature & Animal (2) ────────────────────────────────────────────
  {
    id: 'celestial',
    name: 'Celestial',
    description: 'Cosmic deep space imagery with nebulae, stars, and celestial bodies.',
    stylePrompt: 'Cosmic oracle card set in deep space, thin border of constellation lines and scattered stars, nebula clouds and star fields, constellation patterns forming symbolic shapes, aurora ribbons of teal, violet, magenta, and gold, midnight blue and deep purple gradient, luminous celestial bodies, sense of infinite depth',
    stabilityPreset: 'fantasy-art',
    category: 'nature',
  },
  {
    id: 'wildlife-illustration',
    name: 'Wildlife Illustration',
    description: 'Majestic natural history paintings of spirit animals in their habitats.',
    stylePrompt: 'Wildlife natural history illustration oracle card in the tradition of John James Audubon and Ernst Haeckel, meticulously detailed animal portrait in natural habitat, scientifically accurate anatomy with subtly mystical atmosphere, hand-colored engraving aesthetic, palette of forest green, bark brown, sky blue, and feather-accurate naturalistic tones, decorative specimen label border, reverence for the animal kingdom and ecological wonder',
    stabilityPreset: 'enhance',
    category: 'nature',
  },
] as const;

// Gradient placeholders for art style thumbnails
export const ART_STYLE_GRADIENTS: Record<
  string,
  { gradient: string; icon: string }
> = {
  // ── Classical & Historical ──────────────────────────────────────────
  'tarot-classic': {
    gradient: 'from-amber-900 via-yellow-700 to-amber-800',
    icon: 'Crown',
  },
  'art-nouveau': {
    gradient: 'from-teal-800 via-amber-700 to-teal-700',
    icon: 'Flower2',
  },
  'art-deco': {
    gradient: 'from-yellow-600 via-gray-900 to-yellow-700',
    icon: 'Diamond',
  },
  'medieval-illuminated': {
    gradient: 'from-blue-900 via-amber-700 to-red-900',
    icon: 'BookOpen',
  },
  byzantine: {
    gradient: 'from-yellow-700 via-red-900 to-yellow-600',
    icon: 'Shield',
  },
  surrealism: {
    gradient: 'from-amber-700 via-sky-800 to-rose-700',
    icon: 'Eye',
  },
  impressionism: {
    gradient: 'from-sky-400 via-rose-300 to-yellow-300',
    icon: 'Sun',
  },
  'ukiyo-e': {
    gradient: 'from-indigo-800 via-red-700 to-slate-300',
    icon: 'Waves',
  },

  // ── Modern & Contemporary Digital ──────────────────────────────────
  'abstract-mystic': {
    gradient: 'from-purple-900 via-fuchsia-800 to-purple-700',
    icon: 'Hexagon',
  },
  'minimalist-geometric': {
    gradient: 'from-gray-200 via-gray-100 to-gray-300',
    icon: 'Circle',
  },
  'flat-design': {
    gradient: 'from-teal-500 via-coral-400 to-yellow-400',
    icon: 'Shapes',
  },
  cyberpunk: {
    gradient: 'from-cyan-500 via-fuchsia-600 to-violet-900',
    icon: 'Zap',
  },
  vaporwave: {
    gradient: 'from-fuchsia-500 via-violet-400 to-cyan-400',
    icon: 'Globe',
  },
  solarpunk: {
    gradient: 'from-emerald-600 via-yellow-500 to-sky-500',
    icon: 'TreePine',
  },
  cottagecore: {
    gradient: 'from-yellow-200 via-rose-200 to-green-200',
    icon: 'Flower2',
  },
  'dark-academia': {
    gradient: 'from-amber-950 via-green-950 to-stone-900',
    icon: 'BookOpen',
  },
  retrowave: {
    gradient: 'from-fuchsia-600 via-orange-500 to-indigo-900',
    icon: 'Sparkles',
  },
  'glitch-art': {
    gradient: 'from-cyan-400 via-fuchsia-500 to-green-400',
    icon: 'Layers',
  },

  // ── Cultural & Spiritual ───────────────────────────────────────────
  egyptian: {
    gradient: 'from-yellow-600 via-blue-900 to-amber-700',
    icon: 'Triangle',
  },
  celtic: {
    gradient: 'from-green-900 via-amber-700 to-green-800',
    icon: 'Compass',
  },
  'hindu-buddhist': {
    gradient: 'from-orange-600 via-fuchsia-700 to-amber-500',
    icon: 'Orbit',
  },
  mesoamerican: {
    gradient: 'from-teal-700 via-red-800 to-amber-600',
    icon: 'Sun',
  },
  'african-traditional': {
    gradient: 'from-amber-800 via-orange-700 to-yellow-600',
    icon: 'Target',
  },
  'indigenous-native': {
    gradient: 'from-red-800 via-stone-700 to-teal-800',
    icon: 'Feather',
  },

  // ── Illustration & Fine Craft ──────────────────────────────────────
  botanical: {
    gradient: 'from-green-800 via-emerald-600 to-green-700',
    icon: 'Leaf',
  },
  'watercolor-dream': {
    gradient: 'from-pink-300 via-purple-200 to-blue-300',
    icon: 'Droplets',
  },
  'medical-anatomical': {
    gradient: 'from-stone-300 via-red-400 to-stone-400',
    icon: 'Heart',
  },
  'woodcut-linocut': {
    gradient: 'from-stone-900 via-stone-800 to-stone-950',
    icon: 'Square',
  },
  'pen-and-ink': {
    gradient: 'from-gray-900 via-white to-gray-900',
    icon: 'Paintbrush',
  },
  'charcoal-graphite': {
    gradient: 'from-gray-800 via-gray-500 to-gray-900',
    icon: 'Brush',
  },
  'comic-book': {
    gradient: 'from-red-600 via-blue-600 to-yellow-500',
    icon: 'Zap',
  },
  'childrens-book': {
    gradient: 'from-sky-300 via-yellow-200 to-green-300',
    icon: 'Star',
  },
  'collage-mixed-media': {
    gradient: 'from-orange-400 via-teal-500 to-rose-400',
    icon: 'Scissors',
  },

  // ── Photography & Fine Art Processes ────────────────────────────────
  'ethereal-light': {
    gradient: 'from-sky-200 via-rose-200 to-violet-200',
    icon: 'Sparkles',
  },
  'stained-glass': {
    gradient: 'from-red-700 via-blue-700 to-amber-600',
    icon: 'Gem',
  },
  'oil-painting': {
    gradient: 'from-amber-800 via-blue-900 to-red-900',
    icon: 'Palette',
  },
  daguerreotype: {
    gradient: 'from-gray-500 via-gray-300 to-gray-600',
    icon: 'Camera',
  },
  cyanotype: {
    gradient: 'from-blue-900 via-blue-700 to-sky-400',
    icon: 'CloudSun',
  },

  // ── Period & Vintage ───────────────────────────────────────────────
  'dark-gothic': {
    gradient: 'from-gray-900 via-red-950 to-gray-900',
    icon: 'Skull',
  },
  victorian: {
    gradient: 'from-amber-900 via-stone-700 to-rose-900',
    icon: 'Crown',
  },
  steampunk: {
    gradient: 'from-amber-700 via-yellow-600 to-stone-700',
    icon: 'Compass',
  },
  'vintage-poster': {
    gradient: 'from-red-700 via-yellow-600 to-blue-800',
    icon: 'Anchor',
  },
  'psychedelic-poster': {
    gradient: 'from-orange-500 via-pink-500 to-green-500',
    icon: 'Rainbow',
  },

  // ── Nature & Animal ────────────────────────────────────────────────
  celestial: {
    gradient: 'from-indigo-900 via-violet-800 to-blue-900',
    icon: 'Moon',
  },
  'wildlife-illustration': {
    gradient: 'from-green-800 via-amber-700 to-sky-700',
    icon: 'Feather',
  },
};
