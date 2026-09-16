/**
 * Words the app never says, in any generated copy.
 *
 * "Journey" is the house rule: it is the single most over-used word in this
 * category of product, and using it makes personal writing read like a
 * template. The other three are internal model vocabulary for the Paths
 * feature — code and data use "waypoint", "retreat" and "circle", but a
 * reader has never been shown the hierarchy and would not know what they are.
 *
 * Measured on production 2026-09-16: 2 of 15 deck descriptions and 5 of 91
 * card texts contained "journey", including the very first deck a new user
 * sees. No prompt had ever been told not to.
 *
 * Append to any system prompt whose output reaches a reader.
 */
export const HOUSE_VOICE_RULES = `
## Words to avoid
Never use the word "journey" — not in a title, a description, a meaning, or
guidance. Say what is actually happening instead: the year you spent, this
season, what you are walking toward, the work.
Never use "waypoint", "retreat" or "circle" as nouns for the reader's progress.
`;
