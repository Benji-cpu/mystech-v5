import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResponse } from "@/types";

/**
 * Parse and validate a JSON request body.
 *
 * Before this existed, 51 of the 71 mutating API routes validated nothing: they
 * read a body, cast it to an interface — which is a compile-time fiction — and
 * trusted it. The ones that did check rolled their own, so the same rule
 * ("title, 1 to 100 characters") was written four different ways with four
 * different messages, and a new route copied whichever neighbour it was next to.
 *
 * Returns a discriminated result rather than throwing, so a route reads:
 *
 *   const parsed = await parseBody(request, Schema);
 *   if (!parsed.ok) return parsed.response;
 *   const { title } = parsed.data;
 *
 * The 400 keeps the app's `ApiResponse` shape, and the message names the first
 * field that failed — "title: must be 1 to 100 characters" — because a bare
 * "Validation failed" tells the person on the other end nothing.
 */
export type ParsedBody<T> =
  | { ok: true; data: T; response?: never }
  | { ok: false; data?: never; response: NextResponse };

function badRequest(error: string): NextResponse {
  return NextResponse.json<ApiResponse<never>>({ success: false, error }, { status: 400 });
}

/**
 * Render a ZodError as one human sentence naming the field that failed.
 *
 * Zod's own text for a missing key is "Invalid input: expected string, received
 * undefined", which is accurate and useless to whoever is reading the response.
 * A missing field says "is required" instead — that is what every hand-rolled
 * check in this codebase said before, and it was the better sentence.
 */
export function firstIssueMessage(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Invalid request body";
  const path = issue.path.join(".");
  const missing =
    issue.code === "invalid_type" &&
    (issue as { input?: unknown }).input === undefined;
  const message = missing ? "is required" : issue.message;
  return path ? `${path}: ${message}` : message;
}

export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<ParsedBody<z.infer<T>>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: badRequest("Request body must be valid JSON") };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return { ok: false, response: badRequest(firstIssueMessage(result.error)) };
  }
  return { ok: true, data: result.data };
}

/**
 * Validate an already-decoded value — route params, search params, or a body a
 * route has read for itself.
 */
export function parseValue<T extends z.ZodTypeAny>(
  value: unknown,
  schema: T
): ParsedBody<z.infer<T>> {
  const result = schema.safeParse(value);
  if (!result.success) {
    return { ok: false, response: badRequest(firstIssueMessage(result.error)) };
  }
  return { ok: true, data: result.data };
}

// ── Shared field rules ──────────────────────────────────────────────────────
// One definition each, so "a deck title" means the same thing in every route
// that accepts one.

/** cuid2, which is what createId() emits. Kept loose enough for legacy ids. */
export const idField = z.string().min(1).max(64);

export const deckTitleField = z
  .string()
  .trim()
  .min(1, "must be 1 to 100 characters")
  .max(100, "must be 1 to 100 characters");

export const descriptionField = z.string().trim().max(1000, "must be 1000 characters or fewer");

export const cardTextField = z
  .string()
  .trim()
  .min(1, "is required")
  .max(2000, "must be 2000 characters or fewer");

/** Free text a user types that reaches an AI prompt. Bounded, never unbounded. */
export const promptTextField = z.string().trim().max(4000, "must be 4000 characters or fewer");
