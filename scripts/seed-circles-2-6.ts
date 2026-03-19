/**
 * Seed data for Circles 2–6.
 *
 * Circle 2 ("The Mirror") — full content: 3 paths, 7 retreats each, 4-5 waypoints per retreat.
 * Circles 3–6 — metadata stubs only (no retreats/waypoints).
 *
 * Usage: import into the main seed script or run independently.
 */

// ── Types ────────────────────────────────────────────────────────────

type WaypointSeed = {
  name: string;
  description: string;
  suggestedIntention: string;
  waypointLens: string;
};

type ObstacleCardSeed = {
  title: string;
  meaning: string;
  guidance: string;
  imagePrompt: string;
};

type RetreatSeed = {
  name: string;
  description: string;
  theme: string;
  retreatLens: string;
  estimatedReadings: number;
  waypoints: WaypointSeed[];
  obstacleCards?: ObstacleCardSeed[];
};

type PathSeed = {
  name: string;
  description: string;
  themes: string[];
  symbolicVocabulary: string[];
  interpretiveLens: string;
  iconKey: string;
  retreats: RetreatSeed[];
};

type CircleStub = {
  name: string;
  description: string;
  circleNumber: number;
  sortOrder: number;
  iconKey: string;
  themes: string[];
  estimatedDays: number;
  paths: {
    name: string;
    description: string;
    iconKey: string;
    themes: string[];
  }[];
};

// ── Circle 2: "The Mirror" — Full Content ────────────────────────────

