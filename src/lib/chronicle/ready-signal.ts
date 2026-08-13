/**
 * Lyra's end-of-conversation signal.
 *
 * The old readiness test was "the reply doesn't end with a question mark",
 * which meant Lyra could never close with an optional "anything you'd like to
 * add?" — that punctuation flipped the forge button off. It also fired on
 * replies that were still probing, so the CTA appeared while the conversation
 * kept asking for more.
 *
 * Now Lyra ends a wrap-up message with this token. It is stripped before the
 * text is rendered, spoken, or persisted — the seeker never sees it.
 */
export const CHRONICLE_READY_SIGNAL = "[[READY]]";

/** True once Lyra has declared she has what she needs for today's card. */
export function hasReadySignal(text: string): boolean {
  return text.includes(CHRONICLE_READY_SIGNAL);
}

/**
 * Removes the signal from a message.
 *
 * Also holds back any trailing *partial* signal (`[`, `[[R`, `[[READ`…) so a
 * half-arrived token never flashes on screen mid-stream. Safe to call on every
 * chunk of an in-flight stream as well as on the final text.
 */
export function stripReadySignal(text: string): string {
  let out = text.split(CHRONICLE_READY_SIGNAL).join("");

  for (let i = CHRONICLE_READY_SIGNAL.length - 1; i > 0; i--) {
    if (out.endsWith(CHRONICLE_READY_SIGNAL.slice(0, i))) {
      out = out.slice(0, -i);
      break;
    }
  }

  return out.trimEnd();
}
