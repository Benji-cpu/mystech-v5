// ─── Marionette Strings — Color Palette & Style Tokens ──────────────────────

export const T = {
  bg: "#0a0118",
  surface: "#110220",
  surface2: "#1a0530",
  border: "rgba(201,169,78,0.15)",
  gold: "#c9a94e",
  goldBright: "#e8c84e",
  goldDim: "#8a7535",
  text: "#e8e0d4",
  textMuted: "#9e957e",
} as const;

/** Inline CSS for glass morphism panels */
export function glassStyle(): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(201,169,78,0.10)",
    borderRadius: "1rem",
    boxShadow: "0 8px 32px rgba(201,169,78,0.05)",
  };
}

/** Spring constants used across the mock */
export const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
export const SPRING_FAST = { type: "spring" as const, stiffness: 400, damping: 35 };