export const CIRCLE_2_PATHS: PathSeed[] = [
  // ── Path 1: The Emotional Landscape ─────────────────────────────────
  {
    name: "The Emotional Landscape",
    description:
      "Map the terrain of your inner weather — learning to name, feel, transform, and move fluidly between emotional states without being swept away by any single storm.",
    themes: [
      "emotions",
      "feeling states",
      "reactivity",
      "emotional intelligence",
      "inner weather",
      "triggers",
      "emotional alchemy",
    ],
    symbolicVocabulary: [
      "storm",
      "calm",
      "fire",
      "flood",
      "ice",
      "warmth",
      "trembling",
      "stillness",
      "eruption",
      "settling",
      "wave",
      "shore",
      "heat",
      "cool",
      "pressure",
      "release",
    ],
    interpretiveLens:
      "Every card reflects an emotional state, pattern, or movement. Read the cards as weather reports from the inner world — not diagnosing or pathologizing, but naming and honoring the full spectrum of feeling. Emotions are intelligence; reactivity is unprocessed wisdom. The cards invite the seeker to slow down, feel fully, and discover what each emotion is trying to protect or communicate. Draw on the language of somatic experience, emotional alchemy, and the wisdom traditions that treat feeling as a sacred sense.",
    iconKey: "waves",
    retreats: [
      // ── Retreat 1: Naming the Weather ──────────────────────────────
      {
        name: "Naming the Weather",
        description:
          "Before you can transform an emotion, you must first name it. This retreat builds the vocabulary of feeling — learning to identify inner states with precision and without judgment. The act of naming is itself a form of liberation.",
        theme: "Emotional identification and naming",
        retreatLens:
          "Every card in this retreat is an invitation to name an emotion — not in broad strokes like 'good' or 'bad,' but with the precision of a poet. What is the exact shade of this feeling? Is it anxiety or anticipation? Grief or melancholy? Interpret through the lens of emotional granularity: the more precisely we can name what we feel, the less it controls us. Model emotional vocabulary in the interpretation itself.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Unnamed Feeling",
            description:
              "There is something stirring beneath the surface — a feeling without a name. This waypoint asks you to sit with what you feel before reaching for a label.",
            suggestedIntention:
              "What unnamed feeling is moving through me right now?",
            waypointLens:
              "The cards here reveal pre-verbal emotional states — the felt sense before it crystallizes into something nameable. Encourage the seeker to stay with sensation rather than rushing to categorize. What does this feeling look like? What color, shape, or texture does it carry? The goal is not to explain but to describe.",
          },
          {
            name: "The Emotional Palette",
            description:
              "Just as an artist expands their palette over time, you are learning to distinguish subtler shades of feeling. Irritation is not anger. Wistfulness is not sadness. Precision matters.",
            suggestedIntention:
              "What subtle emotion have I been mislabeling or overlooking?",
            waypointLens:
              "Interpret with fine emotional granularity. Where the seeker says 'angry,' the cards may reveal frustration, indignation, or protective fury — each a different shade. Help the seeker see their emotional life in higher resolution. Name the specific emotion each card evokes, modeling the kind of precision that leads to emotional clarity.",
          },
          {
            name: "Weather Without Judgment",
            description:
              "We are taught that some emotions are good and others are bad. But weather is not moral — neither is feeling. This waypoint practices meeting every emotion as valid information.",
            suggestedIntention:
              "What emotion have I been judging as wrong or unacceptable?",
            waypointLens:
              "The cards may surface emotions the seeker has been suppressing, dismissing, or judging. Interpret without hierarchy — rage is not worse than peace, grief is not less worthy than joy. Model radical acceptance of the full emotional spectrum. Ask: what if this feeling were not a problem to solve but a message to receive?",
          },
          {
            name: "The Emotional Forecast",
            description:
              "Now that you can name what you feel, you begin to notice patterns — the emotional weather that tends to arrive at certain times, in certain contexts, with certain people.",
            suggestedIntention:
              "What emotional patterns keep recurring in my life, and what are they telling me?",
            waypointLens:
              "The cards reveal emotional patterns and cycles. Interpret with attention to repetition: what feelings keep showing up? Are there emotional seasons the seeker moves through predictably? The forecast is not about prediction but about recognizing the intelligence in recurring feelings. They are returning because they have not yet been fully received.",
          },
        ],
        obstacleCards: [
          {
            title: "The Numbness Veil",
            meaning:
              "Chronic disconnection from feeling — the protective shutdown that once served survival but now prevents the seeker from accessing their own emotional intelligence.",
            guidance:
              "Numbness is not the absence of emotion. It is emotion held so tightly it cannot move. Start small — notice one micro-feeling today. Even noticing the numbness is a feeling.",
            imagePrompt:
              "A figure wrapped in translucent gauze standing in a field of wildflowers, unable to feel the wind. Faint colors pulse beneath the wrapping where emotions press against the veil from inside.",
          },
        ],
      },

      // ── Retreat 2: The Trigger Map ─────────────────────────────────
      {
        name: "The Trigger Map",
        description:
          "Reactivity is not random. It follows a map — a network of old wounds, unmet needs, and conditioned responses. This retreat traces the lines between stimulus and emotional surge, revealing the architecture of your triggers.",
        theme: "Understanding emotional reactivity",
        retreatLens:
          "Every card in this retreat illuminates the architecture of reactivity. What sets the seeker off? What old wound does the trigger touch? Interpret through the lens of cause and response, but without blame — triggers are not character flaws. They are signals from the nervous system that something unresolved is asking for attention. Help the seeker see the intelligence in their reactivity rather than judging it.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Flashpoint",
            description:
              "There are certain words, tones, situations, or people that reliably ignite something fierce in you. This waypoint invites you to name your flashpoints honestly.",
            suggestedIntention:
              "What is my most reliable emotional trigger, and what does it protect?",
            waypointLens:
              "The cards reveal the seeker's primary trigger patterns. Interpret with curiosity rather than diagnosis. What specific situations activate a disproportionate response? The cards show not only the trigger but the original wound it touches. Help the seeker see the younger self who first learned this response.",
          },
          {
            name: "The Old Story",
            description:
              "Behind every trigger is a story — usually an old one. A moment when you learned that the world was unsafe in this particular way. The trigger is the story replaying itself.",
            suggestedIntention:
              "What old story is my trigger trying to replay?",
            waypointLens:
              "Interpret through narrative and memory. The cards may reveal formative experiences, family patterns, or early decisions about how the world works. The trigger is not the present situation — it is the past speaking through the present. Help the seeker distinguish between 'then' and 'now' with gentleness.",
          },
          {
            name: "The Space Between",
            description:
              "Between the trigger and the reaction, there is a space. It may be tiny — a fraction of a breath — but it is there. This waypoint practices finding and widening that space.",
            suggestedIntention:
              "What becomes possible when I pause between stimulus and response?",
            waypointLens:
              "The cards point to what lives in the gap between trigger and reaction. Interpret with attention to choice, agency, and the freedom that lives in the pause. What does the seeker discover when they do not immediately react? What wisdom is available in that fraction of a second?",
          },
          {
            name: "Rewiring the Response",
            description:
              "You cannot un-feel a trigger. But you can choose a different response. This waypoint explores what a conscious, chosen response looks like instead of an automatic one.",
            suggestedIntention:
              "What would my wisest self do in the moment I feel most triggered?",
            waypointLens:
              "The cards reveal the seeker's capacity for conscious response. Interpret with respect for the difficulty of this work — rewiring takes repetition and compassion. What new response is trying to emerge? What would the seeker's future self, looking back, wish they had done in the heat of the moment?",
          },
          {
            name: "The Trigger as Teacher",
            description:
              "What if your triggers were not enemies to defeat but teachers arriving in disguise? This waypoint reframes reactivity as a map leading you directly to your unfinished healing.",
            suggestedIntention:
              "What is my most painful trigger trying to teach me?",
            waypointLens:
              "The alchemical turn: the trigger becomes the teacher. Interpret each card as a lesson the seeker's reactivity is offering. What unmet need is the trigger pointing toward? What part of the self is still waiting to be witnessed? The cards here carry the message the trigger has been trying to deliver all along.",
          },
        ],
        obstacleCards: [
          {
            title: "The Blame Arrow",
            meaning:
              "Externalizing all reactivity — 'They made me feel this way.' The refusal to look inward because it is easier to point outward.",
            guidance:
              "Others may pull the trigger, but you loaded the gun long ago. Turning inward is not accepting blame — it is reclaiming power over your own experience.",
            imagePrompt:
              "A glowing arrow mid-flight, pointed outward from a figure's chest. But the arrow's shadow falls backward, revealing that its true origin is the archer's own heart. Warm amber light suffuses the scene.",
          },
          {
            title: "The Endless Replay",
            meaning:
              "Reliving the triggering event in an infinite loop — rehearsing the argument, replaying the scene, unable to let the moment complete itself and pass.",
            guidance:
              "The replay feels productive because it feels active. But circling is not the same as moving. Ask what the replay is trying to resolve, and address that directly.",
            imagePrompt:
              "A spiral staircase descending into itself, each step identical, lit by the same flickering candle reflected in infinite mirrors. At the center, a still pool of water offers a different reflection entirely.",
          },
        ],
      },

      // ── Retreat 3: Below the Surface ───────────────────────────────
      {
        name: "Below the Surface",
        description:
          "The emotion you feel first is rarely the deepest one. Beneath anger often hides fear. Under fear, grief. Below grief, love. This retreat dives beneath the surface emotion to discover what is really asking to be felt.",
        theme: "Discovering deeper emotions beneath reactive ones",
        retreatLens:
          "Every card in this retreat points beneath the obvious. If the surface emotion is anger, what is the card revealing underneath? If the seeker presents a 'fine' exterior, what churns below the waterline? Interpret in layers — each card may hold a surface meaning and a deeper one. Model the courage it takes to dive beneath comfortable feelings into the raw material underneath. This is archaeological work: careful, layered, revelatory.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Surface Current",
            description:
              "Before you can go deeper, name what is on the surface. What is the first, loudest emotion? Honor it — it is protecting something more tender underneath.",
            suggestedIntention:
              "What is the loudest emotion I am feeling, and what is it trying to protect?",
            waypointLens:
              "Start with the obvious. The cards reveal the seeker's surface-level emotional state — the feeling they can readily name. But interpret with an eye toward what this emotion is protecting. Surface anger might be guarding vulnerable hurt. Surface cheerfulness might be covering exhaustion. Name the surface with honoring, then hint at the depth.",
          },
          {
            name: "The Layer Beneath",
            description:
              "Peel back the first feeling and notice what is underneath. Anger often covers hurt. Anxiety often covers grief. Numbness often covers everything.",
            suggestedIntention:
              "What emotion is hiding beneath the one I show the world?",
            waypointLens:
              "The cards reveal what lies one layer down. Interpret with the understanding that emotions stack — the presenting feeling is real but not complete. Help the seeker see the relationship between layers. What is the emotion beneath trying to communicate? Why did it need to hide?",
          },
          {
            name: "The Core Feeling",
            description:
              "At the very bottom of the emotional well, there is usually something simple and raw: grief, longing, love, or the ache of being alive. This waypoint invites you to touch that bedrock.",
            suggestedIntention:
              "What is the core feeling beneath all my layers of protection?",
            waypointLens:
              "The deepest dive. The cards here point to the seeker's bedrock emotion — the one that all the layers above are built to protect. This is often surprisingly tender. Interpret with extreme gentleness. The core feeling may be very young, very simple, and very vulnerable. Meet it with the reverence it deserves.",
          },
          {
            name: "Integration of Depths",
            description:
              "Knowing what lies beneath changes everything. You can feel angry and know it is grief wearing armor. You can feel numb and know it is love too large to let in all at once.",
            suggestedIntention:
              "How does knowing my deeper feelings change how I relate to my surface emotions?",
            waypointLens:
              "The cards now speak to integration — holding surface and depth simultaneously. Interpret with a sense of expanded capacity. The seeker is not replacing surface emotions with deeper ones; they are learning to hold the full stack. How does this awareness change their relationship with reactivity? With vulnerability? With themselves?",
          },
        ],
        obstacleCards: [
          {
            title: "The Quick Fix",
            meaning:
              "Reaching for a solution before fully feeling the problem — positive affirmations plastered over unexplored grief, gratitude lists used to bypass genuine anger.",
            guidance:
              "The fix is not the feeling. Before you reach for a remedy, ask if you have truly let yourself feel what needs feeling. Healing that skips the wound is only a fresh coat of paint.",
            imagePrompt:
              "A cracked vase hastily glued together, its fractures barely hidden under bright paint. Through one gap, water seeps out in a thin silver stream that catches the light. Beside it, a bowl of gold kintsugi dust waits, untouched.",
          },
        ],
      },

      // ── Retreat 4: Emotional Alchemy ───────────────────────────────
      {
        name: "Emotional Alchemy",
        description:
          "The alchemists sought to turn lead into gold. The emotional alchemist does the same with feeling: transforming suffering into wisdom, anger into clarity, grief into fierce tenderness. This retreat teaches the art of transmutation.",
        theme: "Transforming difficult emotions into wisdom",
        retreatLens:
          "Every card in this retreat is a stage of the alchemical process — nigredo (blackening), albedo (whitening), citrinitas (yellowing), rubedo (reddening). The seeker is learning to work with difficult emotions as raw material, not waste. Interpret through the language of transformation: what is being burned away? What is being purified? What gold is emerging from the fire? The goal is not to eliminate difficult emotions but to transmute their energy into something life-giving.",
        estimatedReadings: 5,
        waypoints: [
          {
            name: "The Raw Material",
            description:
              "Alchemy begins with the prima materia — the unrefined substance. In emotional alchemy, this is the difficult feeling you would rather not have. It is the starting material, not the enemy.",
            suggestedIntention:
              "What difficult emotion is asking to be worked with, not discarded?",
            waypointLens:
              "The cards reveal the seeker's prima materia — the raw emotional substance that has been avoided or rejected. Interpret with respect for this material. It is not broken; it is unrefined. What quality does this emotion contain in its crude form that, once transmuted, becomes something precious?",
          },
          {
            name: "The Crucible of Feeling",
            description:
              "The crucible holds the material while it transforms. In emotional life, the crucible is your capacity to hold a feeling without acting on it, suppressing it, or letting it consume you.",
            suggestedIntention:
              "Can I hold this difficult feeling without needing to fix, flee, or fight it?",
            waypointLens:
              "The cards speak to containment and capacity. How large is the seeker's emotional crucible? Can they hold the fire without cracking? Interpret with attention to emotional endurance and the skill of simply being with what is painful. The alchemical vessel must be strong enough to hold the transformation.",
          },
          {
            name: "The Transmutation",
            description:
              "Heat, time, and attention: these are the alchemist's tools. When you hold anger with enough awareness, it reveals its core — a fierce love for something you refuse to lose. This is transmutation.",
            suggestedIntention:
              "What wisdom is emerging as I hold this feeling in the fire of my attention?",
            waypointLens:
              "The turning point. The cards show what the emotion becomes when it is fully felt and held. Anger becomes boundary-setting power. Grief becomes the depth of love. Fear becomes discernment. Interpret the transformation happening in real time — what gold is appearing in the crucible?",
          },
          {
            name: "The Gold",
            description:
              "Alchemical gold is not material wealth but the philosopher's stone — the capacity to turn any experience into wisdom. This waypoint discovers what your emotional fire has forged.",
            suggestedIntention:
              "What wisdom have I forged from my most difficult feelings?",
            waypointLens:
              "The cards reveal the product of the seeker's alchemy — the wisdom, strength, compassion, or clarity that has been distilled from suffering. Interpret with celebration of what has been created. This is not toxic positivity ('everything happens for a reason') but genuine alchemical achievement: gold forged from what was once unbearable.",
          },
          {
            name: "The Alchemist's Practice",
            description:
              "Alchemy is not a single event but a lifelong practice. This waypoint integrates the skill of emotional transmutation as an ongoing discipline — something you return to whenever the fire rises.",
            suggestedIntention:
              "How can I make emotional alchemy a daily practice rather than a crisis response?",
            waypointLens:
              "The cards speak to sustainable practice. How does the seeker continue this work when the retreat ends? Interpret with attention to daily application — the small, ordinary moments where emotional alchemy is needed most. Not the grand crises but the Tuesday afternoon frustrations, the Sunday night anxieties, the quiet grief of an ordinary day.",
          },
        ],
        obstacleCards: [
          {
            title: "The Spiritual Bypass",
            meaning:
              "Using spiritual language to skip the messy middle — 'transmuting' an emotion by renaming it without actually feeling it, performing alchemy without heat.",
            guidance:
              "You cannot turn lead to gold by calling lead 'gold.' The fire must be real. The feeling must be felt, not just reframed. True transmutation requires heat, not vocabulary.",
            imagePrompt:
              "A cold, unlit furnace with ornate golden labeling. Inside, raw ore sits untouched and unchanged. Beside it, a smaller furnace burns bright and hot, its contents genuinely glowing with transformation.",
          },
          {
            title: "The Addiction to Intensity",
            meaning:
              "Seeking out emotional extremes because they feel 'real' or 'alive' — confusing intensity with depth, drama with meaning.",
            guidance:
              "The quietest feelings often carry the most gold. If you are always reaching for fire, you may be avoiding the tender warmth that asks for nothing but your presence.",
            imagePrompt:
              "A roaring bonfire casting dramatic shadows on canyon walls, while nearby a small steady flame on a stone altar illuminates an ancient text with gentle, readable light. The bonfire burns everything it touches; the altar flame reveals.",
          },
        ],
      },

      // ── Retreat 5: The Feeling Body ────────────────────────────────
      {
        name: "The Feeling Body",
        description:
          "Emotions do not live only in the mind. They inhabit the body — the tight throat, the churning stomach, the heavy chest, the buzzing hands. This retreat maps the somatic geography of your emotional life.",
        theme: "Where emotions live in the body",
        retreatLens:
          "Every card in this retreat is read through the body. Not 'what does this card mean?' but 'where do I feel this card?' Interpret with attention to somatic experience — tension, warmth, contraction, expansion, pressure, tingling, heaviness, lightness. The body is the original emotional instrument, and the cards are tuning forks. Help the seeker reconnect with the physical dimension of their emotional life.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Body Map",
            description:
              "Close your eyes and scan from head to toe. Where is emotion stored right now? The clenched jaw, the held breath, the tight shoulders — each one is a message waiting to be read.",
            suggestedIntention:
              "Where in my body am I holding an emotion I have not yet acknowledged?",
            waypointLens:
              "The cards map the seeker's body. Each card position corresponds to a region of somatic experience. Interpret with specific body references — not abstract emotions but their physical signatures. Where does the throat tighten? Where does the belly soften? Guide the seeker to locate feeling in flesh and bone.",
          },
          {
            name: "The Language of Sensation",
            description:
              "The body speaks in sensation, not words. Pressure, heat, cold, tingling, heaviness, hollowness — this is the body's emotional vocabulary. This waypoint learns to translate it.",
            suggestedIntention:
              "What is my body trying to tell me through this specific sensation?",
            waypointLens:
              "Interpret through pure sensation rather than emotion-words. Instead of 'the card suggests sadness,' try 'the card points to a heaviness in the chest that wants to be breathed into.' Help the seeker translate between somatic experience and emotional meaning, building a bridge between body and awareness.",
          },
          {
            name: "Emotion in Motion",
            description:
              "Emotions are meant to move — the word itself comes from 'emovere,' to move through. When emotions get stuck in the body, they become tension, pain, or chronic holding patterns.",
            suggestedIntention:
              "What stuck emotion in my body is ready to move and be released?",
            waypointLens:
              "The cards reveal where emotion has become stagnant in the body. Interpret with attention to movement and release — shaking, crying, laughing, breathing, stretching. What wants to flow? What has been held still for too long? The body does not need to be fixed; it needs permission to move.",
          },
          {
            name: "The Wise Body",
            description:
              "Your body has been processing emotions since before you had words. It is older and wiser than your rational mind. This waypoint learns to trust the body's emotional intelligence.",
            suggestedIntention:
              "What does my body know about my emotional life that my mind has not yet accepted?",
            waypointLens:
              "The cards reveal the body's deeper wisdom — the knowing that precedes thought. Interpret with trust in somatic intelligence. The body often knows something is wrong before the mind does. It falls in love before the heart admits it. It grieves before the ego allows it. What is the seeker's body already processing that their conscious mind is still catching up to?",
          },
        ],
        obstacleCards: [
          {
            title: "The Disembodied Mind",
            meaning:
              "Living from the neck up — treating the body as a vehicle for the brain rather than an equal partner in emotional life. Chronic dissociation from somatic experience.",
            guidance:
              "You do not have a body. You are a body. Begin with one breath, one sensation, one moment of feeling your feet on the ground. The body has been waiting for you to come home.",
            imagePrompt:
              "A luminous head floating above a shadowy body outline, tethered by a single thin golden thread. The body below glows faintly with stored color — reds, blues, greens — waiting to be reclaimed. Roots extend from the body into rich earth.",
          },
        ],
      },

      // ── Retreat 6: Emotional Boundaries ────────────────────────────
      {
        name: "Emotional Boundaries",
        description:
          "Feeling deeply is a gift. Being overwhelmed by feeling is suffering. This retreat teaches the art of emotional boundaries — holding space for intense feelings without drowning in them, and protecting your inner weather from others' storms.",
        theme: "Holding space without being overwhelmed",
        retreatLens:
          "Every card in this retreat speaks to the relationship between openness and protection. Emotional boundaries are not walls — they are membranes that allow feeling to flow while maintaining the seeker's integrity. Interpret through the lens of capacity, containment, and healthy limits. Where does the seeker absorb others' emotions? Where do they lose themselves in their own? The cards guide toward the middle path between numbness and flooding.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Sponge",
            description:
              "Some of us absorb everything — other people's moods, the energy of a room, the suffering in the news. This waypoint names the pattern of emotional porosity and its costs.",
            suggestedIntention:
              "Whose emotions am I carrying that are not mine to carry?",
            waypointLens:
              "The cards reveal where the seeker is absorbing emotional material that does not belong to them. Interpret with clarity about ownership — which feelings in the spread are the seeker's own, and which have been taken on from family, friends, culture, or collective suffering? Emotional empathy without boundaries becomes emotional drowning.",
          },
          {
            name: "The Membrane",
            description:
              "A healthy boundary is not a wall. It is a membrane — permeable, intelligent, responsive. It lets in what nourishes and keeps out what depletes. This waypoint imagines what a wise emotional membrane looks like for you.",
            suggestedIntention:
              "What would a healthy emotional boundary look like in the relationship that drains me most?",
            waypointLens:
              "The cards reveal the seeker's boundary style — where they are too porous, where they are too rigid, and where they have found healthy permeability. Interpret with specificity: not just 'set better boundaries' but what kind of boundary, with whom, around what feeling. The membrane is intelligent; it can differentiate.",
          },
          {
            name: "Holding Space",
            description:
              "To hold space for another's pain without trying to fix it, absorb it, or run from it — this is one of the deepest emotional skills. It requires a container that is both strong and soft.",
            suggestedIntention:
              "How can I be present with others' suffering without losing myself in it?",
            waypointLens:
              "The cards speak to the seeker's capacity to witness without merging. Interpret through the metaphor of the container — a vessel large enough to hold another's pain without cracking. What strengthens the seeker's container? What weakens it? Where do they confuse compassion with co-suffering?",
          },
          {
            name: "The Return to Self",
            description:
              "After holding space for others, after feeling the full weight of your own emotions, there must be a return. Coming back to center. Remembering who you are when the storms pass.",
            suggestedIntention:
              "What practice or place helps me return to myself after emotional intensity?",
            waypointLens:
              "The cards reveal the seeker's restorative practices — the people, places, rituals, and rhythms that bring them back to center. Interpret with attention to self-care that is genuine rather than performative. What actually restores the seeker? Not what 'should' help but what truly does.",
          },
        ],
        obstacleCards: [
          {
            title: "The Martyr's Gift",
            meaning:
              "Believing that absorbing others' pain is a form of love — that boundary-setting is selfish, and self-sacrifice is the highest form of care.",
            guidance:
              "A gift given from depletion is not generosity; it is self-abandonment wearing a noble mask. You cannot pour from a shattered vessel. Repair yourself first.",
            imagePrompt:
              "A figure offering their own glowing heart outward to shadowy hands reaching from all directions. The figure's chest is hollow and dark where the heart was. A second heart, small and growing, pulses faintly in the figure's cupped other hand, unnoticed.",
          },
          {
            title: "The Iron Wall",
            meaning:
              "Overcorrecting from emotional flooding by shutting down entirely — walls so thick that nothing gets in, including love, joy, and connection.",
            guidance:
              "Walls built from old pain keep out more than they protect. The question is not 'how do I feel nothing?' but 'how do I feel safely?' Start with one person, one feeling, one crack in the iron.",
            imagePrompt:
              "An imposing iron wall curving around a barren courtyard. On the other side, visible through a single rust hole, a garden blooms in vivid color. Morning light pools at the base of the wall, warming the metal.",
          },
        ],
      },

      // ── Retreat 7: Emotional Fluency ───────────────────────────────
      {
        name: "Emotional Fluency",
        description:
          "The summit of emotional intelligence is fluency — the ability to move between feeling states with grace, to hold complexity, and to let emotions arise and pass without clinging or resistance. This retreat integrates everything the trail has taught.",
        theme: "Integration and fluid emotional movement",
        retreatLens:
          "This culminating retreat interprets every card through the lens of integration and flow. The seeker has named their emotions, mapped their triggers, explored their depths, transmuted their fire, found feelings in the body, and set healthy boundaries. Now the cards speak to the whole — emotional life as a living, breathing, constantly shifting landscape that the seeker can navigate with wisdom, humor, and grace. Reference the seeker's earlier work wherever Cards Remember provides context.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Full Spectrum",
            description:
              "You are no longer afraid of any feeling. Joy, rage, grief, ecstasy, boredom, terror, tenderness — you have room for all of them. This waypoint celebrates the full spectrum.",
            suggestedIntention:
              "Which feeling am I now able to welcome that once frightened me?",
            waypointLens:
              "The cards celebrate expanded emotional capacity. Interpret with a sense of range and richness. The seeker is not someone who has transcended difficult emotions but someone who can hold more — more pain, more joy, more complexity. The full spectrum is not a burden but a superpower.",
          },
          {
            name: "Emotional Agility",
            description:
              "Fluency means movement. You can shift from grief to gratitude, from frustration to curiosity, not by suppressing one but by letting it complete itself and making space for the next.",
            suggestedIntention:
              "Where am I stuck in one emotional state, and what would help me flow again?",
            waypointLens:
              "The cards reveal where the seeker is stuck and what would help them move. Interpret with attention to transitions — the micro-moments between one feeling and the next. Emotional agility is not about controlling feelings but about not getting trapped in any single one. What wants to move? What wants to arrive?",
          },
          {
            name: "Complexity as Home",
            description:
              "In emotional fluency, you can hold contradictions: grieving and grateful, furious and loving, afraid and brave, all at once. Complexity is not confusion — it is maturity.",
            suggestedIntention:
              "What seemingly contradictory emotions can I hold simultaneously right now?",
            waypointLens:
              "The cards reveal the seeker's capacity for emotional paradox. Interpret with comfort in contradiction — two cards that seem to oppose each other may both be true simultaneously. This is the mark of emotional maturity: holding grief and joy in the same hand without needing to resolve them into a single feeling.",
          },
          {
            name: "The Living Landscape",
            description:
              "Your emotional landscape is alive — always shifting, always changing, always offering new weather. This final waypoint honors the landscape itself as sacred terrain that will continue to teach you long after this retreat ends.",
            suggestedIntention:
              "What does my emotional landscape look like now, and what terrain lies ahead?",
            waypointLens:
              "The culmination of the Emotional Landscape path. The cards reflect where the seeker stands in their emotional terrain — not as a fixed point but as a living vista. Interpret with celebration of the walk taken and curiosity about the walk ahead. The landscape is never fully mapped. That is what makes it alive.",
          },
        ],
        obstacleCards: [
          {
            title: "The Emotional Perfectionist",
            meaning:
              "Believing that true emotional intelligence means never being reactive, never being messy, never being caught off guard — turning fluency into another performance standard.",
            guidance:
              "Fluency includes stumbling. A fluent speaker still trips over words sometimes. The difference is that they do not stop talking. Feel messily. Feel imperfectly. That is the practice.",
            imagePrompt:
              "A dancer mid-stumble on a moonlit stage, one foot caught in fabric. But the stumble itself has become part of the dance — the audience leans forward, transfixed. The dancer's expression holds both surprise and grace.",
          },
        ],
      },
    ],
  },

  // ── Path 2: The Dream Weaver ────────────────────────────────────────
  {
    name: "The Dream Weaver",
    description:
      "Descend into the realm of symbol, myth, and active imagination. Learn to read the language of the unconscious — in your dreams, your oracle cards, and the recurring images that thread through your life.",
    themes: [
      "dreams",
      "symbols",
      "unconscious",
      "imagination",
      "myth",
      "archetypal images",
      "vision",
    ],
    symbolicVocabulary: [
      "dream",
      "vision",
      "symbol",
      "myth",
      "image",
      "thread",
      "weaving",
      "tapestry",
      "mirror",
      "reflection",
      "labyrinth",
      "depth",
      "surface",
      "memory",
      "story",
    ],
    interpretiveLens:
      "Every card is a symbol from the unconscious, speaking the language of dream and myth. Do not reduce symbols to single meanings — hold them open, let them shimmer with multiplicity. The cards are not illustrations of the seeker's life; they are portals into the imaginal realm where personal experience and universal myth intertwine. Draw on the traditions of active imagination, dream amplification, and narrative psychology. Help the seeker see their life as a living myth being woven in real time.",
    iconKey: "moon",
    retreats: [
      // ── Retreat 1: The Language of Symbols ─────────────────────────
      {
        name: "The Language of Symbols",
        description:
          "Symbols are the mother tongue of the unconscious. Before words, before concepts, there were images — charged with meaning, layered with association, alive with numinous power. This retreat teaches you to read them.",
        theme: "Learning to read symbolic language",
        retreatLens:
          "Every card in this retreat is a lesson in symbolic literacy. Do not translate symbols into concepts too quickly — let them breathe. A snake is not 'transformation.' A snake is a snake: scaled, coiled, shedding, venomous, healing, cold-blooded, earth-dwelling. All of that and more. Interpret with symbolic richness, offering multiple possible meanings rather than definitive ones. Teach the seeker to sit with ambiguity and let the symbol speak on its own terms.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The First Image",
            description:
              "Before analysis, before interpretation — what is the first image that strikes you? The unconscious speaks through that initial flash of recognition. This waypoint practices pure seeing.",
            suggestedIntention:
              "What image has been appearing in my mind, my dreams, or my life that I have not yet paid attention to?",
            waypointLens:
              "Focus on pure image and first impression. Before meaning, there is the image itself. What does the seeker see first in the cards? What catches their eye before the rational mind begins to interpret? The first image is often the most important. Encourage the seeker to describe what they see before they explain what it means.",
          },
          {
            name: "Layers of Meaning",
            description:
              "A symbol is never one thing. It is a node in a web of associations — personal, cultural, archetypal. This waypoint explores the layered nature of symbolic language.",
            suggestedIntention:
              "What does this recurring symbol in my life mean at the personal, cultural, and universal levels?",
            waypointLens:
              "Interpret each card at multiple levels. The personal level: what does this symbol mean in the seeker's specific life? The cultural level: what does their culture or family associate with this image? The universal level: what does this symbol mean across human mythology? Model layered interpretation that enriches rather than reduces.",
          },
          {
            name: "The Living Symbol",
            description:
              "Symbols are not static. They evolve as you do. A symbol that meant one thing at twenty may mean something entirely different at forty. This waypoint meets your symbols as living entities.",
            suggestedIntention:
              "How has a symbol that is important to me changed its meaning over time?",
            waypointLens:
              "The cards reveal symbols in motion — changing, evolving, deepening. Interpret with attention to how the seeker's relationship with key images has shifted. What did the cards mean to them last year? What do they mean now? Symbols are alive; they grow alongside the seeker.",
          },
          {
            name: "Your Symbolic Vocabulary",
            description:
              "Every person has a private symbolic language — images that carry unique charge and resonance. This waypoint identifies the seeker's personal symbol system.",
            suggestedIntention:
              "What are the three or four symbols that form the core of my personal mythic language?",
            waypointLens:
              "The cards reveal the seeker's personal symbolic lexicon. Interpret with curiosity about recurring images, motifs, and themes in the seeker's life. What images keep appearing in their readings? What symbols feel 'theirs'? Help the seeker recognize the vocabulary their unconscious uses to communicate with them.",
          },
        ],
        obstacleCards: [
          {
            title: "The Dictionary Mind",
            meaning:
              "Reducing every symbol to a single fixed meaning — looking up 'snake' in a dream dictionary instead of sitting with what the snake means to you.",
            guidance:
              "Burn the dictionary. A symbol that means only one thing is dead. Let the image be strange, contradictory, and unexpectedly alive. Ask it what it wants, rather than telling it what it is.",
            imagePrompt:
              "An enormous leather-bound book falling open, its pages dissolving into butterflies of different colors. Each butterfly carries a fragment of text that rearranges into new patterns in the air. The book's spine remains intact but empty.",
          },
        ],
      },

      // ── Retreat 2: Dream Doorways ──────────────────────────────────
      {
        name: "Dream Doorways",
        description:
          "The doorway between waking and dreaming is a portal to the imaginal realm. This retreat teaches the art of active imagination — consciously entering the dreamlike state where symbols come alive and speak.",
        theme: "Active imagination and dreamwork",
        retreatLens:
          "Every card in this retreat is a doorway into the imaginal realm. Interpret not as analysis but as invitation — enter the image, walk through the door, follow the symbol. The tone should be hypnagogic: slightly dreamy, slightly numinous, as if the boundary between waking and sleeping has grown thin. Help the seeker practice active imagination with the cards as starting points for inner vision.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Threshold of Sleep",
            description:
              "Between waking and sleeping is the hypnagogic zone — a place of vivid imagery, fluid logic, and creative revelation. This waypoint practices lingering at that threshold.",
            suggestedIntention:
              "What images appear when I stand at the edge between waking and dreaming?",
            waypointLens:
              "The cards evoke the hypnagogic state — interpret with dream logic rather than waking logic. Images may be surreal, contradictory, or strangely beautiful. Do not force coherence. Let the interpretation flow with the associative, fluid quality of pre-sleep consciousness. What does the seeker see when they let their focus soften?",
          },
          {
            name: "Entering the Image",
            description:
              "Active imagination begins when you step into the picture. Not observing the dream from outside but becoming a participant. This waypoint practices crossing from observer to inhabitant.",
            suggestedIntention:
              "If I stepped into the image on this card, what would I discover?",
            waypointLens:
              "Interpret as if the seeker has literally entered the card. What do they see? What do they hear? Who or what do they encounter? Shift from third-person analysis to second-person immersion: 'You step through the gate and find...' The goal is to activate the seeker's own imaginal capacity, not to explain but to evoke.",
          },
          {
            name: "Dialogue with the Image",
            description:
              "The figures and symbols in your inner world have things to say. Active imagination invites you to speak with them — to ask questions and listen for answers that surprise you.",
            suggestedIntention:
              "If I could ask the central figure in this card one question, what would it answer?",
            waypointLens:
              "The cards are speaking. Interpret by giving voice to the symbols — let the dragon, the tower, the river, the stranger actually speak. What do they say to the seeker? What do they ask for? Model the dialogic quality of active imagination where the unconscious responds in its own surprising voice.",
          },
          {
            name: "Bringing Dreams Back",
            description:
              "The visions of the imaginal realm must be brought back into waking life — recorded, honored, and integrated. A dream forgotten is a letter from the self left unopened.",
            suggestedIntention:
              "What message from my dream life or inner vision wants to be integrated into my waking world?",
            waypointLens:
              "The cards bridge inner and outer. Interpret with attention to how the seeker can honor their imaginal experiences in practical ways — through art, writing, ritual, or changed behavior. What did the dream or vision reveal that changes how the seeker acts when awake? The imaginal is not escapism; it is reconnaissance.",
          },
        ],
        obstacleCards: [
          {
            title: "The Literalist",
            meaning:
              "Taking dream images at face value — dreaming of death and fearing literal death, dreaming of flying and expecting literal flight. The refusal to think symbolically.",
            guidance:
              "The dream is never about what it appears to be about. Death in a dream is transformation. Flight is liberation. Water is emotion. Let the image speak its own language, not yours.",
            imagePrompt:
              "A figure standing before a vast painting, seeing only the surface brushstrokes and missing the entire composition. Behind them, the painting's true image — an intricate mythology — is visible from any other angle. A gentle light suggests stepping back.",
          },
          {
            title: "The Runaway Imagination",
            meaning:
              "Losing yourself in fantasy without grounding — the imaginal realm becomes an escape from reality rather than a deepening of it.",
            guidance:
              "Active imagination has a return ticket. If you find yourself preferring the inner world to the outer one, it is time to bring your vision into embodied action. Ground it in clay, in ink, in conversation.",
            imagePrompt:
              "A labyrinth of shimmering doorways, each opening into another fantasy world. At the center, a single wooden door leads back to a sunlit kitchen with bread rising and a chair waiting. The wooden door glows with a warm, ordinary light.",
          },
        ],
      },

      // ── Retreat 3: The Personal Myth ───────────────────────────────
      {
        name: "The Personal Myth",
        description:
          "Your life is not a random sequence of events. Beneath the surface, a mythic narrative is unfolding — a story with themes, turning points, and a protagonist who is becoming someone. This retreat discovers the myth your life is telling.",
        theme: "Discovering your life's mythic narrative",
        retreatLens:
          "Every card in this retreat reflects the seeker's personal myth — the deep narrative structure of their life. Interpret through the lens of story: who is the protagonist? What is the central quest? Where in the story are we now — the departure, the ordeal, the transformation? Draw on Joseph Campbell, Carol Pearson, and narrative therapy. The goal is not to impose a story but to help the seeker recognize the one that is already being told through their life.",
        estimatedReadings: 5,
        waypoints: [
          {
            name: "The Story So Far",
            description:
              "If your life were a myth, where would you be in the story right now? The opening? The middle trial? The climax? This waypoint asks you to locate yourself in your own narrative.",
            suggestedIntention:
              "What chapter of my life's story am I in right now?",
            waypointLens:
              "The cards reveal narrative position — where the seeker stands in their personal myth. Interpret with attention to story structure: is this a beginning, a turning point, a climax, or a denouement? What has just happened? What is about to happen? Help the seeker feel the momentum and direction of their own life story.",
          },
          {
            name: "The Recurring Theme",
            description:
              "Every myth has themes that repeat with variations — like a musical motif. Your life has them too. This waypoint identifies the themes that keep appearing in your story.",
            suggestedIntention:
              "What theme keeps recurring in my life, appearing in different costumes?",
            waypointLens:
              "The cards reveal the seeker's recurring mythic themes. Interpret by looking for patterns across the spread that mirror patterns in the seeker's life. What situation keeps arising in new forms? What lesson keeps presenting itself? The recurring theme is not a problem to solve but a thread to follow — it leads to the heart of the myth.",
          },
          {
            name: "The Central Quest",
            description:
              "Every hero has a quest — the thing they are seeking, whether they know it or not. This waypoint names your quest: not the surface goals but the deep longing that drives everything.",
            suggestedIntention:
              "What is the quest at the heart of my life, the one I may not have named until now?",
            waypointLens:
              "The cards reveal the seeker's deepest quest. Interpret by looking beneath surface desires (career, relationship, health) to the mythic longing underneath. The quest for wholeness, for belonging, for meaning, for love, for truth. Name the quest with the gravity it deserves — this is what the seeker's life is organized around, whether consciously or not.",
          },
          {
            name: "The Mythic Wound",
            description:
              "Every hero carries a wound that is also a gift. Chiron, the wounded healer. The Fisher King. The wound that will not heal but transforms the one who carries it. What is yours?",
            suggestedIntention:
              "What wound in my life has shaped me most, and what gift does it carry?",
            waypointLens:
              "The cards reveal the seeker's mythic wound — not in clinical terms but in story terms. This is the wound the protagonist carries throughout the tale, the one that makes them who they are. Interpret with the understanding that the wound is inseparable from the gift. Without this wound, the seeker would not be the person capable of their particular quest.",
          },
          {
            name: "The Myth Ahead",
            description:
              "Your personal myth is not finished. It is still being written. This waypoint turns from the past to the future — sensing what the next chapter holds, what the story is becoming.",
            suggestedIntention:
              "What is my personal myth becoming? What is the next chapter?",
            waypointLens:
              "The cards speak to the unwritten future of the seeker's myth. Interpret with narrative possibility — not prediction, but the sense of where the story is leaning. What archetype is the seeker growing into? What challenge is forming on the horizon? What transformation does the myth require next? Read with hope and gravity.",
          },
        ],
        obstacleCards: [
          {
            title: "The Fixed Script",
            meaning:
              "Clinging to an old version of your story — 'I am the one who was abandoned' or 'I am the one who always fails' — refusing to let the myth evolve.",
            guidance:
              "The story you tell about yourself becomes the life you live. If the old script no longer fits, it is not betrayal to rewrite it — it is growth. The myth is alive. Let it change.",
            imagePrompt:
              "An ancient scroll pinned to a stone wall, its text faded and crumbling. Beside it, a fresh scroll unfurls in the wind, blank and luminous, waiting. A quill floats between them, glowing at the nib.",
          },
        ],
      },

      // ── Retreat 4: Shadow Stories ──────────────────────────────────
      {
        name: "Shadow Stories",
        description:
          "The unconscious does not just hold single images — it holds entire narratives. Shadow stories are the scripts you did not choose, running beneath your conscious life: 'I am not enough,' 'The world is dangerous,' 'Love always leaves.' This retreat makes them visible.",
        theme: "Unconscious narratives and hidden scripts",
        retreatLens:
          "Every card in this retreat reveals an unconscious narrative — a story the seeker is living without choosing it. Interpret by listening for the script beneath the script. What story is the seeker's unconscious telling about who they are, what the world is like, and what is possible? These shadow stories are not enemies to destroy but narratives to become conscious of. Once seen, they can be held, questioned, and eventually rewritten.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Invisible Script",
            description:
              "There is a script running beneath your choices, your relationships, and your self-talk. You did not write it — it was written for you, by experience, by family, by culture. This waypoint makes it visible.",
            suggestedIntention:
              "What unconscious story is shaping my life that I have never consciously chosen?",
            waypointLens:
              "The cards reveal hidden scripts. Interpret by looking for narratives embedded in the card combinations — not just single meanings but the story the spread is telling. What role has the seeker been assigned in their unconscious drama? Victim? Rescuer? The one who must earn love? The one who is never enough? Name the script with compassion — it was written by a younger self for survival.",
          },
          {
            name: "The Author of the Story",
            description:
              "Who wrote this script? A parent's voice. A teacher's dismissal. A heartbreak that became a worldview. This waypoint traces the shadow story back to its origin.",
            suggestedIntention:
              "Who or what originally authored the shadow story I have been living?",
            waypointLens:
              "The cards reveal the origin of the seeker's shadow story. Interpret with attention to formative voices, early experiences, and the moment when the script was first written. This is not about blaming the author but about understanding the context. A script written by a frightened child made perfect sense then. The question is whether it still serves now.",
          },
          {
            name: "The Cost of the Script",
            description:
              "Every shadow story exacts a price. The script that says 'I must be perfect' costs spontaneity. The script that says 'I will be abandoned' costs intimacy. What has your shadow story cost you?",
            suggestedIntention:
              "What has my shadow story cost me in my life, my relationships, and my freedom?",
            waypointLens:
              "The cards reveal the toll of the unconscious script. Interpret with honest reckoning — what opportunities, relationships, and experiences has the seeker missed because of a story they did not choose? This is not about guilt but about clarity. The cost must be seen clearly before the seeker can choose differently.",
          },
          {
            name: "Rewriting the Myth",
            description:
              "You cannot un-write a shadow story. But you can become its conscious author — acknowledging the old script, honoring its purpose, and choosing a new narrative that serves who you are becoming.",
            suggestedIntention:
              "What new story am I ready to write, and what old one am I ready to release?",
            waypointLens:
              "The cards reveal the new narrative emerging. Interpret with attention to agency and authorship — the seeker is no longer a character in someone else's story but the author of their own. What new script is forming? What does it feel like to choose the story rather than be chosen by it? Let the reading feel like a writing desk appearing in the darkness.",
          },
        ],
        obstacleCards: [
          {
            title: "The Comfort of Victimhood",
            meaning:
              "The shadow story of being acted upon — finding a strange safety in powerlessness because taking authorship means accepting the terrifying freedom to change.",
            guidance:
              "Victimhood is a valid response to genuine harm. But when it becomes the whole story, it robs you of the most important plot twist: the moment you reclaim the pen.",
            imagePrompt:
              "A figure sitting in a dimly lit room, surrounded by pages of someone else's handwriting fluttering around them. In their lap, a pen glows quietly, unused. One page on the floor is blank, catching the light.",
          },
          {
            title: "The Revision Trap",
            meaning:
              "Endlessly rewriting the story without ever living it — perfectionism disguised as narrative therapy, using insight as a substitute for action.",
            guidance:
              "At some point, you must put down the pen and step into the story. It does not need to be perfect. It needs to be lived. Write the next line with your feet, not your mind.",
            imagePrompt:
              "A desk overflowing with crumpled manuscripts, each one a different draft of the same story. Through an open window, a road stretches into a sunrise. The wind turns a blank page toward the light.",
          },
        ],
      },

      // ── Retreat 5: The Ancestor Thread ─────────────────────────────
      {
        name: "The Ancestor Thread",
        description:
          "You are not the first to walk this path. Behind you stretches a lineage of dreamers, survivors, wounded healers, and storytellers. This retreat follows the thread backward — into inherited patterns, family mythology, and the gifts your ancestors left woven into your bones.",
        theme: "Inherited patterns and family mythology",
        retreatLens:
          "Every card in this retreat speaks from the ancestral field. Interpret with attention to inheritance — what patterns, gifts, wounds, and stories have been passed down through the seeker's family line? This is not about genealogy but about the mythic dimension of lineage. What does the seeker carry that is not personally theirs but ancestrally transmitted? Draw on transgenerational psychology, ancestral healing traditions, and the understanding that we are nodes in a much longer story.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Inherited Pattern",
            description:
              "Some of what you carry was never yours to begin with. Patterns of anxiety, self-sacrifice, silence, or intensity that predate your birth. This waypoint names the inherited thread.",
            suggestedIntention:
              "What pattern in my life did I inherit from my family line?",
            waypointLens:
              "The cards reveal transgenerational patterns. Interpret by looking for echoes of the seeker's family in the spread — behaviors, fears, or strengths that seem larger or older than the seeker's own experience. What has been passed down? What was the original context for this pattern? Help the seeker see the thread that connects them to their lineage.",
          },
          {
            name: "The Family Myth",
            description:
              "Every family has a mythology — spoken and unspoken stories about who they are, what they value, and what is forbidden. 'We are strong.' 'We do not show weakness.' 'We sacrifice for others.' What is your family's myth?",
            suggestedIntention:
              "What is the central myth of my family, and how has it shaped me?",
            waypointLens:
              "The cards reveal the seeker's family mythology. Interpret by looking for collective narratives — stories that the whole family tells, or that no one tells but everyone acts out. What is the family's heroic self-image? What is the family's shadow? How has the seeker been shaped by this mythic container, and where are they beginning to write their own story?",
          },
          {
            name: "The Ancestral Gift",
            description:
              "Your ancestors did not only leave you burdens. They left gifts — resilience, intuition, creativity, fierceness, faith. This waypoint receives what was given in love across the generations.",
            suggestedIntention:
              "What ancestral gift am I carrying that I have not fully claimed?",
            waypointLens:
              "The cards reveal inherited strengths and gifts. Interpret with gratitude and specificity — not generic 'ancestral wisdom' but the particular gifts this lineage carries. A grandmother's stubborn faith. A great-uncle's ability to find humor in darkness. The seeker carries these gifts in their blood. What is ready to be claimed and used?",
          },
          {
            name: "The Thread Forward",
            description:
              "You are both heir and ancestor. What you heal, you heal for those who came before and those who come after. This waypoint considers what you are weaving into the thread for future generations.",
            suggestedIntention:
              "What am I healing or creating that will become my gift to those who come after me?",
            waypointLens:
              "The cards reveal the seeker's role as ancestor-in-the-making. Interpret with a sense of legacy and forward inheritance. What pattern is the seeker breaking? What gift are they amplifying? What new thread are they weaving into the family tapestry? The seeker is not only receiving the past but creating the future.",
          },
        ],
        obstacleCards: [
          {
            title: "The Loyalty Bind",
            meaning:
              "Unconscious loyalty to family patterns that cause suffering — the belief that healing yourself means betraying your lineage, that growing beyond your family is abandonment.",
            guidance:
              "Healing the pattern does not dishonor the ancestors who carried it. They carried it because they could not put it down. You can. That is not betrayal — it is completion.",
            imagePrompt:
              "A golden chain connecting a figure to a long line of shadowy ancestors stretching into the distance. The figure holds a key that would unlock their link. The ancestors behind them lean forward, not pulling back but gently nodding. The chain glows warmest at the unlocking point.",
          },
        ],
      },

      // ── Retreat 6: Vision Weaving ──────────────────────────────────
      {
        name: "Vision Weaving",
        description:
          "Having learned to read the unconscious, you now learn to write to it. Vision weaving is the art of consciously creating new symbols, new narratives, and new mythic structures — co-authoring your inner world rather than merely interpreting it.",
        theme: "Consciously creating new symbols and narratives",
        retreatLens:
          "Every card in this retreat is raw material for conscious creation. The seeker is no longer only reading symbols — they are making them. Interpret through the lens of creative agency: what new symbol is the seeker being called to birth? What narrative wants to be woven? The cards are collaborators in the act of mythmaking, offering threads the seeker can weave into a vision of their own design. This is not escapist fantasy but intentional world-building at the level of the psyche.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Blank Loom",
            description:
              "Before the new tapestry can be woven, the loom must be prepared — cleared of old threads, cleaned, and strung with intention. This waypoint prepares the creative space.",
            suggestedIntention:
              "What must I clear or release to make space for a new vision?",
            waypointLens:
              "The cards reveal what needs to be cleared before the new can be woven. Interpret with attention to creative space — old narratives that must be laid aside, stale symbols that have lost their charge, assumptions that block new vision. The blank loom is not empty; it is ready.",
          },
          {
            name: "Choosing the Threads",
            description:
              "You are selecting the symbols, images, and stories that will form your new inner tapestry. Not randomly, but with the precision of an artist choosing colors. What belongs in the new weaving?",
            suggestedIntention:
              "What symbols, images, or stories do I want to weave into my new mythic vocabulary?",
            waypointLens:
              "The cards offer threads for the seeker's choosing. Interpret with creative invitation — each card presents a symbol or story that could become part of the seeker's new personal mythology. Which ones resonate? Which feel charged? The seeker is building a symbolic toolkit for the life they want to live.",
          },
          {
            name: "The Weaving",
            description:
              "Now the threads come together — old and new, personal and archetypal, inherited and chosen. The weaving is the act of creating a coherent inner world from the raw material of symbol and story.",
            suggestedIntention:
              "How are the old and new threads of my story coming together into a new pattern?",
            waypointLens:
              "The cards reveal the emerging pattern. Interpret with attention to synthesis — how are the seeker's chosen symbols combining with their inherited ones? What new picture is forming? The weaving is not replacing the old tapestry but incorporating it into something larger and more conscious.",
          },
          {
            name: "The Vision Made Real",
            description:
              "A vision that stays in the imaginal realm is a fantasy. A vision brought into the world through action, art, and embodiment becomes real. This waypoint bridges inner vision and outer expression.",
            suggestedIntention:
              "How can I bring my new inner vision into concrete expression in my life?",
            waypointLens:
              "The cards bridge imaginal and practical. Interpret with attention to manifestation — not magical thinking but the concrete steps by which an inner vision becomes an outer reality. What art wants to be made? What conversation wants to be had? What decision is the vision asking the seeker to make? The tapestry must be hung in the world, not just in the mind.",
          },
        ],
        obstacleCards: [
          {
            title: "The Stolen Thread",
            meaning:
              "Adopting someone else's mythology wholesale — borrowing spiritual aesthetics, cultural symbols, or another person's visionary language without doing the inner work to make it genuinely yours.",
            guidance:
              "Inspiration is a gift; imitation is a shortcut. Your own symbols may be humbler than the ones you admire, but they carry the charge of lived experience. Weave from your own thread.",
            imagePrompt:
              "A tapestry woven from brilliantly colored but mismatched threads, beautiful from a distance but unraveling at every join. Beside it, a smaller tapestry woven from homespun thread holds together perfectly, its pattern simple but deeply coherent.",
          },
        ],
      },

      // ── Retreat 7: Living Mythology ────────────────────────────────
      {
        name: "Living Mythology",
        description:
          "The final retreat brings the mythic dimension fully into daily life. You are no longer someone who reads about myths — you are someone living one. Every morning is a departure, every night a descent, every act of love a sacred marriage.",
        theme: "Embodying personal myth in daily life",
        retreatLens:
          "This culminating retreat interprets every card as an element of the seeker's lived mythology. The separation between 'real life' and 'mythic life' dissolves. The grocery store is the labyrinth. The morning commute is the hero's road. The difficult colleague is the threshold guardian. Interpret with this double vision that sees the mythic in the mundane, the sacred in the ordinary. Reference the seeker's earlier work on this path wherever Cards Remember provides context.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "Myth in the Mundane",
            description:
              "The mythic is not reserved for extraordinary moments. It is here — in the kitchen, the traffic jam, the sleepless night with a sick child. This waypoint practices seeing the ordinary through mythic eyes.",
            suggestedIntention:
              "What mythic pattern is playing out in the most ordinary part of my life right now?",
            waypointLens:
              "The cards reveal myth in the everyday. Interpret by translating the seeker's daily life into mythic terms — not to inflate the mundane but to reveal the depth that was always there. What archetype is present in their morning routine? What mythic trial does their work week contain? The goal is not to escape ordinary life but to see it for the sacred story it already is.",
          },
          {
            name: "The Mythic Self",
            description:
              "Who are you in the myth? Not a role you perform but the mythic dimension of who you already are. The healer. The trickster. The wanderer. The weaver. This waypoint names your mythic identity.",
            suggestedIntention:
              "What is my mythic identity — the archetypal self that moves through all my life's chapters?",
            waypointLens:
              "The cards reveal the seeker's mythic self — the archetypal identity that persists through all the changes and chapters of their life. Interpret with the gravity and beauty this self deserves. This is not a costume but a recognition. Who has the seeker always been, beneath the changing roles and circumstances?",
          },
          {
            name: "The Living Oracle",
            description:
              "When you are living mythically, you become your own oracle. The cards confirm what you already sense. The symbols mirror what you already know. The oracle is not outside you — it speaks through you.",
            suggestedIntention:
              "What truth am I already sensing that the cards are simply confirming?",
            waypointLens:
              "The cards mirror the seeker's own knowing. Interpret with the understanding that the seeker already knows the answer — the cards are validation, not revelation. Model the shift from 'the cards tell me' to 'I already knew, and the cards remind me.' This is the emergence of the seeker's inner oracle voice.",
          },
          {
            name: "The Story Continues",
            description:
              "A living myth does not end. It deepens, spirals, and reveals new layers. This final waypoint honors the ongoing nature of the seeker's mythic life — the story that continues beyond any retreat or reading.",
            suggestedIntention:
              "What is the next spiral of my living myth, and what is it asking of me?",
            waypointLens:
              "The culmination of the Dream Weaver path. The cards do not offer a conclusion but a continuation — the next spiral of the seeker's ever-deepening myth. Interpret with openness to what comes next, honoring everything the seeker has woven while acknowledging that the tapestry is never complete. The living myth is a gift the seeker carries forward into every future reading.",
          },
        ],
        obstacleCards: [
          {
            title: "The Mythic Inflation",
            meaning:
              "Becoming grandiose about your personal myth — believing you are uniquely special, cosmically chosen, or more mythically significant than others. The ego hijacking the imaginal.",
            guidance:
              "Every person is living a myth. Yours is not more important than the quiet myth of the person beside you on the bus. True mythic awareness brings humility, not inflation. The gods are humble enough to hide in ordinary things.",
            imagePrompt:
              "A figure wearing an enormous golden crown that tips their head forward under its weight, unable to see the ground. Around them, smaller figures without crowns walk freely, each trailing a faint constellation of personal stars. The crowned figure's stars are hidden behind the gold.",
          },
        ],
      },
    ],
  },

  // ── Path 3: The Body Oracle ─────────────────────────────────────────
  {
    name: "The Body Oracle",
    description:
      "The body knows before the mind does. It flinches before you think 'danger.' It opens before you think 'love.' This path reclaims the body as the original oracle — the instrument of instinct, intuition, and embodied wisdom.",
    themes: [
      "body",
      "embodiment",
      "soma",
      "sensation",
      "grounding",
      "nervous system",
      "instinct",
      "gut wisdom",
    ],
    symbolicVocabulary: [
      "root",
      "ground",
      "spine",
      "breath",
      "heartbeat",
      "skin",
      "bone",
      "muscle",
      "blood",
      "earth",
      "temple",
      "vessel",
      "anchor",
      "current",
      "pulse",
    ],
    interpretiveLens:
      "Every card speaks through the body. Interpretation begins not with 'what does this mean?' but 'where do I feel this?' The body is the primary text; the cards are annotations. Read through the lens of somatic experience, nervous system states, trauma-informed awareness, and the ancient understanding that flesh is sacred. The body does not lie, and it does not speak in abstractions. Help the seeker drop from the head into the living, breathing, sensing body that has been their most faithful companion all along.",
    iconKey: "hand",
    retreats: [
      // ── Retreat 1: Coming Home to the Body ─────────────────────────
      {
        name: "Coming Home to the Body",
        description:
          "For many of us, the body is a stranger. We live in our heads, our screens, our thoughts. This retreat is a homecoming — a slow, patient return to the house of flesh and bone that has been waiting for us.",
        theme: "Returning awareness to physical sensation",
        retreatLens:
          "Every card in this retreat is an invitation to arrive in the body. Interpret with attention to sensation, grounding, and physical presence. Where does the seeker feel this card in their body? What does the image evoke somatically? The goal is not to think about the body but to be in it. Model embodied interpretation: concrete, sensory, rooted in the physical rather than the conceptual.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Arrival",
            description:
              "You have been gone a long time. The body has been running without you — carrying you through days, years, decades while your attention was elsewhere. This waypoint marks the moment of return.",
            suggestedIntention:
              "What does it feel like to truly arrive in my body right now?",
            waypointLens:
              "The cards mark the moment of re-entry. Interpret with attention to the seeker's first sensations upon returning awareness to the body. What do they notice? Is there relief? Discomfort? Numbness? Recognition? The arrival is not dramatic — it is the simplest thing in the world. And the most radical.",
          },
          {
            name: "The Inventory",
            description:
              "A slow scan from head to toe. Not judging, not fixing — just noticing. What is tight? What is soft? Where is there warmth? Where is there numbness? This waypoint maps the terrain.",
            suggestedIntention:
              "What does a honest scan of my body reveal that I have been ignoring?",
            waypointLens:
              "The cards correspond to regions of the body. Interpret with specificity: this card speaks to the throat, this one to the belly, this one to the hands. What is each area holding? What message does each region carry? Help the seeker develop the habit of checking in with their body as naturally as checking their phone.",
          },
          {
            name: "The Ground Beneath",
            description:
              "Feel your feet on the floor. Feel the weight of your body settling into gravity. You are here. You are held. The earth has always been holding you. This waypoint practices the most basic form of embodiment: grounding.",
            suggestedIntention:
              "What happens when I let my full weight be held by the ground?",
            waypointLens:
              "The cards speak to grounding and support. Interpret through the body's relationship with the earth — the feet, the legs, the base of the spine. What supports the seeker? Where are they bracing against gravity instead of surrendering to it? Grounding is not a technique; it is a relationship with the earth that has been temporarily forgotten.",
          },
          {
            name: "Breath as Bridge",
            description:
              "The breath bridges conscious and unconscious, voluntary and involuntary, body and mind. It is the one bodily function you can control or release. This waypoint uses breath as the bridge back to embodiment.",
            suggestedIntention:
              "What changes in my body and mind when I give my breath my full attention?",
            waypointLens:
              "The cards speak through the breath. Interpret with attention to rhythm, depth, and quality of breathing. Is the seeker's breath shallow and quick? Deep and slow? Held? Where does the breath move freely and where does it stop? The breath is the body's most reliable oracle — it always tells the truth about the seeker's state.",
          },
        ],
        obstacleCards: [
          {
            title: "The Ghost in the Machine",
            meaning:
              "Treating the body as a machine to be optimized, managed, and controlled rather than a living being to be inhabited, listened to, and loved.",
            guidance:
              "Your body is not a project. It is your oldest companion. Before you optimize it, try simply being in it. Before you fix it, try listening to it. It has been speaking to you for your entire life.",
            imagePrompt:
              "A translucent human figure filled with gears and circuitry, floating slightly above the ground. Below, their shadow is warm and organic — a body made of earth, roots, and flowing water. The shadow reaches upward as if to reclaim the figure.",
          },
        ],
      },

      // ── Retreat 2: The Nervous System Oracle ───────────────────────
      {
        name: "The Nervous System Oracle",
        description:
          "Your nervous system is constantly reading the environment and reporting back — safe, unsafe, life-threatening. Learning to read these signals is learning to hear your body's most ancient oracle.",
        theme: "Reading the body's stress and safety signals",
        retreatLens:
          "Every card in this retreat is interpreted through the lens of the autonomic nervous system — sympathetic activation (fight/flight), dorsal vagal (freeze/collapse), and ventral vagal (safety/connection). Where is the seeker's nervous system right now? What is it responding to? The cards become a mirror for the body's threat-detection system. Interpret with trauma-informed sensitivity, polyvagal awareness, and deep respect for the body's protective intelligence.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Safety Signal",
            description:
              "Before you can explore anything else in the body, you must first locate safety. Where in your body, your environment, or your relationships do you feel genuinely safe?",
            suggestedIntention:
              "Where in my life does my body feel truly safe, and how do I know?",
            waypointLens:
              "The cards reveal the seeker's sources of safety. Interpret through ventral vagal activation — warmth, connection, ease, softness. What people, places, or practices bring the seeker's nervous system into a state of rest? Where does the body soften? This is foundational — without safety, no deeper exploration is possible.",
          },
          {
            name: "The Alert System",
            description:
              "Fight or flight is not a flaw — it is the body's oldest survival program. But when it runs constantly, it becomes exhausting. This waypoint reads your body's alert signals with compassion.",
            suggestedIntention:
              "What is my body bracing against or preparing to fight right now?",
            waypointLens:
              "The cards reveal sympathetic nervous system activation. Interpret through the body's fight-or-flight responses — muscle tension, rapid heartbeat, shallow breathing, hypervigilance. What threat is the body perceiving? Is it current or old? Help the seeker honor the alert system without being controlled by it. The alarm is not the enemy; it is a protector that needs updated information.",
          },
          {
            name: "The Freeze Response",
            description:
              "When the threat is too great to fight or flee, the body freezes — numbs, disconnects, shuts down. This is not weakness; it is the most ancient survival strategy. This waypoint meets the freeze with gentleness.",
            suggestedIntention:
              "Where in my life am I frozen, and what would help me thaw?",
            waypointLens:
              "The cards reveal dorsal vagal shutdown — numbness, dissociation, flatness, collapse. Interpret with extreme gentleness. The freeze response is not a choice but a survival mechanism. What overwhelmed the seeker's system? What would help them move gently from freeze toward safety? Never push through a freeze — approach with the patience of spring arriving after winter.",
          },
          {
            name: "Regulation as Practice",
            description:
              "Nervous system regulation is not a destination but a practice — a daily habit of checking in, co-regulating with safe others, and gently steering toward the window of tolerance.",
            suggestedIntention:
              "What daily practice would best support my nervous system's capacity for balance?",
            waypointLens:
              "The cards reveal the seeker's regulatory resources. Interpret with practical specificity — what actually helps this particular nervous system find balance? Not prescriptive advice but reflective inquiry. Some systems need more activation; some need more rest. What does the seeker's body need more of? Less of? The cards guide toward sustainable self-regulation.",
          },
        ],
        obstacleCards: [
          {
            title: "The Override",
            meaning:
              "Pushing through the body's distress signals — ignoring fatigue, overriding pain, forcing productivity when the nervous system is screaming for rest.",
            guidance:
              "The body's limits are not inconveniences to manage. They are wisdom to heed. The override always collects its debt. What would it mean to actually listen?",
            imagePrompt:
              "A horse galloping through a red landscape, foam at its mouth, eyes wide with exhaustion. The rider leans forward, urging speed. Behind them, an oasis of cool water and shade is being left behind. The horse's shadow turns its head toward the oasis.",
          },
          {
            title: "The Hypervigilant Sentinel",
            meaning:
              "A nervous system stuck in permanent scanning mode — always looking for threat, never fully at rest, confusing constant alertness with genuine safety.",
            guidance:
              "You are allowed to put down the watch. The sentinel who never rests cannot see clearly. True safety is not found in perfect vigilance but in the capacity to rest and still be held.",
            imagePrompt:
              "A lighthouse beam sweeping endlessly across a calm, empty sea. The lighthouse keeper stands at the top, eyes strained, searching for storms that are not coming. Below, the lighthouse door opens onto a garden bathed in moonlight.",
          },
        ],
      },

      // ── Retreat 3: Gut Wisdom ──────────────────────────────────────
      {
        name: "Gut Wisdom",
        description:
          "The gut has more neurons than the spinal cord. It has its own intelligence — older than language, faster than thought. 'I had a gut feeling' is not a metaphor. It is a recognition of the body's most ancient knowing system.",
        theme: "Trusting instinct and somatic knowing",
        retreatLens:
          "Every card in this retreat is read from the belly, not the head. Interpret through the lens of instinct, intuition, and gut knowing — the immediate, pre-rational response that arrives before analysis. The gut says yes or no before the mind has finished weighing pros and cons. Help the seeker learn to trust this intelligence, distinguishing genuine gut wisdom from anxiety, conditioning, or wishful thinking.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The First Response",
            description:
              "Before you think about the cards, feel them. What is your gut's first response? Expansion or contraction? Open or closed? This waypoint practices hearing the body's first word.",
            suggestedIntention:
              "What is my gut telling me about the decision or situation I am facing?",
            waypointLens:
              "The cards are read through immediate somatic response. Interpret by asking: does this card create expansion or contraction in the body? Does the belly soften or tighten? The first response — before the mind intervenes — carries the gut's message. Help the seeker learn to catch that first flash of knowing before the second-guessing begins.",
          },
          {
            name: "Instinct vs. Anxiety",
            description:
              "Not every strong body signal is intuition. Fear can masquerade as instinct. Conditioning can feel like knowing. This waypoint learns to tell the difference between gut wisdom and gut reaction.",
            suggestedIntention:
              "How can I distinguish my genuine intuition from my conditioned fear?",
            waypointLens:
              "The cards help the seeker differentiate authentic instinct from anxious noise. Interpret with nuance: gut wisdom tends to feel clear, calm, and certain even when its message is uncomfortable. Anxiety tends to feel frantic, looping, and urgent. What is the quality of the knowing the cards are pointing to? Help the seeker develop discernment about their own inner signals.",
          },
          {
            name: "The Belly Brain",
            description:
              "The enteric nervous system — the brain in the gut — processes information independently from the head brain. It thinks, remembers, and decides. This waypoint honors the belly as a center of intelligence.",
            suggestedIntention:
              "What does my belly know that my head does not?",
            waypointLens:
              "The cards speak from the enteric nervous system. Interpret with attention to the body's independent knowing — what the belly processes that the head has not caught up to. This is not mystical intuition but neurological reality: the gut has its own intelligence. What has the seeker's belly been trying to tell their head?",
          },
          {
            name: "Living from the Gut",
            description:
              "Trusting gut wisdom is not about making decisions impulsively. It is about giving the body a seat at the table of decision-making — alongside the mind and heart but not subordinate to them.",
            suggestedIntention:
              "What would change in my life if I trusted my gut wisdom as much as my rational mind?",
            waypointLens:
              "The cards reveal what a gut-trusting life looks like. Interpret with attention to integration — the belly's wisdom, the heart's wisdom, and the head's wisdom working together. What decisions is the seeker facing where the gut already knows the answer? What would it take to trust that knowing enough to act on it?",
          },
        ],
        obstacleCards: [
          {
            title: "The Overthinking Fog",
            meaning:
              "Analysis paralysis — thinking so much about a decision that the gut's clear signal gets buried under layers of pros, cons, what-ifs, and second-guessing.",
            guidance:
              "The gut spoke within the first three seconds. Everything after that is the mind trying to override it. Go back to the beginning. What did you know before you started thinking?",
            imagePrompt:
              "A clear pool of water at the bottom of a ravine, its surface disturbed by hundreds of falling leaves that obscure the stone beneath. Where a single leaf has been moved aside, the water is perfectly transparent, revealing a bright stone on the bottom.",
          },
        ],
      },

      // ── Retreat 4: The Heart's Intelligence ────────────────────────
      {
        name: "The Heart's Intelligence",
        description:
          "The heart has its own electromagnetic field, its own neural network, its own way of knowing. Across cultures, the heart is recognized as an organ of perception — not just a pump, but an oracle. This retreat listens to the heart as teacher.",
        theme: "The heart as an organ of perception",
        retreatLens:
          "Every card in this retreat is read through the heart center. Interpret through the lens of the heart's intelligence — not sentimental emotion but the heart's unique way of perceiving truth, connection, and meaning. The heart knows things the mind cannot figure out and the gut cannot specify. It perceives in wholes rather than parts, in relationships rather than categories. Help the seeker develop their heart-perception as a genuine cognitive capacity.",
        estimatedReadings: 5,
        waypoints: [
          {
            name: "The Heart's Voice",
            description:
              "Beneath the noise of thinking and the urgency of survival responses, there is a quieter voice — the heart's. It speaks in warmth, in opening, in the subtle 'yes' of recognition. This waypoint learns to hear it.",
            suggestedIntention:
              "What is my heart saying that I have been too busy to hear?",
            waypointLens:
              "The cards carry the heart's message. Interpret with attention to what opens the seeker's chest, what brings a flush of warmth, what creates a sense of rightness that goes beyond rational justification. The heart speaks in feelings that are more complex than simple emotions — a blend of love, knowing, and recognition that defies analysis.",
          },
          {
            name: "Heart-Sight",
            description:
              "The Little Prince knew: 'It is only with the heart that one can see rightly.' The heart sees what the eyes miss — the essential, the invisible, the true. This waypoint develops heart-based perception.",
            suggestedIntention:
              "What can I see with my heart that is invisible to my eyes?",
            waypointLens:
              "The cards reveal what is visible only to heart-perception. Interpret by looking for the invisible dimension of the spread — the unspoken bond, the hidden beauty, the love that is present but unnamed. What would the seeker see if they looked at their life through the heart rather than the analytical mind? The heart sees wholes, connections, and essences.",
          },
          {
            name: "The Open Heart",
            description:
              "An open heart is not weak. It is the bravest organ in the body — continuing to beat, continuing to open, after every loss and every betrayal. This waypoint honors the heart's courage.",
            suggestedIntention:
              "What is my heart brave enough to remain open to, even though it has been hurt?",
            waypointLens:
              "The cards reveal the heart's courage. Interpret with recognition of what the seeker's heart has endured and what it continues to stay open for. This is not vulnerability as weakness but vulnerability as the highest form of strength. What has the heart loved that it lost? What does it dare to love again?",
          },
          {
            name: "Coherence",
            description:
              "Heart coherence — when the heart's rhythm becomes smooth and ordered — affects the entire body and mind. When the heart leads, everything else aligns. This waypoint practices coherence.",
            suggestedIntention:
              "What brings my heart into a state of coherence and flow, and how can I access it more often?",
            waypointLens:
              "The cards reveal what creates heart coherence for the seeker — the people, practices, memories, and experiences that bring the heart into its most ordered, powerful state. Interpret with attention to what aligns the seeker: what makes them feel 'in their heart'? When was the last time everything felt right?",
          },
          {
            name: "The Heart's Path",
            description:
              "The heart has its own navigation system. It knows which direction to walk even when the mind is confused and the map is blank. This waypoint trusts the heart's direction.",
            suggestedIntention:
              "If I let my heart choose the direction, where would it lead me?",
            waypointLens:
              "The cards reveal the heart's chosen direction. Interpret as navigational guidance from the heart center — not what the seeker should do according to logic or obligation, but where the heart pulls. This may conflict with practical considerations. The interpretation should honor that tension without resolving it prematurely. The heart's path is not always easy, but it is always authentic.",
          },
        ],
        obstacleCards: [
          {
            title: "The Armored Heart",
            meaning:
              "Protection masquerading as wisdom — the heart wrapped in so much armor that it can no longer feel, connect, or guide. The armor was necessary once. It may not be now.",
            guidance:
              "The armor served you. Thank it. But notice how heavy it has become. You can take it off one plate at a time. The heart beneath is still beating, still soft, still yours.",
            imagePrompt:
              "A heart-shaped breastplate of tarnished silver, hanging on a wall hook in an empty room. Behind it, through an arched window, dawn light touches a garden. The breastplate's interior is lined with velvet, well-worn, suggesting long years of faithful service now complete.",
          },
          {
            title: "The Sentimental Trap",
            meaning:
              "Confusing sentimentality with heart wisdom — mistaking nostalgia for guidance, romantic fantasy for heart-knowing, emotional intensity for truth.",
            guidance:
              "Heart wisdom is quiet and often inconvenient. Sentimentality is loud and always comfortable. When the heart speaks, it may say something you do not want to hear. That is how you know it is real.",
            imagePrompt:
              "A music box playing a sweet, repetitive melody in a pink-lit room, while through the floorboards, a deep bass note resonates — steady, low, and true. The music box is ornate and lovely; the deeper tone vibrates the foundation itself.",
          },
        ],
      },

      // ── Retreat 5: Pleasure as Practice ────────────────────────────
      {
        name: "Pleasure as Practice",
        description:
          "Spirituality that denies the body's pleasure is half a spirituality. This retreat reclaims joy, delight, ease, and sensory pleasure as legitimate paths to wisdom — not indulgence, but embodied celebration of being alive.",
        theme: "Reclaiming joy, ease, and delight as spiritual practice",
        retreatLens:
          "Every card in this retreat speaks through pleasure, delight, and the body's capacity for joy. Interpret with a celebration of the senses — taste, touch, smell, sight, sound. Where does the seeker deny themselves pleasure? Where do they feel guilty for enjoying? Where is the body asking for more ease, more play, more delight? This is not hedonism but holy enjoyment — the recognition that a body that knows pleasure is a body that trusts life.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Permission",
            description:
              "For many, pleasure requires permission — a belief that you have earned it, that there is enough time, that you deserve it. This waypoint grants that permission unconditionally.",
            suggestedIntention:
              "What simple pleasure am I denying myself, and what would it mean to say yes?",
            waypointLens:
              "The cards grant permission. Interpret with abundant generosity — whatever pleasure the cards point to, the answer is yes. Where has the seeker been withholding delight from themselves? What puritan inner voice says pleasure is wasteful, selfish, or dangerous? The cards overrule that voice. This is sacred permission to enjoy being alive.",
          },
          {
            name: "The Senses as Teachers",
            description:
              "Each sense is a doorway to presence. The taste of ripe fruit, the smell of rain, the feel of sun on skin — these are not distractions from spiritual life but invitations into it.",
            suggestedIntention:
              "Which of my senses is most hungry for attention and nourishment?",
            waypointLens:
              "The cards correspond to the senses. Interpret through sensory richness — what does this card taste like? What does it sound like? What would it feel like against the skin? Help the seeker re-inhabit their sensory life as a spiritual practice. The senses do not take us away from presence — they are the very mechanism of presence.",
          },
          {
            name: "Joy as Resistance",
            description:
              "In a world that profits from your dissatisfaction, joy is a radical act. Choosing pleasure, ease, and delight is not escapism — it is an act of resistance against the culture of endless striving.",
            suggestedIntention:
              "Where in my life would choosing joy be the most radical and necessary act?",
            waypointLens:
              "The cards reveal where joy is needed as medicine. Interpret with political and personal awareness — the seeker's relationship with pleasure exists within a culture that often pathologizes rest and commodifies happiness. Where is genuine, uncommodified joy available? What would it mean to take it?",
          },
          {
            name: "Sustainable Delight",
            description:
              "Pleasure that burns hot and fast is different from delight that sustains. This waypoint discovers the kind of pleasure that nourishes rather than depletes — slow, simple, and deeply satisfying.",
            suggestedIntention:
              "What form of pleasure sustains me rather than depletes me?",
            waypointLens:
              "The cards distinguish between consuming pleasure and nourishing pleasure. Interpret with discernment — not all pleasure is equal. Help the seeker identify the forms of delight that leave them more whole, more present, and more alive. The kind of pleasure that does not need to escalate to satisfy. Simple, sustainable, and deeply grounding.",
          },
        ],
        obstacleCards: [
          {
            title: "The Guilt Tax",
            meaning:
              "The automatic guilt that follows any experience of pleasure — the inner voice that says 'you don't deserve this,' 'you should be working,' or 'others are suffering while you enjoy.'",
            guidance:
              "Guilt is not proof that you are good. It is a habit that was installed long ago. Your pleasure does not cause others' pain. Your deprivation does not ease their burden. Let yourself receive what life is offering.",
            imagePrompt:
              "A figure sitting in a beautiful garden, a ripe peach in hand, but a heavy iron chain connects the peach to a ledger book floating nearby. In the distance, the garden gate stands open and the chain has no lock — it is held in place by the figure's own grip.",
          },
        ],
      },

      // ── Retreat 6: The Wounded Healer ──────────────────────────────
      {
        name: "The Wounded Healer",
        description:
          "The body holds what the mind cannot bear. Trauma lives not in the story but in the tissue — the held breath, the braced muscles, the startled reflex. This retreat approaches the body's wounds with the reverence of one who knows that healing is not erasing but integrating.",
        theme: "How the body holds trauma and how it heals",
        retreatLens:
          "Every card in this retreat speaks to the body's relationship with wounding and healing. Interpret with trauma-informed awareness and profound gentleness. The body's wounds are not failures; they are records of survival. The held tension, the chronic pain, the dissociation — all of these are the body's best attempts to protect itself. Interpret without rushing toward resolution. Some wounds do not heal on a schedule. The cards hold space for both the wound and the healer, recognizing they are the same body.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Body Remembers",
            description:
              "The body stores what the mind forgets. A smell, a sound, a touch can unlock a flood of sensation that has no story attached. This waypoint honors the body's memory with gentleness.",
            suggestedIntention:
              "What is my body remembering that my mind may have set aside?",
            waypointLens:
              "The cards may surface somatic memories — not narrative recall but body-held experience. Interpret with extreme care. Do not push the seeker to 'remember' in a cognitive sense. Instead, invite them to notice what their body holds: the tension that has no name, the flinch with no story, the grief that lives in the chest. The body remembers at its own pace. Honor that pace.",
          },
          {
            name: "The Armor That Served",
            description:
              "Every pattern of tension, every chronic holding pattern was once an act of genius — the body's way of surviving what could not be survived otherwise. Before releasing armor, honor what it protected.",
            suggestedIntention:
              "What protective pattern in my body served me once but may be ready to soften?",
            waypointLens:
              "The cards reveal the seeker's protective somatic patterns. Interpret with gratitude before release. The clenched jaw protected the voice that could not speak. The held shoulders carried what was too heavy to set down. The tight belly guarded the vulnerable core. Before anything can be released, it must first be thanked. Model this in the interpretation.",
          },
          {
            name: "The Healing Current",
            description:
              "Healing does not happen through force. It happens through flow — the gentle current of breath, movement, tears, trembling, and rest that allows the body to complete what was interrupted.",
            suggestedIntention:
              "What does my body need in order to let its healing current flow?",
            waypointLens:
              "The cards reveal what the seeker's body needs for healing — not prescriptive 'you should do yoga' but attunement to what this particular body craves. Does it need movement? Stillness? Touch? Sound? The healing current is already present; it just needs the conditions to flow. What is blocking the flow, and what would open it?",
          },
          {
            name: "The Scar as Teacher",
            description:
              "Scars are not signs of damage. They are proof of healing — tissue that rebuilt itself, stronger and more sensitive than before. This waypoint reframes the body's scars as marks of resilience.",
            suggestedIntention:
              "What has my body's healing process taught me about my own resilience?",
            waypointLens:
              "The cards celebrate the body's resilience. Interpret with recognition of what the seeker has already survived and healed. The scar is not the wound — it is what came after the wound. What has the seeker's body taught them about their own capacity to endure, heal, and come back changed but whole? Let the reading be an honoring of the body's extraordinary capacity for repair.",
          },
        ],
        obstacleCards: [
          {
            title: "The Forced Excavation",
            meaning:
              "Trying to dig trauma out of the body before it is ready to release — forcing catharsis, pushing through somatic resistance, treating the body as a problem to solve rather than a being to collaborate with.",
            guidance:
              "The body will not be forced. It releases when it trusts. Build trust first. The body has been betrayed enough — do not betray it with your impatience for healing.",
            imagePrompt:
              "Hands digging forcefully into dark soil, disturbing tangled roots that hold the earth together. Beside the hole, a plant grows naturally, its roots slowly and gently loosening the same soil from below, creating space without violence.",
          },
          {
            title: "The Wound as Identity",
            meaning:
              "Building an entire self around the wound — 'I am my trauma.' The wound becomes the core of identity rather than one chapter in a much longer story.",
            guidance:
              "You are not what happened to you. You are what grew from it, around it, and despite it. The wound is real. And it is not the whole of you. There is a self beyond the scar.",
            imagePrompt:
              "A tree with a large hollow in its trunk where a branch was torn away long ago. The hollow is dark and deep. But the tree has grown enormous around it — canopy wide, roots deep, new branches reaching in all directions. Birds nest in the hollow. The wound has become a home.",
          },
        ],
      },

      // ── Retreat 7: Sacred Embodiment ────────────────────────────────
      {
        name: "Sacred Embodiment",
        description:
          "The body is not a vehicle for the spirit. The body is spirit — dense, warm, mortal, miraculous. This culminating retreat arrives at the sacred nature of embodiment itself: the body as temple, vessel, and oracle complete.",
        theme: "The body as temple, vessel, and oracle",
        retreatLens:
          "This culminating retreat interprets every card through the lens of the sacred body. The separation between physical and spiritual dissolves. The flesh is holy. The pulse is prayer. The breath is spirit made visible. Interpret with reverence for the miracle of embodiment — 37 trillion cells coordinating in darkness without being asked. Reference the seeker's earlier work on this path wherever Cards Remember provides context. The reading should feel like a consecration: the body being recognized as what it has always been — sacred.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "The Temple",
            description:
              "Your body is the only temple you will ever truly inhabit. Not a metaphor — a direct recognition. The spine is the altar. The heart is the holy of holies. The skin is the veil between inner and outer worlds.",
            suggestedIntention:
              "If my body is a temple, what has been neglected and what is already sacred?",
            waypointLens:
              "The cards reveal the seeker's body as sacred architecture. Interpret with temple language — the threshold (skin), the sanctuary (heart), the altar (center), the foundation (feet and legs). What part of the temple has been neglected? What part is already glowing with devotion? Help the seeker see their own body with the reverence they would bring to a cathedral.",
          },
          {
            name: "The Vessel",
            description:
              "A vessel holds what is poured into it. Your body holds experience, memory, emotion, life itself. This waypoint considers what your vessel is holding — and what it has the capacity to hold.",
            suggestedIntention:
              "What is my body currently holding, and what does it have the capacity to receive?",
            waypointLens:
              "The cards reveal the seeker's body as vessel — its current contents and its capacity. Interpret with attention to what has been stored (memory, grief, joy, tension) and what space remains for new experience. Is the vessel full? Overflowing? Half empty? What does it long to be filled with? The vessel is not passive; it shapes what it holds.",
          },
          {
            name: "The Oracle",
            description:
              "The body has been speaking to you all along — through sensation, instinct, pleasure, pain, intuition, and the quiet voice of the belly, the heart, the bones. This waypoint recognizes the body as the oracle it has always been.",
            suggestedIntention:
              "What does my body-oracle tell me about my life right now?",
            waypointLens:
              "The cards and the body speak the same language. Interpret by inviting the seeker to let their body respond to the cards rather than their mind. What does the body say about this spread? This is the integration of everything the path has taught — the body is not just informed by the oracle; it is the oracle. The reading should feel like the seeker consulting themselves.",
          },
          {
            name: "The Embodied Life",
            description:
              "You will live the rest of your life in this body. Not enduring it, not transcending it — inhabiting it fully, gratefully, with all its limits and miracles. This final waypoint consecrates the embodied life as sacred.",
            suggestedIntention:
              "What does it mean to live fully and gratefully in this body for the rest of my days?",
            waypointLens:
              "The culmination of the Body Oracle path. The cards speak to the seeker's future as an embodied being — mortal, limited, miraculous, sacred. Interpret with celebration and sobriety: this body will age, change, and eventually return to the earth. That is not tragedy but the deepest beauty. Let the reading be a consecration of the body's remaining days — however many or few — as sacred ground.",
          },
        ],
        obstacleCards: [
          {
            title: "The Transcendence Escape",
            meaning:
              "Using spiritual practice to escape the body rather than inhabit it — seeking enlightenment as a way out of the difficult, messy, mortal experience of having a body.",
            guidance:
              "Enlightenment is not an escape hatch from the body. It is the full arrival in it. The mystics who described transcendence were not leaving the body behind — they were finally, completely, here.",
            imagePrompt:
              "A luminous figure ascending through clouds, arms raised, but their shadow remains below, standing in a garden, hands in soil. The shadow is smiling. Between them, a golden thread connects crown to root, spirit to earth, asking which direction is truly 'up.'",
          },
        ],
      },
    ],
  },
];

