// Hardcoded data for the Path Journey mock — sourced from seed-paths.ts

export interface MockWaypoint {
  id: string;
  name: string;
  description: string;
  suggestedIntention: string;
  waypointLens: string;
  lyraGuidance: string;
  decorationIcon: "archway" | "mirror" | "cliff";
  requiredReadings: number;
}

export interface MockRetreat {
  id: string;
  name: string;
  description: string;
  theme: string;
  retreatLens: string;
  suggestedIntention: string;
  waypoints: MockWaypoint[];
}

export interface MockPath {
  id: string;
  name: string;
  description: string;
  themes: string[];
  interpretiveLens: string;
}

// ── The Archetypal Path — first retreat "The Threshold" ────────────────

export const MOCK_PATH: MockPath = {
  id: "path_archetypal",
  name: "Archetypal",
  description:
    "Explore the universal patterns of the psyche through Jungian archetypes, shadow work, and the journey toward wholeness.",
  themes: ["Self-discovery", "Shadow work", "Individuation"],
  interpretiveLens:
    "Interpret cards through the lens of Jungian archetypes and the journey toward psychological wholeness.",
};

export const MOCK_RETREAT: MockRetreat = {
  id: "retreat_threshold",
  name: "The Threshold",
  description:
    "The journey begins with awareness. Before you can transform, you must see where you stand — the masks you wear, the stories you tell yourself, and the quiet call to something deeper.",
  theme: "Self-awareness and the call to inner work",
  suggestedIntention: "To see myself more clearly and honor what I find",
  retreatLens:
    "This retreat focuses on the initial awakening — recognizing the call to inner work and beginning to see oneself clearly.",
  waypoints: [
    {
      id: "wp_acknowledging_call",
      name: "Acknowledging the Call",
      description:
        "Something is stirring. A restlessness, a question that won't quiet. This waypoint invites you to name what is calling you inward.",
      suggestedIntention: "What is calling me to look deeper right now?",
      waypointLens:
        "Focus on what is emerging in the seeker's awareness — the unnamed feeling, the recurring thought, the sense that something is shifting.",
      lyraGuidance:
        "I sense something stirring within you — a whisper from the depths, a pull toward something unnamed. Let us begin here, at the threshold of awareness. The cards will help you give voice to what is calling.",
      decorationIcon: "archway",
      requiredReadings: 1,
    },
    {
      id: "wp_meeting_persona",
      name: "Meeting Your Persona",
      description:
        "The persona is the mask we show the world. Here you examine the roles you play and the face you present — not to discard them, but to see them clearly.",
      suggestedIntention: "What mask am I wearing that no longer fits?",
      waypointLens:
        "Interpret through the lens of social identity and performed self. Which cards reveal the seeker's public face? Where is the gap between persona and authentic self?",
      lyraGuidance:
        "We all wear masks — some chosen, some inherited. Today we examine the face you show the world. Not to judge it, but to see it clearly. The cards will reflect back what lies beneath the surface you present.",
      decorationIcon: "mirror",
      requiredReadings: 1,
    },
    {
      id: "wp_mirrors_edge",
      name: "The Mirror's Edge",
      description:
        "Standing at the mirror's edge means being willing to see yourself as you truly are — not the idealized version, not the feared version, but the real one.",
      suggestedIntention: "What truth about myself am I ready to see?",
      waypointLens:
        "The cards here act as mirrors. Emphasize honest self-reflection without judgment. Look for what the seeker might be avoiding or what they're ready to acknowledge.",
      lyraGuidance:
        "You have arrived at the edge — the place where pretense falls away and truth becomes visible. This is brave ground. The cards you draw here will show you not who you wish to be, nor who you fear being, but who you are. Are you ready?",
      decorationIcon: "cliff",
      requiredReadings: 1,
    },
  ],
};

// ── Mock interpretation texts per waypoint ─────────────────────────────

export const MOCK_INTERPRETATIONS: Record<number, string> = {
  0: `The cards speak of an awakening that has been building quietly beneath the surface.

**The Mirror** in the center position reveals that your inner world is calling for honest examination. Something you once took for granted — a belief, a pattern, a way of being — is asking to be seen with fresh eyes.

**The Wanderer** suggests this call to look deeper is not a crisis but an invitation. You are being drawn toward a journey of self-discovery, one that begins not with dramatic action but with quiet attention.

**The Oracle** confirms that the wisdom you seek is already within you. The call you're hearing is your own deeper knowing, rising to the surface. Trust what stirs — it knows the way.

Together, these cards paint a portrait of someone standing at a doorway they've been approaching for some time. The threshold is here. You need only step through.`,

  1: `The cards reveal the masks with startling clarity today.

**The Guardian** stands at the center, showing the protective persona you've built — strong, capable, always in control. This mask has served you well, shielding vulnerable parts from a world that sometimes demanded too much.

**The Flame** challenges this: beneath the guardian's armor burns something fierce and authentic that yearns to be seen. The passion you've been containing is part of your true face, not something to be managed.

**The Bridge** offers hope — there is a way to honor both the protector and the authentic self. The mask doesn't need to be destroyed; it needs to become transparent. Let others see through it to who you really are.

The persona you've been wearing is not false — it's incomplete. Today's reading invites you to let the rest of you be visible.`,

  2: `At the mirror's edge, the cards speak with unflinching honesty.

**The Alchemist** reveals the truth you're ready to see: you have been the agent of your own transformation all along. Every choice, every struggle, every moment of doubt has been part of a deliberate becoming — even when it felt like chaos.

**The Storm** acknowledges what it costs to see clearly. Truth can be disruptive. The mirror shows not just beauty but every scar, every shadow, every unfinished edge. And that is not a flaw — it is the raw material of who you are becoming.

**The Garden** promises that what grows from this honest seeing will be extraordinary. Seeds planted in truth grow deeper roots. The person you glimpse in this mirror — imperfect, powerful, still becoming — is worth tending with patience and care.

You have reached the edge of The Threshold. What you see in the mirror is not a finished portrait but a living work — one that continues to reveal itself as you walk deeper into your own story.`,
};

// ── Mock artifact for retreat completion ────────────────────────────────

export const MOCK_ARTIFACT = {
  title: "The Threshold Crossing",
  themes: ["Self-awareness", "Authentic seeing", "Inner calling"],
  summary:
    "Through three waypoints of increasing depth, you moved from hearing the call, to examining your masks, to standing at the mirror's edge of radical honesty. The Threshold has been crossed — not as a single dramatic leap, but as a gradual opening of the eyes to what was always there.",
};
