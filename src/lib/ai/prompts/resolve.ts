import { db } from "@/lib/db";
import { promptOverrides } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PROMPT_REGISTRY } from "./registry";

/**
 * Resolve a prompt by key.
 * - Admin: returns active override (draft or published)
 * - All other users: returns published override if one exists, else code default
 */
export async function resolvePrompt(
  key: string,
  userRole?: string
): Promise<string> {
  const entry = PROMPT_REGISTRY[key];
  if (!entry) {
    throw new Error(`Unknown prompt key: ${key}`);
  }

  try {
    // Admin gets any active override (draft or published)
    if (userRole === "admin") {
      const [override] = await db
        .select()
        .from(promptOverrides)
        .where(
          and(eq(promptOverrides.promptKey, key), eq(promptOverrides.isActive, true))
        )
        .limit(1);

      if (override) {
        return override.content;
      }
    } else {
      // Non-admin: only get published + active overrides
      const [published] = await db
        .select()
        .from(promptOverrides)
        .where(
          and(
            eq(promptOverrides.promptKey, key),
            eq(promptOverrides.isActive, true),
            eq(promptOverrides.isPublished, true)
          )
        )
        .limit(1);

      if (published) {
        return published.content;
      }
    }
  } catch (error) {
    console.error(`[resolvePrompt] Failed to check override for ${key}:`, error);
  }

  return entry.defaultValue;
}

/**
 * Resolve a template prompt with variable substitution.
 * Variables use {varName} syntax.
 */
export async function resolveTemplatePrompt(
  key: string,
  params: Record<string, string>,
  userRole?: string
): Promise<string> {
  const template = await resolvePrompt(key, userRole);

  let result = template;
  for (const [varName, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${varName}\\}`, "g"), value);
  }
  return result;
}
