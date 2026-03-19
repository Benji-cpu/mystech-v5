/**
 * Seed script for the 3 starting Paths with Retreats and Waypoints.
 *
 * Usage: npx tsx scripts/seed-paths.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createId } from "@paralleldrive/cuid2";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ── Types for seed data ─────────────────────────────────────────────

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

// ── The 3 Starting Paths ────────────────────────────────────────────

const PATHS: PathSeed[] = [
  // ── 1. Archetypal (Jungian Psychology) ────────────────────────────
  {
    name: "Archetypal",
    description:
      "Explore the universal patterns of the psyche through Jungian archetypes, shadow work, and the journey toward wholeness.",
    themes: [
      "shadow",
      "anima/animus",
      "collective unconscious",
      "hero's journey",
      "individuation",
      "persona",
      "archetypes",
    ],
    symbolicVocabulary: [
      "shadow",
      "persona",
      "anima",
      "animus",
      "Self",
      "individuation",
      "archetype",
      "projection",
      "integration",
      "the unconscious",
      "inner child",
      "wise elder",
      "threshold",
      "descent",
    ],
    interpretiveLens:
      "View each card as a mirror reflecting an aspect of the psyche — a shadow element seeking integration, an archetype awakening, or a step on the individuation journey. The cards are not fortune-telling; they are invitations to meet the parts of yourself you have not yet embraced. Every symbol carries the weight of the collective unconscious, connecting personal experience to universal human patterns.",
    iconKey: "drama",
    retreats: [
      {
        name: "The Threshold",
        description:
          "The journey begins with awareness. Before you can transform, you must see where you stand — the masks you wear, the stories you tell yourself, and the quiet call to something deeper.",
        theme: "Self-awareness and the call to inner work",
        retreatLens:
          "In this retreat, every card speaks to the seeker's relationship with self-knowledge. Look for themes of awakening, recognition, and the gap between who we present to the world and who we are beneath. The Threshold is about hearing the call — not yet answering it, but acknowledging it exists.",
        estimatedReadings: 3,
        waypoints: [
          {
            name: "Acknowledging the Call",
            description:
              "Something is stirring. A restlessness, a question that won't quiet. This waypoint invites you to name what is calling you inward.",
            suggestedIntention:
              "What is calling me to look deeper right now?",
            waypointLens:
              "Focus on what is emerging in the seeker's awareness — the unnamed feeling, the recurring thought, the sense that something is shifting. The cards here speak to beginnings and invitations.",
          },
          {
            name: "Meeting Your Persona",
            description:
              "The persona is the mask we show the world. Here you examine the roles you play and the face you present — not to discard them, but to see them clearly.",
            suggestedIntention:
              "What mask am I wearing that no longer fits?",
            waypointLens:
              "Interpret through the lens of social identity and performed self. Which cards reveal the seeker's public face? Where is the gap between persona and authentic self? Treat the persona with compassion — it was built for survival.",
          },
          {
            name: "The Mirror's Edge",
            description:
              "Standing at the mirror's edge means being willing to see yourself as you truly are — not the idealized version, not the feared version, but the real one.",
            suggestedIntention:
              "What truth about myself am I ready to see?",
            waypointLens:
              "The cards here act as mirrors. Emphasize honest self-reflection without judgment. Look for what the seeker might be avoiding or what they're ready to acknowledge. This is the moment before the dive — standing at the edge of deeper self-knowledge.",
          },
        ],
        obstacleCards: [
          {
            title: "The Comfortable Mask",
            meaning: "Resistance to seeing beyond the persona — the familiar identity feels safe, and deeper inquiry feels threatening.",
            guidance: "Notice when you reach for a rehearsed answer instead of a felt truth. The mask isn't your enemy — but clinging to it is.",
            imagePrompt: "An ornate porcelain mask resting on a velvet cushion, one side cracked to reveal golden light streaming through. Soft purple shadows surround it.",
          },
          {
            title: "The Rational Shield",
            meaning: "Intellectualizing instead of feeling — using analysis as armor against vulnerability.",
            guidance: "When you catch yourself explaining away an emotion, pause. Drop from the head to the heart, even for a moment.",
            imagePrompt: "A crystalline geometric shield hovering in space, refracting light into cold prismatic patterns. Behind it, a warm ember glows faintly, barely visible.",
          },
        ],
      },
      {
        name: "Shadow Dance",
        description:
          "The shadow holds everything we've rejected, denied, or hidden from ourselves. This retreat is about meeting those exiled parts with curiosity rather than fear.",
        theme: "Integrating the shadow self",
        retreatLens:
          "Every card in this retreat should be read through the shadow lens. What is hidden? What has been rejected? Where does the seeker project their disowned qualities onto others? Shadow work is not about defeating darkness — it's about discovering that what we've called 'dark' often carries our greatest gifts. Interpret with courage and compassion.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "What You Reject",
            description:
              "The shadow begins with rejection — the qualities in others that trigger us, the parts of ourselves we refuse to claim.",
            suggestedIntention:
              "What quality in others am I refusing to see in myself?",
            waypointLens:
              "Focus on projection and disowned qualities. The cards may reveal what the seeker judges in others as a mirror of their own rejected traits. Approach with gentleness — shadow material can be tender.",
          },
          {
            name: "Shadow as Teacher",
            description:
              "The shadow is not the enemy. It carries intelligence, creativity, and life force that was pushed underground. Here you learn what it has to teach.",
            suggestedIntention:
              "What is my shadow trying to teach me?",
            waypointLens:
              "Reframe shadow content as wisdom rather than flaw. Each card carries a hidden teaching from the unconscious. What message has been waiting in the dark? What strength lives in what the seeker considers weakness?",
          },
          {
            name: "The Gift in the Dark",
            description:
              "Every shadow element, once acknowledged, reveals a gift. Rage becomes passion. Fear becomes discernment. Grief becomes the capacity for deep love.",
            suggestedIntention:
              "What gift is hidden in what I fear most about myself?",
            waypointLens:
              "Alchemical interpretation — transform shadow into gold. Each card's challenging aspects should be reframed as potential strengths. The 'negative' cards in the spread carry the most transformative power here.",
          },
          {
            name: "Shadow Integration",
            description:
              "Integration doesn't mean the shadow disappears. It means you can hold both light and dark within you without splitting. You become more whole.",
            suggestedIntention:
              "How can I hold both my light and my darkness with grace?",
            waypointLens:
              "Look for wholeness and paradox. The cards speak to the seeker's capacity to embrace contradiction. Integration means expanding — becoming large enough to contain multitudes. Reference earlier waypoints if Cards Remember provides them.",
          },
        ],
        obstacleCards: [
          {
            title: "The Projection Mirror",
            meaning: "Seeing your shadow in others — attributing your own rejected qualities to the people around you.",
            guidance: "When someone triggers a strong reaction, ask: what part of me am I seeing reflected? The mirror never lies.",
            imagePrompt: "A dark mirror standing in mist, reflecting not the viewer but a shadowy figure with outstretched hands. Golden threads connect them across the glass.",
          },
          {
            title: "The Inner Critic's Throne",
            meaning: "Self-judgment masquerading as self-improvement — using harsh inner dialogue as a way to avoid real transformation.",
            guidance: "The inner critic speaks loudly, but it speaks from fear. Listen for the fear beneath the judgment, and address that instead.",
            imagePrompt: "An imposing stone throne carved with severe faces, sitting in a dark chamber. A single candle nearby casts warm light that softens the stone's edges.",
          },
        ],
      },
      {
        name: "The Inner Council",
        description:
          "Within each of us lives a council of archetypes — the Inner Child, the Warrior, the Sage, the Lover, the Sovereign. This retreat is about meeting each one and hearing their voice.",
        theme: "Meeting your archetypes",
        retreatLens:
          "Each reading in this retreat should be interpreted as a conversation with one of the seeker's inner archetypes. Who is speaking through these cards? What does this figure want the seeker to know? Archetypes are not roles to perform but energies to embody. Help the seeker recognize which archetype is most active and what it needs.",
        estimatedReadings: 5,
        waypoints: [
          {
            name: "The Inner Child",
            description:
              "The part of you that remembers wonder, play, and vulnerability. The Inner Child carries both your earliest wounds and your most authentic joy.",
            suggestedIntention:
              "What does my inner child need me to know right now?",
            waypointLens:
              "Read the cards through the voice of the seeker's inner child — innocence, wonder, vulnerability, play, and early wounds. What needs nurturing? What memory wants to be held?",
          },
          {
            name: "The Warrior",
            description:
              "The Warrior is your capacity for fierce protection, courageous action, and standing in your truth even when it costs something.",
            suggestedIntention:
              "Where in my life am I being called to be braver?",
            waypointLens:
              "The Warrior archetype speaks through themes of courage, boundaries, protection, and righteous action. What is the seeker being asked to defend or fight for? Where do they need to say no — or a fiercer yes?",
          },
          {
            name: "The Sage",
            description:
              "The Sage is your inner wisdom — the part that sees patterns, finds meaning, and knows without being able to explain how.",
            suggestedIntention:
              "What wisdom am I not yet trusting in myself?",
            waypointLens:
              "Interpret through the lens of deep knowing and pattern recognition. The Sage sees the larger picture. What do the cards reveal about the seeker's untapped wisdom? Where are they overthinking when they already know the answer?",
          },
          {
            name: "The Lover",
            description:
              "The Lover is your capacity for deep connection — with people, with beauty, with life itself. It's the archetype of passion, intimacy, and devotion.",
            suggestedIntention:
              "What is my heart longing to connect with more deeply?",
            waypointLens:
              "Read through the lens of connection, passion, beauty, and devotion. The Lover archetype isn't limited to romance — it's about what the seeker is devoted to, what makes them come alive, what they find beautiful and worth cherishing.",
          },
          {
            name: "The Sovereign",
            description:
              "The Sovereign is your inner ruler — the one who takes responsibility, makes decisions from center, and leads their own life with dignity and purpose.",
            suggestedIntention:
              "Where am I being called to take fuller ownership of my life?",
            waypointLens:
              "The Sovereign archetype speaks to authority, responsibility, and self-governance. Where does the seeker need to claim their power? Where have they been abdicating the throne of their own life? Read with themes of maturity, leadership, and purposeful choice.",
          },
        ],
        obstacleCards: [
          {
            title: "The Favorite Archetype",
            meaning: "Over-identifying with one archetype while neglecting others — becoming the perpetual Sage while starving the Lover, or the eternal Warrior avoiding the Inner Child.",
            guidance: "Which archetype feels uncomfortable? That's the one calling for your attention. Wholeness requires all voices at the table.",
            imagePrompt: "A council chamber with five ornate chairs in a circle. One throne is brightly lit and worn smooth from use; the others gather dust in shadow. A single candle beckons from the darkest chair.",
          },
        ],
      },
      {
        name: "The Descent",
        description:
          "Every transformation requires a descent — a journey into the underworld of the psyche where old structures dissolve before new ones can form.",
        theme: "The dark night of the soul",
        retreatLens:
          "The Descent is the most challenging phase of the journey. Interpret with awareness that the seeker may be in a period of dissolution, confusion, or grief. The cards here speak to what is dying, what must be released, and the treasure that can only be found in the depths. This is sacred ground — the breakdown that precedes breakthrough. Hold space without rushing toward resolution.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "Letting Go",
            description:
              "Before descent, there is release. What beliefs, identities, or attachments must be set down before you can go deeper?",
            suggestedIntention:
              "What am I being asked to release right now?",
            waypointLens:
              "Focus on release, surrender, and the courage of letting go. The cards may point to attachments, identities, beliefs, or relationships that have served their purpose. Letting go is not loss — it's making space.",
          },
          {
            name: "The Depths",
            description:
              "In the depths, nothing is certain. This is the place where the old self dissolves before the new one has formed. It requires radical trust.",
            suggestedIntention:
              "What is being revealed to me in this darkness?",
            waypointLens:
              "The seeker is in the underworld — interpret with reverence for not-knowing. The cards speak from the place beyond the ego's maps. Themes: dissolution, uncertainty, the fertile void, trust in the unseen. Do not rush toward meaning — sometimes the card's message is 'stay here a while longer.'",
          },
          {
            name: "The Treasure",
            description:
              "In every myth, the hero finds a treasure in the underworld — the elixir, the golden fleece, the boon. What have you found in your own depths?",
            suggestedIntention:
              "What treasure have I discovered through my struggle?",
            waypointLens:
              "The turning point. Interpret the cards as gifts from the underworld — hard-won wisdom, strength forged in difficulty, new capacities born from crisis. What did the descent reveal that could not have been found on the surface?",
          },
          {
            name: "The Return",
            description:
              "Rising from the depths, you bring the treasure back to the surface world. The return is not going back to who you were — it's arriving as someone new.",
            suggestedIntention:
              "How do I bring what I've learned back into my daily life?",
            waypointLens:
              "The ascent and reintegration. Cards speak to how the seeker can embody their transformation in practical, daily life. The treasure from the depths must be lived, not just understood. Look for bridge themes between inner work and outer action.",
          },
        ],
        obstacleCards: [
          {
            title: "The Premature Ascent",
            meaning: "Rising from the depths before the transformation is complete — bypassing grief, rushing past discomfort, or declaring victory too soon.",
            guidance: "The underworld has its own timing. If you feel the urge to 'get over it,' that's the signal to go deeper, not to leave.",
            imagePrompt: "A figure climbing a rope out of a deep cave, but golden treasures still glow in the unseen depths below. The rope frays where urgency has worn it thin.",
          },
          {
            title: "The Familiar Abyss",
            meaning: "Becoming attached to the darkness — romanticizing suffering or using pain as identity rather than passage.",
            guidance: "The descent is a passage, not a home. When darkness becomes comfortable, it may be avoidance of the return wearing a spiritual disguise.",
            imagePrompt: "A deep, warm cocoon woven from dark silk threads in an underground cavern. Faint light from an opening above is ignored. Comfort and confinement intertwined.",
          },
        ],
      },
      {
        name: "Individuation",
        description:
          "The culmination of the archetypal journey: becoming who you truly are. Not perfect, but whole — integrating all the parts into a unified Self.",
        theme: "Becoming whole",
        retreatLens:
          "This is the culmination retreat. Interpret with awareness of the entire journey the seeker has traveled — from Threshold through Shadow, Inner Council, and Descent. The cards now speak to wholeness, integration, and the emergence of the authentic Self. This is not an ending but a new beginning at a deeper level of awareness. Reference the seeker's journey history wherever Cards Remember provides it.",
        estimatedReadings: 3,
        waypoints: [
          {
            name: "Gathering the Fragments",
            description:
              "All the parts you've met — shadow, archetypes, the treasure from the depths — now want to come together. This waypoint is about recognizing the wholeness that was always there.",
            suggestedIntention:
              "What parts of myself are ready to be reunited?",
            waypointLens:
              "Synthesis and integration. The cards reveal which fragments of the seeker's psyche are ready to be woven together. Look for complementary energies across the spread — opposites that actually belong together.",
          },
          {
            name: "The Sacred Marriage",
            description:
              "The alchemical wedding — the union of opposites within you. Masculine and feminine, light and shadow, thinking and feeling. Wholeness comes from embracing paradox.",
            suggestedIntention:
              "What opposites within me are seeking union?",
            waypointLens:
              "The coniunctio — sacred marriage of opposites. Each card pairing or position reveals a polarity seeking resolution. Not compromise, but transcendence — a third thing that holds both. Interpret with alchemical imagery: the marriage of sun and moon, king and queen, fire and water.",
          },
          {
            name: "The Integrated Self",
            description:
              "You are no longer fragmented. Not because you've eliminated parts, but because you can hold all of them with awareness and love. This is individuation.",
            suggestedIntention:
              "Who am I becoming as I embrace all of who I am?",
            waypointLens:
              "The Self — capital S — is speaking. Interpret the cards as reflections of the seeker's emerging wholeness. What does their integrated self look like? How does it move in the world? This reading should feel like a benediction — honoring the journey traveled and the person who emerged from it.",
          },
        ],
        obstacleCards: [
          {
            title: "The Spiritual Perfectionist",
            meaning: "Treating wholeness as a destination rather than a process — believing you must be 'fully integrated' before you can live fully.",
            guidance: "Individuation is not a final state. You are whole now, and also still becoming. Both are true simultaneously.",
            imagePrompt: "A mosaic being assembled on a table, some pieces perfectly placed and others still scattered. The incomplete mosaic already forms a beautiful image. Golden light falls across it.",
          },
        ],
      },
    ],
  },

  // ── 2. Mindfulness (Present-Moment Awareness) ────────────────────
  {
    name: "Mindfulness",
    description:
      "A progressive journey from basic present-moment awareness through witnessing, impermanence, compassion, and the return to beginner's mind.",
    themes: [
      "present awareness",
      "non-judgment",
      "impermanence",
      "compassion",
      "breath",
      "equanimity",
      "beginner's mind",
    ],
    symbolicVocabulary: [
      "presence",
      "awareness",
      "breath",
      "stillness",
      "witness",
      "spaciousness",
      "non-attachment",
      "equanimity",
      "compassion",
      "impermanence",
      "moment",
      "ground",
      "anchor",
      "refuge",
    ],
    interpretiveLens:
      "Each card is an invitation to presence. Rather than analyzing what cards 'mean,' consider what they ask the seeker to notice right now. Mindfulness is not about achieving a special state — it's about meeting what is already here with curiosity and kindness. The cards become objects of contemplation, mirrors reflecting the seeker's relationship with the present moment.",
    iconKey: "lotus",
    retreats: [
      {
        name: "Arriving Here",
        description:
          "The most radical act is simply arriving — fully landing in this moment, this body, this life. Before any advanced practice, we learn to be here.",
        theme: "Cultivating presence",
        retreatLens:
          "Every card in this retreat speaks to the practice of arriving. What does it mean to be fully present? Where does the seeker's attention wander? The cards are not predictions but invitations to notice — to pause, breathe, and be exactly where you are. Keep interpretations grounded and body-centered.",
        estimatedReadings: 3,
        waypoints: [
          {
            name: "The Pause",
            description:
              "Before you can be present, you must first pause. Stop the momentum of doing and simply be. This waypoint is about the sacred art of stopping.",
            suggestedIntention:
              "What happens when I stop and simply notice?",
            waypointLens:
              "The cards invite stillness. What do they reveal when the seeker stops striving, planning, fixing? Interpret through the lens of rest, pause, and the wisdom of non-doing. What becomes visible only when you stop moving?",
          },
          {
            name: "Anchoring in Breath",
            description:
              "The breath is always here, always now. Learning to anchor awareness in the breath is the foundation of all mindfulness practice.",
            suggestedIntention:
              "What does my breath want me to notice today?",
            waypointLens:
              "Read with attention to rhythm, flow, and the body. The breath connects inner and outer, conscious and unconscious. Cards speak to what the seeker's body knows that their mind hasn't caught up with. Keep the interpretation rooted in sensation and somatic wisdom.",
          },
          {
            name: "Body as Home",
            description:
              "For many of us, the body is the last place we want to be. This waypoint is about reclaiming the body as a safe and sacred home for awareness.",
            suggestedIntention:
              "What is my body holding that I haven't been listening to?",
            waypointLens:
              "Somatic mindfulness. Each card points to a bodily experience — tension, ease, energy, numbness. Where does the seeker live in their body? Where have they checked out? Interpret through embodiment, sensation, and the intelligence of the physical form.",
          },
        ],
        obstacleCards: [
          {
            title: "The Busy Mind",
            meaning: "Addiction to mental activity — filling every moment with thoughts, plans, or analysis to avoid the simplicity of being present.",
            guidance: "Busyness is not productivity; it's often avoidance. Notice the gap between thoughts. It's already there, waiting.",
            imagePrompt: "A whirlwind of glowing symbols, words, and geometric shapes swirling around a calm center. In the eye of the storm, a single lotus bud waits untouched.",
          },
          {
            title: "The Escape Hatch",
            meaning: "Habitual avoidance of the present moment — reaching for phone, fantasy, substance, or distraction whenever stillness appears.",
            guidance: "Notice the reaching. Before you grab the distraction, feel what you're trying to escape. That feeling is the doorway.",
            imagePrompt: "A translucent door floating in a peaceful garden, leading to a chaotic marketplace of lights and noise. Wildflowers bloom on the garden side, unnoticed.",
          },
        ],
      },
      {
        name: "The Witnessing Eye",
        description:
          "Beyond reacting to experience, there is the capacity to simply witness it. This retreat develops the observer — the part of you that can watch thoughts and emotions without being swept away.",
        theme: "Developing the observer",
        retreatLens:
          "These readings develop the seeker's capacity to observe without reacting. Each card is an opportunity to practice witnessing — seeing clearly without grasping or pushing away. The interpretive tone should model non-reactive awareness: noticing, acknowledging, allowing. Help the seeker distinguish between experiencing an emotion and being consumed by it.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "Watching Thoughts",
            description:
              "Thoughts are not facts. They are events in the mind — clouds passing through the sky of awareness. This waypoint practices watching the thought-stream without jumping in.",
            suggestedIntention:
              "What thought patterns are running beneath my awareness?",
            waypointLens:
              "The cards reveal the seeker's mental patterns — recurring narratives, beliefs, and inner dialogue. Interpret as a gentle mirror: 'Notice this thought pattern. You don't have to believe it or fight it. Just see it.' Emphasize the gap between thinking and awareness of thinking.",
          },
          {
            name: "Emotional Weather",
            description:
              "Emotions are like weather — they arise, intensify, and pass. This waypoint practices being present with emotions without trying to fix, suppress, or extend them.",
            suggestedIntention:
              "What emotion is asking for my attention without my reaction?",
            waypointLens:
              "Interpret the cards as emotional weather reports. What climate is the seeker experiencing? Name the emotions the cards evoke with precision and gentleness. Normalize the full range — there are no bad emotions, only ones that haven't been met with awareness.",
          },
          {
            name: "Non-Judgment",
            description:
              "The hardest practice: to see clearly without immediately evaluating. Not good or bad, right or wrong — just this, as it is.",
            suggestedIntention:
              "Where am I judging myself or my experience most harshly?",
            waypointLens:
              "The most challenging waypoint. Interpret with radical acceptance. Where does the seeker's inner critic show up in the cards? Model non-judgmental awareness in the interpretation itself — describe what the cards show without evaluating it as good or bad.",
          },
          {
            name: "Spacious Awareness",
            description:
              "When judgment drops and witnessing deepens, awareness itself becomes spacious. You become the sky, not the weather.",
            suggestedIntention:
              "What opens up when I stop trying to control my experience?",
            waypointLens:
              "Expansiveness and openness. The cards point toward the spacious quality of pure awareness. Interpret with a sense of vastness — the seeker is not their thoughts, emotions, or circumstances. They are the awareness in which all of these arise and pass.",
          },
        ],
        obstacleCards: [
          {
            title: "The Spiritual Achiever",
            meaning: "Turning meditation and awareness into another performance metric — striving for 'better' mindfulness instead of simply being.",
            guidance: "There is no trophy for the best observer. When you notice yourself grading your practice, that noticing IS the practice.",
            imagePrompt: "A golden trophy cup sitting on a meditation cushion, reflecting the meditator's frustrated face. Around it, incense smoke curls peacefully, indifferent to achievement.",
          },
        ],
      },
      {
        name: "Impermanence",
        description:
          "Everything changes. This retreat sits with the most fundamental truth of existence — that nothing lasts — and discovers that impermanence is not a tragedy but the source of all beauty.",
        theme: "Sitting with change",
        retreatLens:
          "Interpret every card through the lens of change, flow, and impermanence. What is arising? What is passing? What does the seeker cling to? The goal is not to accept impermanence intellectually but to feel it — to let the cards become doorways into the bittersweet beauty of a world where nothing stays and everything matters because it's temporary.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "What Is Passing",
            description:
              "Look around your life right now. What is already in the process of ending, changing, or fading? This waypoint asks you to notice the departures.",
            suggestedIntention:
              "What in my life is naturally completing or changing?",
            waypointLens:
              "The cards reveal what is in transition — endings, completions, natural cycles reaching their conclusion. Interpret without mourning or celebrating — simply noticing what is passing with clear, compassionate eyes.",
          },
          {
            name: "Grief and Release",
            description:
              "Impermanence brings grief. This waypoint creates space to grieve — not just losses, but the constant small deaths that awareness of impermanence reveals.",
            suggestedIntention:
              "What grief am I carrying that I haven't fully honored?",
            waypointLens:
              "Hold space for loss and letting go. The cards may surface grief that the seeker hasn't acknowledged — not just big losses, but the subtle grief of time passing, youth fading, relationships changing. Interpret with tenderness and the understanding that grief is love with nowhere to go.",
          },
          {
            name: "The Beauty of Transience",
            description:
              "The cherry blossom is beautiful precisely because it falls. Impermanence is not the enemy of meaning — it is the source of it.",
            suggestedIntention:
              "What becomes more precious when I remember it won't last forever?",
            waypointLens:
              "The turn toward beauty. Interpret the cards through the Japanese concept of mono no aware — the bittersweet awareness of passing things. What is beautiful because it's fleeting? What does the seeker cherish more fiercely because they know it will change?",
          },
          {
            name: "Finding Stillness in Flow",
            description:
              "Within the constant movement of change, there is a stillness that doesn't depend on things staying the same. This waypoint discovers the unmoving center.",
            suggestedIntention:
              "What remains still and true even as everything around me changes?",
            waypointLens:
              "Paradox: stillness within flow. The cards reveal what is enduring in the seeker's experience — not permanent things, but the awareness itself that witnesses change. What is the still point around which the seeker's life turns?",
          },
        ],
        obstacleCards: [
          {
            title: "The Clinging Hand",
            meaning: "Grasping at what is passing — refusing to release relationships, phases, or versions of self that have completed their season.",
            guidance: "Open your hand. What leaves was never yours to keep. What stays does so freely, and that is the deeper gift.",
            imagePrompt: "A hand gripping a handful of autumn leaves, some crumbling to golden dust between the fingers. Below, a stream carries petals peacefully into the distance.",
          },
        ],
      },
      {
        name: "Compassion's Gate",
        description:
          "Mindfulness without compassion becomes cold observation. This retreat opens the heart — beginning with self-compassion and expanding outward to encompass all beings.",
        theme: "Opening the heart",
        retreatLens:
          "The heart retreat. Every card should be interpreted through the lens of compassion — for the seeker themselves, for the people in their life, and for the shared human condition. Interpretations should model warmth and tender-heartedness. Where does the seeker need to soften? Where are they already more compassionate than they realize?",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "Self-Compassion",
            description:
              "Can you offer yourself the same kindness you'd offer a dear friend? Self-compassion is not self-indulgence — it's the foundation of all genuine compassion.",
            suggestedIntention:
              "Where do I most need to be kinder to myself?",
            waypointLens:
              "Direct the interpretation toward self-kindness. Where is the seeker harsh with themselves? What would they say to a friend in their situation? The cards reveal the seeker's relationship with self-forgiveness and self-acceptance.",
          },
          {
            name: "Empathy as Practice",
            description:
              "Empathy is not a trait you either have or don't. It's a practice — a deliberate choice to enter another's experience with openness and curiosity.",
            suggestedIntention:
              "Whose experience am I being invited to understand more deeply?",
            waypointLens:
              "Expand awareness outward. The cards may point to relationships, conflicts, or connections where the seeker is being invited to deepen their empathy. Interpret with attention to perspective-taking — what would these cards mean from someone else's point of view?",
          },
          {
            name: "Forgiveness",
            description:
              "Forgiveness is not condoning harm. It's releasing the burden of carrying resentment. This waypoint explores what is ready to be forgiven — in others and in yourself.",
            suggestedIntention:
              "What burden of resentment am I ready to set down?",
            waypointLens:
              "The cards speak to grudges, resentments, and the possibility of release. Interpret with nuance — forgiveness doesn't mean forgetting or reconciling. It means choosing freedom over the weight of old anger. What would the seeker's life look like without this burden?",
          },
          {
            name: "Loving-Kindness",
            description:
              "Metta — the practice of extending unconditional goodwill to all beings, starting with yourself and radiating outward in ever-wider circles.",
            suggestedIntention:
              "How can I extend more genuine goodwill into the world?",
            waypointLens:
              "The broadest compassion. Interpret the cards as invitations to extend loving-kindness — to the seeker themselves, to loved ones, to neutral people, to difficult people, and to all beings. The reading should feel like a metta meditation: warm, expansive, and unconditionally kind.",
          },
        ],
        obstacleCards: [
          {
            title: "The Hardened Heart",
            meaning: "Closing down in the face of pain — building walls around the heart in the name of self-protection, cutting off empathy.",
            guidance: "A heart that cannot be broken is a heart that cannot feel. Let the cracks stay open; that's where the light enters.",
            imagePrompt: "A stone fortress shaped like a human heart, with thick walls and a sealed iron gate. Through tiny cracks in the masonry, warm golden light streams outward into the dark.",
          },
        ],
      },
      {
        name: "Beginner's Mind",
        description:
          "After all this practice, the deepest insight is realizing you know nothing. Beginner's mind is not ignorance — it's the expert's humility, the willingness to see everything as if for the first time.",
        theme: "Returning to wonder",
        retreatLens:
          "The paradox of the final retreat: after the entire mindfulness journey, we return to not-knowing. Interpret with freshness and wonder, as if the seeker is encountering these card symbols for the very first time. Drop expertise and accumulated meaning. What do the cards show when we look with completely fresh eyes? This retreat celebrates the ordinary as extraordinary.",
        estimatedReadings: 3,
        waypoints: [
          {
            name: "Unknowing",
            description:
              "In the beginner's mind there are many possibilities. In the expert's mind there are few. This waypoint practices the art of not-knowing.",
            suggestedIntention:
              "What certainty am I ready to release in exchange for curiosity?",
            waypointLens:
              "Interpret from a place of genuine not-knowing. Instead of definitive meanings, offer questions. Instead of answers, offer wonder. The cards become koans — not puzzles to solve but invitations to sit with mystery.",
          },
          {
            name: "Fresh Eyes",
            description:
              "See the familiar as if encountering it for the first time. Your morning coffee, your daily commute, the face of someone you love — all miracles, if you look with fresh eyes.",
            suggestedIntention:
              "What in my everyday life am I taking for granted?",
            waypointLens:
              "Interpret the cards as invitations to see the ordinary with fresh wonder. What is the seeker overlooking because it's become too familiar? The most profound insights often come from really seeing what has been right in front of us all along.",
          },
          {
            name: "The Ordinary Sacred",
            description:
              "The sacred is not somewhere else. It is here — in the washing of dishes, the changing of seasons, the breath that keeps arriving without being asked. This is the ultimate insight of mindfulness.",
            suggestedIntention:
              "Where is the sacred hiding in my ordinary life?",
            waypointLens:
              "The culmination of the mindfulness path. Interpret with awareness that every card, every symbol, every moment is already sacred. There is nowhere to go and nothing to achieve. The cards celebrate the seeker's journey and point them back to the miracle of this present moment.",
          },
        ],
        obstacleCards: [
          {
            title: "The Expert's Burden",
            meaning: "Accumulated knowledge becoming a barrier — 'I already know this' closing the door on genuine discovery.",
            guidance: "Every moment you've 'been here before' is actually the first time this exact moment has occurred. Can you meet it that way?",
            imagePrompt: "A towering stack of ancient books blocking a window. Beyond the books, visible through gaps in the pages, a sunrise paints the sky in colors no book has ever described.",
          },
        ],
      },
    ],
  },

  // ── 3. Mysticism (Direct Experience of the Transcendent) ──────────
  {
    name: "Mysticism",
    description:
      "Journey toward direct experience of the transcendent — through thin places, contemplative practice, the dark night, sacred union, and the return to embodied life.",
    themes: [
      "union",
      "contemplation",
      "dark night",
      "sacred geometry",
      "theosis",
      "transcendence",
      "mystery",
    ],
    symbolicVocabulary: [
      "the numinous",
      "thin place",
      "contemplation",
      "the Beloved",
      "dark night",
      "surrender",
      "grace",
      "unio mystica",
      "theosis",
      "via negativa",
      "kenosis",
      "sacred",
      "mystery",
      "luminous darkness",
    ],
    interpretiveLens:
      "The cards are not tools for understanding — they are gateways to the Mystery itself. In the mystical tradition, the ultimate reality cannot be named, only pointed toward. Each card is a finger pointing at the moon. Interpret with reverence for what cannot be put into words, drawing on the language of mystics across traditions: Rumi, Meister Eckhart, Teresa of Avila, the Upanishads. Let the interpretation be an encounter, not an explanation.",
    iconKey: "flame",
    retreats: [
      {
        name: "The Veil",
        description:
          "There are places and moments where the boundary between the visible and invisible worlds grows thin. This retreat sensitizes you to the veil — and to the whispers that come through it.",
        theme: "Sensing what lies beyond",
        retreatLens:
          "Interpret the cards as messages from the liminal space between worlds. What is the seeker sensing at the edge of perception? What signs and synchronicities are trying to reach them? The veil is not a barrier to tear down but a membrane to attune to. Read with attention to mystery, intuition, and the numinous — the feeling that something is present beyond what the eyes can see.",
        estimatedReadings: 3,
        waypoints: [
          {
            name: "Thin Places",
            description:
              "The Celts spoke of 'thin places' — locations where the distance between heaven and earth is shorter. But thin places are also thin moments, thin relationships, thin experiences.",
            suggestedIntention:
              "Where in my life is the veil between worlds thinnest?",
            waypointLens:
              "The cards point to where the seeker's life is most transparent to the sacred. This might be a place, a relationship, a practice, or a state of mind. Interpret with the Celtic sense of liminality — the in-between places where something more is palpable.",
          },
          {
            name: "Signs and Synchronicities",
            description:
              "The universe speaks in pattern, symbol, and coincidence. This waypoint attunes you to the language of synchronicity — meaningful coincidences that hint at a deeper order.",
            suggestedIntention:
              "What patterns or synchronicities am I being asked to pay attention to?",
            waypointLens:
              "Interpret through the lens of synchronicity and symbolic language. The cards themselves are synchronicities — drawn in this moment, for this question, in this order. What patterns connect them? What is the universe (or the unconscious) trying to communicate through these particular symbols appearing together?",
          },
          {
            name: "The Sacred Question",
            description:
              "Every mystical journey begins with a question that cannot be answered but must be lived. What is your sacred question — the one that burns at the center of your seeking?",
            suggestedIntention:
              "What is the deepest question my soul is asking?",
            waypointLens:
              "The cards reveal not answers but the seeker's deepest question — the one that animates their seeking. In mysticism, the question is more important than the answer. Interpret as an excavation of the seeker's core spiritual longing. What are they really looking for beneath all the surface-level questions?",
          },
        ],
        obstacleCards: [
          {
            title: "The Meaning-Maker",
            meaning: "Forcing every experience into a spiritual narrative — demanding signs, interpreting everything as a message, unable to let mystery be mystery.",
            guidance: "Not every coincidence is a sign. Sometimes the deepest mystical act is letting things be exactly what they are, without needing them to mean something.",
            imagePrompt: "Hands arranging constellation maps over a starry sky, drawing lines between stars that resist connection. Some stars glow brighter when left unnamed and unconnected.",
          },
          {
            title: "The Hungry Ghost",
            meaning: "Craving peak experiences — chasing visions, altered states, and spiritual highs instead of integrating the quiet revelations of ordinary awareness.",
            guidance: "The veil doesn't part on demand. It opens to those who wait without demanding, and closes on those who grasp.",
            imagePrompt: "A translucent figure reaching through a shimmering curtain, grasping at dancing lights that slip through its fingers. Behind it, a steady warm glow illuminates the ground it ignores.",
          },
        ],
      },
      {
        name: "Contemplation",
        description:
          "Beyond thinking about the divine is the practice of resting in the divine. Contemplation is the art of inner seeing — letting go of words, concepts, and effort to simply be present to What Is.",
        theme: "Practices of inner seeing",
        retreatLens:
          "These readings support the seeker's contemplative practice. Interpret with spaciousness and silence — leave room for mystery. The cards are contemplative objects, not information sources. What happens when the seeker simply rests with these images and symbols without trying to figure them out? Let the interpretation model contemplation: slow, reverent, comfortable with not-knowing.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "Silence as Language",
            description:
              "Silence is not the absence of speech. It is a language — the language in which the divine communicates. This waypoint practices listening to what silence says.",
            suggestedIntention:
              "What is the silence trying to tell me?",
            waypointLens:
              "Interpret through silence and negative space. What is not being said? What do the gaps between the cards reveal? In contemplative tradition, God speaks in silence. The most important part of this reading may be what is absent, implied, or felt rather than stated.",
          },
          {
            name: "The Inner Light",
            description:
              "Across traditions — Quaker inner light, Hindu atman, Buddhist buddha-nature — there is a recognition that the divine light dwells within. This waypoint turns inward to find it.",
            suggestedIntention:
              "What inner light am I being called to trust?",
            waypointLens:
              "The cards illuminate the seeker's inner radiance. Interpret through the tradition of the indwelling divine — the spark, the atman, the Christ within, the buddha-nature. What is luminous in the seeker? Where do they shine without realizing it? Draw from mystical traditions that celebrate the divine within the human.",
          },
          {
            name: "Sacred Darkness",
            description:
              "In the mystical tradition, darkness is not evil but fertile — the womb from which all light is born. 'The divine dark' of Dionysius the Areopagite. The dark that is too much light for human eyes.",
            suggestedIntention:
              "What sacred darkness am I being invited to enter?",
            waypointLens:
              "Via negativa — the way of darkness and unknowing. Interpret the 'darker' cards as portals to deeper knowledge. In this tradition, darkness is not the absence of God but the overwhelming presence that blinds. What the seeker cannot see may be the most sacred thing in the reading.",
          },
          {
            name: "Prayer Without Words",
            description:
              "Beyond petition, beyond praise, there is a prayer that is simply being — an open, wordless turning toward the Source. This is centering prayer, dhyana, zikr without tongue.",
            suggestedIntention:
              "What prayer is my life praying without words?",
            waypointLens:
              "The cards as wordless prayer. Interpret with the understanding that the seeker's entire life is a prayer — their actions, their longings, their suffering, their joy. What is the prayer their life is praying? Move beyond language into the territory of pure intention and presence.",
          },
        ],
        obstacleCards: [
          {
            title: "The Noisy Temple",
            meaning: "Filling contemplative space with spiritual content — reading, studying, discussing instead of simply being present in silence.",
            guidance: "Put down the book. The silence you're avoiding is the teaching you're seeking.",
            imagePrompt: "An ancient temple interior with towering bookshelves blocking the windows. In the center, an empty cushion glows softly where sunlight finds its way through a crack between the books.",
          },
        ],
      },
      {
        name: "The Dark Night",
        description:
          "St. John of the Cross named it: the dark night of the soul — when the familiar lights go out, when God seems absent, when spiritual practices feel hollow. It is not punishment but purification.",
        theme: "Purification through unknowing",
        retreatLens:
          "The most demanding retreat on the mystical path. The seeker may be experiencing spiritual dryness, doubt, or the collapse of their spiritual framework. Interpret with the knowledge that the dark night is not failure — it is a sign of deepening. The soul is being purified of attachment to spiritual consolation. The cards speak from the void, and the void is sacred. Do not offer false comfort. Hold the darkness with the seeker.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "Loss of Certainty",
            description:
              "What you were sure about — your beliefs, your experience of the sacred, your spiritual identity — begins to crumble. This is terrifying and necessary.",
            suggestedIntention:
              "What spiritual certainty is crumbling, and what does that make possible?",
            waypointLens:
              "The cards reflect the dissolution of spiritual certainty. Interpret without trying to rebuild what is falling. The loss of certainty is itself a gateway. What the seeker believed about God, the universe, or themselves is being dismantled — not destroyed, but refined. Let the cards honor the courage this requires.",
          },
          {
            name: "The Void",
            description:
              "When all frameworks collapse, there is the void — sunyata, the abyss, the cloud of unknowing. It is not nothing. It is the pregnant emptiness from which all things arise.",
            suggestedIntention:
              "What do I discover when I stop trying to fill the emptiness?",
            waypointLens:
              "Interpret from the void itself. The cards speak from emptiness — not nihilistic emptiness, but the pregnant void that mystics across traditions describe as the ground of being. Let the interpretation be comfortable with spaciousness, open-endedness, and the absence of neat conclusions.",
          },
          {
            name: "Surrender",
            description:
              "Surrender is not giving up. It is giving over — releasing the need to control, understand, or direct the spiritual journey. 'Not my will but thine.'",
            suggestedIntention:
              "What am I still trying to control that wants to be surrendered?",
            waypointLens:
              "The cards reveal what the seeker is still gripping. Interpret through the lens of kenosis — self-emptying. What needs to be surrendered is not always obvious. Sometimes it's spiritual ambition itself, the desire for enlightenment, the need to be 'spiritual.' True surrender is letting go of even the desire to let go.",
          },
          {
            name: "Grace in Absence",
            description:
              "The paradox of the dark night: grace is most present when it feels most absent. The emptiness itself is the gift. The seeking itself is the finding.",
            suggestedIntention:
              "Where is grace already present in what feels like absence?",
            waypointLens:
              "The turning point of the dark night. Interpret the cards as evidence of grace operating in the darkness. What the seeker thinks is absence is actually a more refined presence. The fact that they notice the absence of the sacred proves their connection to it. Let the reading be a gentle revelation that grace has been here all along.",
          },
        ],
        obstacleCards: [
          {
            title: "The False Dawn",
            meaning: "Mistaking spiritual bypassing for emergence — declaring the dark night over before the purification is complete, grasping at premature light.",
            guidance: "Real dawn arrives on its own. If you have to convince yourself it's morning, it's still night. Stay. The true light will be unmistakable.",
            imagePrompt: "A horizon where artificial lights mimic a sunrise, but the true sky remains dark with stars. A path leads past the false glow toward genuine dawn barely visible at the edge.",
          },
          {
            title: "The Spiritual Emergency Exit",
            meaning: "Abandoning the path entirely when the sacred feels absent — concluding that faith was foolish, practice was pointless, the journey a mistake.",
            guidance: "The desire to quit IS the dark night doing its work. This is not the end of faith — it's faith being refined in fire.",
            imagePrompt: "A glowing EXIT sign mounted in a cavernous dark space. The light from the sign illuminates the walls, revealing intricate ancient paintings that can only be seen in this darkness.",
          },
        ],
      },
      {
        name: "Sacred Union",
        description:
          "The mystic's goal: union with the Beloved — the dissolution of the boundary between self and the divine, between lover and Beloved, between drop and ocean.",
        theme: "Dissolving boundaries",
        retreatLens:
          "The ecstatic retreat. Interpret with the passion of Rumi, the intimacy of Song of Songs, the non-dual awareness of the Upanishads. The cards speak to the dissolution of separateness and the recognition that the seeker and the Sought are one. This is not abstract philosophy but lived experience — the taste of union that mystics across all traditions describe in remarkably similar terms.",
        estimatedReadings: 4,
        waypoints: [
          {
            name: "Self and Other",
            description:
              "The first boundary to dissolve: the hard line between self and other. In moments of deep connection — with a person, with nature, with a piece of music — the boundary softens.",
            suggestedIntention:
              "Where is the boundary between me and the world becoming transparent?",
            waypointLens:
              "The cards reveal where separateness is dissolving. Interpret through the lens of interconnection — where does the seeker end and the world begin? Look for cards that speak to relationship, resonance, and the porousness of the self. The mystical insight is not that we become nothing, but that we are everything.",
          },
          {
            name: "Above and Below",
            description:
              "As above, so below. The hermetic principle of correspondence — what happens in the heavens is mirrored on earth, what happens within is mirrored without.",
            suggestedIntention:
              "How does my inner world mirror the world around me?",
            waypointLens:
              "Interpret through correspondence and mirroring. The cards reveal how the seeker's inner landscape reflects and shapes their outer experience. What is happening 'above' (in spirit, in consciousness) is being played out 'below' (in daily life, in the body). Let the reading illuminate these mirror relationships.",
          },
          {
            name: "The Beloved",
            description:
              "In Sufi tradition, the divine is the Beloved — the one the heart longs for, the face behind every face, the love beneath all loves. This waypoint explores the seeker's relationship with the Beloved.",
            suggestedIntention:
              "What is the face of the Beloved I am seeking?",
            waypointLens:
              "The most intimate waypoint. Interpret with the language of divine love — Rumi, Hafiz, John of the Cross, Mirabai. The cards reveal the seeker's relationship with the ultimate Beloved — not a distant God but the intimate presence at the heart of all love. Every human love is a echo of this one love.",
          },
          {
            name: "Unio Mystica",
            description:
              "The mystical union — the drop returning to the ocean. Not annihilation but realization: you were never separate. The wave discovers it has always been the sea.",
            suggestedIntention:
              "What would change if I truly knew I was never separate?",
            waypointLens:
              "The pinnacle of mystical experience. Interpret with non-dual awareness. The cards do not point to something separate from the seeker — they are the seeker seeing themselves. The reading itself becomes a moment of union. Let the language dissolve subject-object boundaries: not 'the card means this about you' but 'you and the card are reflecting the same light.'",
          },
        ],
        obstacleCards: [
          {
            title: "The Spiritual Ego",
            meaning: "The ego co-opting the journey of dissolution — 'I am one with everything' becoming another identity to defend rather than a lived reality.",
            guidance: "The one who claims union is not united. True oneness has no one left to announce it. Let the experience be, without owning it.",
            imagePrompt: "A radiant figure standing on a mountaintop, arms wide, casting a shadow that reveals a smaller figure clutching a crown. The mountain itself dissolves into light at the edges.",
          },
        ],
      },
      {
        name: "The Return",
        description:
          "The mystic who stays on the mountaintop serves no one. The final retreat is the return — bringing the vision of unity back into the world of form, relationship, and daily life.",
        theme: "Bringing vision into the world",
        retreatLens:
          "The final retreat brings the mystical vision down from the mountain. Interpret with attention to embodiment, service, and the integration of transcendent experience with ordinary life. The cards speak to how the seeker can live their mystical insight — not in retreat from the world but in full, passionate engagement with it. The highest mysticism looks like ordinary life, lived with extraordinary awareness.",
        estimatedReadings: 3,
        waypoints: [
          {
            name: "Integration",
            description:
              "How do you integrate an experience of unity into a world of multiplicity? How do you hold the vision of oneness while paying bills, having arguments, and navigating the complexity of human life?",
            suggestedIntention:
              "How do I carry my deepest knowing into my daily life?",
            waypointLens:
              "Bridge the transcendent and the mundane. The cards reveal where the seeker's mystical experience meets their ordinary life. Where does unity consciousness show up at the grocery store? How does the dark night inform their parenting? Integration means not two lives (spiritual and worldly) but one seamless life.",
          },
          {
            name: "Embodied Wisdom",
            description:
              "True wisdom lives in the body, not just the mind. The mystic who has returned knows the sacred in the taste of bread, the warmth of sunlight, the ache of tired muscles.",
            suggestedIntention:
              "Where is wisdom asking to be lived through my body and actions?",
            waypointLens:
              "Ground the interpretation in the body and the senses. After the heights of mystical experience, the cards call the seeker back into flesh, sensation, and the physical world. Wisdom that stays in the head is incomplete. How does the seeker's body carry their knowing? What does embodied spirituality look like for them?",
          },
          {
            name: "Service as Path",
            description:
              "The mystic returns to serve. Not from obligation but from the overflow of love. When you know that all beings are one being, service is not sacrifice — it is recognition.",
            suggestedIntention:
              "How am I being called to serve from the fullness of what I've received?",
            waypointLens:
              "The culmination of the mystical path. Interpret the cards as invitations to service — not duty-driven service but service that flows from the mystic's realization of unity. How does the seeker's journey equip them to serve? What gift are they being asked to bring back to the world? Let the reading be a commissioning — a sacred sending-forth.",
          },
        ],
        obstacleCards: [
          {
            title: "The Mountaintop Exile",
            meaning: "Preferring transcendence over engagement — using spiritual realization as a reason to withdraw from the messy, beautiful, imperfect world.",
            guidance: "The highest teaching is chopping wood and carrying water. If your realization doesn't work at the grocery store, it's not complete.",
            imagePrompt: "A glowing figure sitting in meditation atop a crystal mountain, while far below a village full of warm lights and open doors awaits. A winding path connects them, overgrown but passable.",
          },
        ],
      },
    ],
  },
];

// ── Seed execution ──────────────────────────────────────────────────

async function seed() {
  console.log("Seeding paths, retreats, and waypoints...\n");

  for (let pathIndex = 0; pathIndex < PATHS.length; pathIndex++) {
    const pathData = PATHS[pathIndex];
    const pathId = createId();

    await db.insert(schema.paths).values({
      id: pathId,
      name: pathData.name,
      description: pathData.description,
      themes: pathData.themes,
      symbolicVocabulary: pathData.symbolicVocabulary,
      interpretiveLens: pathData.interpretiveLens,
      isPreset: true,
      isPublic: true,
      iconKey: pathData.iconKey,
      sortOrder: pathIndex,
    });

    console.log(`  Path: ${pathData.name} (${pathId})`);

    for (
      let retreatIndex = 0;
      retreatIndex < pathData.retreats.length;
      retreatIndex++
    ) {
      const retreatData = pathData.retreats[retreatIndex];
      const retreatId = createId();

      await db.insert(schema.retreats).values({
        id: retreatId,
        pathId,
        name: retreatData.name,
        description: retreatData.description,
        theme: retreatData.theme,
        sortOrder: retreatIndex,
        retreatLens: retreatData.retreatLens,
        estimatedReadings: retreatData.estimatedReadings,
      });

      console.log(`    Retreat: ${retreatData.name} (${retreatId})`);

      for (
        let waypointIndex = 0;
        waypointIndex < retreatData.waypoints.length;
        waypointIndex++
      ) {
        const waypointData = retreatData.waypoints[waypointIndex];
        const waypointId = createId();

        await db.insert(schema.waypoints).values({
          id: waypointId,
          retreatId,
          name: waypointData.name,
          description: waypointData.description,
          sortOrder: waypointIndex,
          suggestedIntention: waypointData.suggestedIntention,
          waypointLens: waypointData.waypointLens,
        });

        console.log(`      Waypoint: ${waypointData.name}`);
      }

      // Insert seed obstacle cards for this retreat
      if (retreatData.obstacleCards && retreatData.obstacleCards.length > 0) {
        for (let cardIndex = 0; cardIndex < retreatData.obstacleCards.length; cardIndex++) {
          const cardData = retreatData.obstacleCards[cardIndex];
          await db.insert(schema.retreatCards).values({
            id: createId(),
            retreatId,
            cardType: "obstacle",
            source: "seed",
            title: cardData.title,
            meaning: cardData.meaning,
            guidance: cardData.guidance,
            imagePrompt: cardData.imagePrompt,
            imageStatus: "pending",
            sortOrder: cardIndex,
            userId: null,
          });
          console.log(`      Obstacle Card: ${cardData.title}`);
        }
      }
    }

    console.log();
  }

  // Count totals
  let totalRetreats = 0;
  let totalWaypoints = 0;
  let totalObstacleCards = 0;
  for (const path of PATHS) {
    totalRetreats += path.retreats.length;
    for (const retreat of path.retreats) {
      totalWaypoints += retreat.waypoints.length;
      totalObstacleCards += retreat.obstacleCards?.length ?? 0;
    }
  }

  console.log(
    `Done! Seeded ${PATHS.length} paths, ${totalRetreats} retreats, ${totalWaypoints} waypoints, ${totalObstacleCards} obstacle cards.`
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
