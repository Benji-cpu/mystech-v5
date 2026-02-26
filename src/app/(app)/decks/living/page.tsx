import { redirect } from "next/navigation";

/**
 * Legacy route — Living Deck has been evolved into Chronicle.
 * Redirect any bookmarked/cached URLs to the new Chronicle route.
 */
export default function LivingDeckPage() {
  redirect("/chronicle");
}
