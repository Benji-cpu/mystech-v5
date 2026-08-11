"use client";

import dynamic from "next/dynamic";

/**
 * ssr: false so the surface can read its saved preferences in a lazy state
 * initialiser. That keeps first-run detection out of an effect — no flash of
 * the wrong state, no hydration mismatch, no setState-in-effect.
 */
const ReadingSurface = dynamic(() => import("./surface"), {
  ssr: false,
  loading: () => <div className="fixed inset-0" style={{ background: "var(--paper)" }} />,
});

export default function ReadingV3Page() {
  return <ReadingSurface />;
}