// ── Circle Stubs for Circles 2–6 ─────────────────────────────────────

export const CIRCLE_STUBS: CircleStub[] = [
  {
    name: "The Mirror",
    description:
      "The mirror of self-knowledge. Map your emotional landscape, descend into the realm of dream and symbol, and reclaim the body as your most ancient oracle. Circle 2 turns the lens inward — not to judge what it finds, but to know it fully.",
    circleNumber: 2,
    sortOrder: 1,
    iconKey: "mirror",
    themes: [
      "self-knowledge",
      "emotions",
      "dreams",
      "embodiment",
      "symbols",
      "inner weather",
      "somatic wisdom",
    ],
    estimatedDays: 75,
    paths: [
      {
        name: "The Emotional Landscape",
        description:
          "Map the terrain of your inner weather — learning to name, feel, transform, and move fluidly between emotional states without being swept away by any single storm.",
        iconKey: "waves",
        themes: [
          "emotions",
          "feeling states",
          "reactivity",
          "emotional intelligence",
          "inner weather",
          "triggers",
          "emotional alchemy",
        ],
      },
      {
        name: "The Dream Weaver",
        description:
          "Descend into the realm of symbol, myth, and active imagination. Learn to read the language of the unconscious — in your dreams, your oracle cards, and the recurring images that thread through your life.",
        iconKey: "moon",
        themes: [
          "dreams",
          "symbols",
          "unconscious",
          "imagination",
          "myth",
          "archetypal images",
          "vision",
        ],
      },
      {
        name: "The Body Oracle",
        description:
          "The body knows before the mind does. This path reclaims the body as the original oracle — the instrument of instinct, intuition, and embodied wisdom.",
        iconKey: "hand",
        themes: [
          "body",
          "embodiment",
          "soma",
          "sensation",
          "grounding",
          "nervous system",
          "instinct",
          "gut wisdom",
        ],
      },
    ],
  },
  {
    name: "The Crucible",
    description:
      "The crucible of transformation. Revisit archetypal themes at deeper levels, explore inner alchemy, and meet the sacred darkness that catalyzes change. What emerges from the fire is unrecognizable — and more real than what went in.",
    circleNumber: 3,
    sortOrder: 2,
    iconKey: "flame",
    themes: [
      "transformation",
      "alchemy",
      "deepening",
      "shadow work",
      "inner fire",
      "transmutation",
    ],
    estimatedDays: 90,
    paths: [
      {
        name: "Deeper Archetypes",
        description:
          "Revisiting the archetypal realm with greater depth and nuance. The archetypes you met in Circle 1 now reveal their darker, wilder, more complex faces — the Trickster, the Destroyer, the Crone, the Shapeshifter.",
        iconKey: "drama",
        themes: [
          "deep archetypes",
          "trickster",
          "destroyer",
          "crone",
          "shapeshifter",
          "complexity",
          "dark feminine",
          "dark masculine",
        ],
      },
      {
        name: "The Alchemist",
        description:
          "Inner alchemy at the advanced level: transforming base patterns into gold. Not the surface-level alchemy of Circle 2 but the deep work of dissolution and reconstitution — the ego's structures melted down and reformed.",
        iconKey: "flask",
        themes: [
          "inner alchemy",
          "transmutation",
          "dissolution",
          "reconstitution",
          "nigredo",
          "albedo",
          "rubedo",
          "philosopher's stone",
        ],
      },
      {
        name: "Sacred Darkness",
        description:
          "The dark feminine, the dark masculine, the wound as teacher, the descent as gift. This path walks deliberately into what most avoid — not to conquer darkness but to receive its transmission.",
        iconKey: "eclipse",
        themes: [
          "dark feminine",
          "dark masculine",
          "sacred wound",
          "descent",
          "initiation",
          "katabasis",
          "underworld",
          "rebirth",
        ],
      },
    ],
  },
  {
    name: "The Weaving",
    description:
      "Integration and interconnection. Deepen mindfulness practice, explore the mirror of relationships, and attune to nature's rhythms as spiritual teacher. The separate threads of your inner work begin to weave into a coherent fabric.",
    circleNumber: 4,
    sortOrder: 3,
    iconKey: "web",
    themes: [
      "integration",
      "relationships",
      "nature",
      "cycles",
      "interconnection",
      "weaving",
    ],
    estimatedDays: 90,
    paths: [
      {
        name: "Deeper Mindfulness",
        description:
          "Advanced contemplative practice through oracle work. Moving beyond basic present-moment awareness into the territories of emptiness, interdependence, and the mindfulness that permeates action itself.",
        iconKey: "lotus",
        themes: [
          "advanced mindfulness",
          "emptiness",
          "interdependence",
          "contemplative action",
          "samadhi",
          "vipassana",
          "engaged awareness",
        ],
      },
      {
        name: "The Relational Mirror",
        description:
          "Relationships as spiritual practice and mirror. Every person in your life reflects something back to you. This path explores intimacy, conflict, boundaries, and the sacred territory between self and other.",
        iconKey: "hands",
        themes: [
          "relationships",
          "intimacy",
          "conflict",
          "mirroring",
          "boundaries",
          "love",
          "projection",
          "interdependence",
        ],
      },
      {
        name: "The Seasonal Wheel",
        description:
          "Nature cycles, death-rebirth, rhythmic wisdom. Attuning to the earth's rhythms as teacher and mirror — the wisdom of seasons, tides, lunar cycles, and the great wheel of growth and decay.",
        iconKey: "leaf",
        themes: [
          "nature",
          "seasons",
          "cycles",
          "death-rebirth",
          "lunar",
          "tides",
          "decay",
          "growth",
          "rhythm",
        ],
      },
    ],
  },
  {
    name: "The Abyss",
    description:
      "The great dissolving. Deepen mystical practice, encounter the void, and learn to hold paradox. What remains when everything you thought you were falls away? This circle does not build — it strips away, revealing what was always underneath.",
    circleNumber: 5,
    sortOrder: 4,
    iconKey: "void",
    themes: [
      "dissolution",
      "void",
      "paradox",
      "non-duality",
      "surrender",
      "emptiness",
    ],
    estimatedDays: 100,
    paths: [
      {
        name: "Deeper Mysticism",
        description:
          "Advanced mystical practice and nondual awareness. Beyond the ecstatic experiences of earlier circles into the territory of stable nondual awareness — the ordinary mysticism of everyday life.",
        iconKey: "flame",
        themes: [
          "nondual awareness",
          "mystical sobriety",
          "ordinary mysticism",
          "apophatic",
          "unknowing",
          "luminous darkness",
          "direct experience",
        ],
      },
      {
        name: "The Void",
        description:
          "Emptiness, non-attachment, radical surrender. The void is not nihilism but the pregnant darkness from which all things arise. This path walks to the edge of the self and looks over.",
        iconKey: "circle",
        themes: [
          "sunyata",
          "emptiness",
          "non-attachment",
          "radical surrender",
          "groundlessness",
          "the abyss",
          "fertile void",
        ],
      },
      {
        name: "The Paradox",
        description:
          "Holding contradiction, both/and thinking, koan-mind. This path breaks the habit of binary thought and learns to hold irreconcilable truths simultaneously — the cognitive practice of nonduality.",
        iconKey: "infinity",
        themes: [
          "paradox",
          "koan",
          "both/and",
          "contradiction",
          "nonduality",
          "complementary opposites",
          "mystery",
        ],
      },
    ],
  },
  {
    name: "The Constellation",
    description:
      "The constellation of mastery. Trust your inner teacher, craft your personal mythology, and become the oracle. Not an ending but a new beginning — teaching is the deepest learning, and the circle spirals back to the start with new eyes.",
    circleNumber: 6,
    sortOrder: 5,
    iconKey: "stars",
    themes: [
      "mastery",
      "teaching",
      "inner teacher",
      "mythmaking",
      "service",
      "wisdom",
    ],
    estimatedDays: 100,
    paths: [
      {
        name: "The Inner Teacher",
        description:
          "Becoming your own oracle, trusting deep intuition. After five circles of outer guidance, this path turns the seeker inward to discover that the teacher they sought has been speaking through them all along.",
        iconKey: "eye",
        themes: [
          "inner teacher",
          "self-trust",
          "deep intuition",
          "inner authority",
          "sovereignty",
          "self-guidance",
          "the oracle within",
        ],
      },
      {
        name: "The Mythmaker",
        description:
          "Crafting personal mythology and narrative alchemy. Having learned to read and live your myth, you now learn to consciously shape it — not as self-deception but as the deepest creative act a human being can perform.",
        iconKey: "quill",
        themes: [
          "mythmaking",
          "narrative alchemy",
          "conscious storytelling",
          "creative power",
          "world-building",
          "symbolic craft",
          "legacy",
        ],
      },
      {
        name: "The Oracle's Way",
        description:
          "Embodying wisdom, mentoring, sacred service. The final path is not about accumulating more knowledge but about giving away what has been received. The oracle serves not by having answers but by holding the space in which answers arise.",
        iconKey: "lantern",
        themes: [
          "sacred service",
          "mentoring",
          "wisdom embodiment",
          "generosity",
          "holding space",
          "transmission",
          "the return",
        ],
      },
    ],
  },
];
