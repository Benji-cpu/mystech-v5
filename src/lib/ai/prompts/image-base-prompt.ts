/**
 * How a card-art prompt is assembled. ONE place, because four call sites each
 * building their own `[base, subject, style].join(", ")` is how the robed-woman
 * bug survived four attempts to fix it — a change landed in one of them and the
 * next session measured a different one.
 *
 * ## The bug, and the measurement that settled it
 *
 * Card art drew a robed human figure whatever the card was about. Measured
 * 2026-09-16 with `scripts/art-harness.ts` (12 fixed subjects × 3 fixed seeds,
 * none of which wants a person in it):
 *
 *   baseline  `[base, subject, style].join(", ")`   14 of 36 images had a figure
 *   v1        subject first, framing last            (of the 4 worst: 9/10 → 6/10)
 *   v2        v1 + style attractors stripped          2 of 36
 *
 * Then, measured again on SIX REAL production prompts (`--set=real`), because
 * the twelve above were written by hand and were therefore clean:
 *
 *   v2        the same assembly                       5 of 15
 *   v3        v2 + the subject's own negation stripped  0 of 15
 *
 * The failure tracked how CONCRETE the subject was, not the style: a door, a
 * lantern, a compass and a fox rendered correctly in the same styles that turned
 * "a glowing seed suspended in a violet nebula" into a sorceress. When the model
 * cannot picture the subject it falls back to what it thinks an *oracle card* is.
 *
 * So three things had to change together, and none is enough alone:
 *
 * 1. **The subject goes first.** Diffusion models weight early tokens. The card's
 *    own subject used to sit behind the framing and in front of a long style
 *    prompt, so the framing and the style won the image.
 * 2. **The style prompt's attractors come out.** Every style v1 could not fix
 *    named a figurative canon — "in the style of Alphonse Mucha", "classical
 *    Rider-Waite inspired composition" — whose entire body of work is people.
 *    Strip the artist reference and the tradition name; keep the palette, the
 *    ornament and the medium, which is what the style is actually for.
 * 3. **The card's own "no human figures" clause comes out.** `deck-generation.ts`
 *    asks the LLM to state exclusions in the imagePrompt, so 17 of 91 production
 *    cards end with one. Diffusion has no negation operator — the clause names
 *    the thing it forbids, and step 1 had just moved it to the front. This is
 *    why the hand-written harness set read 2 of 36 while real decks still drew
 *    women: a synthetic subject set that nobody's LLM wrote is not the input.
 *
 * The negative prompt already listed person / human / face / woman / silhouette
 * and did nothing: on Stability Core a strong positive prior beats the negative
 * list. It is kept as a floor, not relied on.
 *
 * ## Rules that still hold
 *
 * - **Never say "portrait" or "divination card" anywhere in here.** "Portrait"
 *   reads as a portrait *of a person*; "oracle/divination card" pulls the model
 *   into a training distribution saturated with robed mystical women.
 * - **Keep the framing SHORT.** Every clause competes with the card's own
 *   subject, which is the only thing that differs between cards. Border and
 *   composition language belongs in the per-style prompt where it is already
 *   written — a global "decorative border" clause double-dips and swallows the
 *   subject whole.
 * - A card that legitimately wants a figure says so in its own imagePrompt. The
 *   per-card subject leads the prompt now, so it wins.
 *
 * **Never change any of this from a single image.** Run the harness, look at the
 * contact sheet, count. Four confident conclusions have already been reversed by
 * the next draw — and a fifth, v2, was reversed by running it against the real
 * input instead of the one we had written ourselves. Use `--set=real`.
 */

/** Framing for a card face. Measured as part of v2; do not extend casually. */
export const ORACLE_CARD_FRAMING =
  "Uninhabited scene with no people in it, symbolic still life, vertical 2:3 format, one centered subject";

/**
 * Kept for the negative prompt only. No longer prepended to anything — the
 * subject leads now. Exported because the print and preview paths still want a
 * shared floor.
 */
export const ORACLE_CARD_NEGATIVE_PROMPT =
  "person, people, human, human figure, face, portrait, woman, man, girl, boy, goddess, priestess, sorceress, witch, angel, silhouette of a person, hands, body, character, blurry, low resolution, pixelated, ugly, distorted, deformed, watermark, text, letters, words, signature, cropped, multiple panels, collage, photograph, photorealistic, out of frame";

/**
 * Remove the phrases that pull the model toward its "mystical woman on a card"
 * prior. Palette, ornament and medium survive; the artist and the tradition do
 * not. `scripts/art-harness.ts` imports THIS function, so the harness and
 * production can never measure different text.
 */
export function stripStyleAttractors(stylePrompt: string): string {
  return stylePrompt
    .replace(/\b(oracle|tarot|divination) card\b/gi, "illustration")
    .replace(/\bin the (style|tradition) of [A-Z][\w.'-]*(?: [A-Z][\w.'-]*)*/g, "")
    .replace(/\bclassical Rider-Waite inspired composition,?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s,/g, ",")
    .trim();
}

/**
 * The assembly every image path uses. Subject first, style stripped, framing
 * last — exactly what the harness measured as v2.
 *
 * `framing` defaults to a card face. The print box and the card back pass their
 * own, because "vertical 2:3 format, one centered subject" is wrong for a tuck
 * box and wrong for a symmetrical back pattern.
 */
export function buildCardImagePrompt(
  subject: string,
  stylePrompt: string,
  framing: string = ORACLE_CARD_FRAMING
): string {
  const lead = stripSubjectNegations(subject).trim().replace(/[.,;]?$/, ".");
  return [lead, stripStyleAttractors(stylePrompt), framing]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Remove a trailing "no human figures" style clause from the CARD's own prompt.
 *
 * `deck-generation.ts` asks the model to state excluded elements explicitly in
 * the imagePrompt, so 17 of the 91 cards in production end with some form of
 * "No human figures are present." / "without any human figures" / "NO LITERAL
 * HUMAN FIGURES are present in the image." A diffusion model has no negation
 * operator: that clause names the thing it means to forbid, and v2 put the
 * card's own prompt at the FRONT, where the weight is highest. The exclusion
 * already lives in the negative prompt, which is where a diffusion model can
 * actually act on it.
 *
 * Deliberately narrow. It only matches a clause that is BOTH a negation AND
 * about people, so a card that legitimately asks for figures ("two figures
 * merge into a single form of radiant light") is left alone — and so is any
 * other negation the model writes, which we have not measured.
 */
export function stripSubjectNegations(subject: string): string {
  return subject
    // "…, without any human figures." / "…, free of people."
    .replace(
      /[,;]?\s*(?:and\s+)?(?:strictly\s+)?(?:with|which is|entirely|completely)?\s*(?:without|free of|devoid of|absent)\s+(?:any\s+|all\s+)?(?:literal\s+)?(?:human|people|person|figures?)[^.!?]*[.!?]?\s*$/i,
      ""
    )
    // "No human figures are present." / "NO LITERAL HUMAN FIGURES…" / "No people."
    .replace(
      /(?:^|(?<=[.!?]))\s*no\s+(?:literal\s+)?(?:human|people|person|figures?)[^.!?]*[.!?]\s*/gi,
      " "
    )
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;])/g, "$1")
    .trim()
    .replace(/[,;]\s*$/, ".");
}
