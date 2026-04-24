export const ANALYTICS_EVENTS = {
  LANDED: "landed",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN_COMPLETED: "login_completed",
  ONBOARDING_STEP: "onboarding_step",
  ONBOARDING_COMPLETED: "onboarding_completed",
  FIRST_DECK_CREATED: "first_deck_created",
  DECK_CREATED: "deck_created",
  FIRST_READING_STARTED: "first_reading_started",
  FIRST_READING_COMPLETED: "first_reading_completed",
  READING_STARTED: "reading_started",
  READING_COMPLETED: "reading_completed",
  READING_SHARED: "reading_shared",
  READING_DOWNLOADED: "reading_downloaded",
  PAYWALL_HIT: "paywall_hit",
  UPGRADE_MODAL_SHOWN: "upgrade_modal_shown",
  CHECKOUT_STARTED: "checkout_started",
  CHECKOUT_COMPLETED: "checkout_completed",
  READING_LIMIT_REACHED: "reading_limit_reached",
  CHRONICLE_COMPLETED: "chronicle_completed",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;
