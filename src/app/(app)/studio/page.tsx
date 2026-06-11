import { redirect } from "next/navigation";

/** Legacy route — the studio is folded into the deck pages. */
export default function StudioPage() {
  redirect("/decks");
}
