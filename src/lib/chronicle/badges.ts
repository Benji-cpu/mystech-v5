export interface BadgeDefinition {
  id: string;
  label: string;
  emoji: string;
  requiredDays: number;
  lyraMessage: string;
}

export const CHRONICLE_BADGES: BadgeDefinition[] = [
  {
    id: "first_flame",
    label: "First Flame",
    emoji: "🔥",
    requiredDays: 3,
    lyraMessage: "Three days running. A rhythm is forming.",
  },
  {
    id: "week_weaver",
    label: "Week Weaver",
    emoji: "🕸️",
    requiredDays: 7,
    lyraMessage: "A full week. Your Chronicle is taking shape.",
  },
  {
    id: "fortnight_keeper",
    label: "Fortnight Keeper",
    emoji: "🌙",
    requiredDays: 14,
    lyraMessage: "Two weeks of daily reflection. The patterns are becoming clear.",
  },
  {
    id: "moon_cycle",
    label: "Moon Cycle",
    emoji: "🌕",
    requiredDays: 30,
    lyraMessage: "A month of chronicling. Your deck holds a whole chapter now.",
  },
  {
    id: "season_walker",
    label: "Season Walker",
    emoji: "🍂",
    requiredDays: 60,
    lyraMessage: "Two months. The tapestry of your story grows rich.",
  },
  {
    id: "centurion",
    label: "Centurion",
    emoji: "⭐",
    requiredDays: 100,
    lyraMessage: "A hundred days. Your Chronicle is a treasure.",
  },
  {
    id: "year_oracle",
    label: "Year Oracle",
    emoji: "👑",
    requiredDays: 365,
    lyraMessage: "A full year chronicled. You carry a year of wisdom.",
  },
];

export function getEarnableBadges(
  streakCount: number,
  earnedBadgeIds: string[]
): BadgeDefinition[] {
  return CHRONICLE_BADGES.filter(
    (b) => b.requiredDays <= streakCount && !earnedBadgeIds.includes(b.id)
  );
}

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return CHRONICLE_BADGES.find((b) => b.id === id);
}
