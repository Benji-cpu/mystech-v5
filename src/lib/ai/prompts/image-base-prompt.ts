/**
 * Prepended/appended to EVERY card image generation. Two rules learned the hard way:
 *
 * 1. Never say "portrait" or "divination card" here. The old base prompt read
 *    "vertical portrait composition ... for a divination card" and the model took
 *    "portrait" to mean a portrait *of a person*, while "oracle/divination card"
 *    pulled it into a training distribution saturated with robed mystical women.
 *    Every card in a deck came back as the same figure regardless of its own
 *    imagePrompt — a deck whose prompts read "a star seed in a nebula", "a veiled
 *    galaxy" and "a mirror-still celestial surface" rendered as one woman, three
 *    times, in the same robe, holding the same orb.
 *
 * 2. The negative prompt must exclude humans OUTRIGHT. The old one only guarded
 *    "extra limbs, bad anatomy", which implicitly told the model a human body was
 *    expected and merely had to be well-formed.
 *
 * A card that legitimately wants a figure should say so in its own imagePrompt —
 * the per-card prompt carries more weight than these shared defaults.
 *
 * Keep this SHORT. Every clause here competes with the card's own subject, which
 * is the thing that actually differs between cards. Framing and border language
 * belongs in the per-style prompt (where it is already written, per style) — a
 * global "decorative border" clause double-dips against those and swallows the
 * subject whole: a prompt for "a key resting on still water" came back as an
 * ornate empty doorway.
 */
export const ORACLE_CARD_BASE_PROMPT =
  "Symbolic illustration for an oracle card, vertical 2:3 format, one centered subject, uninhabited scene";

export const ORACLE_CARD_NEGATIVE_PROMPT =
  "person, people, human, human figure, face, portrait, woman, man, girl, boy, goddess, priestess, sorceress, witch, angel, silhouette of a person, hands, body, character, blurry, low resolution, pixelated, ugly, distorted, deformed, watermark, text, letters, words, signature, cropped, multiple panels, collage, photograph, photorealistic, out of frame";
