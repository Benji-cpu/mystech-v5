import { redirect } from "next/navigation";

/** Legacy route — art styles now live under /decks/styles. */
export default function NewArtStylePage() {
  redirect("/decks/styles/new");
}
