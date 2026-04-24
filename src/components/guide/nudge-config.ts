import type { OnboardingMilestone, OnboardingStage, PlanType } from "@/types";

export type NudgeVariant = "standard" | "discovery" | "upgrade";

export type NudgeConfig = {
  id: string;
  milestone: OnboardingMilestone; // completing this milestone dismisses the nudge
  stage: OnboardingStage; // minimum stage to show
  variant: NudgeVariant;
  message: string;
  cta?: { label: string; href: string };
  priority: number; // lower = higher priority
  /** If set, the nudge is hidden for users on these plans. */
  hideForPlans?: PlanType[];
  /** Milestone that must be COMPLETED before this nudge can show (soft gate). */
  requires?: OnboardingMilestone;
};

/**
 * All nudge definitions. Only one nudge shows at a time on the dashboard.
 * Priority determines which nudge wins when multiple are eligible.
 */
const ALL_NUDGES: NudgeConfig[] = [
  // Stage 1
  {
    id: "nav_tutorial",
    milestone: "nav_tutorial_seen",
    stage: 1,
    variant: "standard",
    message:
      "This is your compass. Tap the glowing orb below to navigate between your decks, readings, and more.",
    priority: 1,
  },
  {
    id: "dashboard_tour",
    milestone: "dashboard_tour_seen",
    stage: 1,
    variant: "standard",
    message:
      "This is your home base. I'll show you new things here as you grow.",
    cta: { label: "View My Deck", href: "/decks" },
    priority: 2,
  },

  // Stage 2
  {
    id: "upgrade_proactive",
    milestone: "pro_features_introduced",
    stage: 2,
    variant: "upgrade",
    message:
      "You've found your rhythm. Pro opens up five readings a day, every spread, and the Master Oracle voice — for when the questions go deeper.",
    cta: { label: "See what Pro unlocks", href: "/settings/billing" },
    priority: 5,
    hideForPlans: ["pro", "admin"],
    requires: "second_reading_complete",
  },
  {
    id: "studio_intro",
    milestone: "studio_introduced",
    stage: 2,
    variant: "discovery",
    message:
      "The Studio is where you shape the visual language of your deck — browse styles, refine card artwork, and make every image truly yours.",
    cta: { label: "Explore Studio", href: "/studio" },
    priority: 9,
  },
  {
    id: "art_styles",
    milestone: "art_styles_introduced",
    stage: 2,
    variant: "discovery",
    message:
      "Your deck has a visual language. There are others to explore — each changes how the cards feel.",
    cta: { label: "Explore Styles", href: "/studio/styles" },
    priority: 10,
  },

  // Stage 3
  {
    id: "chronicle_intro",
    milestone: "chronicle_introduced",
    stage: 3,
    variant: "discovery",
    message:
      "The Chronicle is a daily conversation with the cards. Each day, a new card is forged from what you share.",
    cta: { label: "Begin Daily Practice", href: "/chronicle/today" },
    priority: 20,
  },

  // Stage 4
  {
    id: "paths_intro",
    milestone: "paths_introduced",
    stage: 4,
    variant: "discovery",
    message:
      "There are paths you can walk — Archetypal, Mindfulness, Mysticism. Each shapes how the cards speak to you.",
    cta: { label: "Explore Paths", href: "/paths" },
    priority: 30,
  },
  {
    id: "astrology_intro",
    milestone: "astrology_introduced",
    stage: 4,
    variant: "discovery",
    message:
      "Your birth sky adds another layer. I'll weave celestial context into every reading.",
    cta: { label: "Set Up Birth Chart", href: "/profile?section=celestial" },
    priority: 31,
  },

  // Stage 5
  {
    id: "sharing",
    milestone: "sharing_introduced",
    stage: 5,
    variant: "standard",
    message:
      "You can share individual readings with anyone — no account needed to view them.",
    priority: 40,
  },
  {
    id: "custom_art_style",
    milestone: "custom_art_style_introduced",
    stage: 5,
    variant: "discovery",
    message:
      "You can create your own art style — describe the visual language you imagine and I'll bring it to life.",
    cta: { label: "Create a Style", href: "/studio/styles" },
    priority: 41,
  },
];

/**
 * Get the single highest-priority nudge that should show on the dashboard.
 * Returns null if all nudges are completed or user hasn't reached any nudge's stage.
 */
export function getActiveNudge(
  milestones: Set<OnboardingMilestone>,
  stage: OnboardingStage,
  plan: PlanType = "free"
): NudgeConfig | null {
  const eligible = ALL_NUDGES.filter((n) => {
    if (stage < n.stage) return false;
    if (milestones.has(n.milestone)) return false;
    if (n.hideForPlans?.includes(plan)) return false;
    if (n.requires && !milestones.has(n.requires)) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => a.priority - b.priority);
  return eligible[0];
}
