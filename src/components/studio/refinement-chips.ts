export const FEEDBACK_CHIPS = [
  { label: "More vibrant", modifier: ", with more vivid saturated colors" },
  { label: "Less busy", modifier: ", cleaner composition with fewer elements" },
  { label: "More detail", modifier: ", with intricate fine details" },
  { label: "Darker", modifier: ", darker mood with deeper shadows" },
  { label: "Lighter", modifier: ", lighter and more luminous atmosphere" },
] as const;

export type FeedbackChip = (typeof FEEDBACK_CHIPS)[number];
