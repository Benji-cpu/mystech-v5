import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promptOverrides } from "@/lib/db/schema";
import { requireTesterApi, requireAdminApi } from "@/lib/auth/helpers";
import { PROMPT_REGISTRY } from "@/lib/ai/prompts/registry";
import { eq } from "drizzle-orm";

export async function GET() {
  const { error } = await requireTesterApi();
  if (error) return error;

  // Get all overrides from DB
  const overrides = await db.select().from(promptOverrides);
  const overrideMap = new Map(overrides.map((o) => [o.promptKey, o]));

  // Merge registry with overrides
  const prompts = Object.values(PROMPT_REGISTRY).map((entry) => {
    const override = overrideMap.get(entry.key);
    return {
      ...entry,
      override: override
        ? {
            id: override.id,
            content: override.content,
            isActive: override.isActive,
            isPublished: override.isPublished,
            updatedAt: override.updatedAt,
          }
        : null,
    };
  });

  return NextResponse.json({ prompts });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const { key, content, isPublished } = body as { key?: string; content?: string; isPublished?: boolean };

  if (!key || !content) {
    return NextResponse.json({ error: "key and content are required" }, { status: 400 });
  }

  if (!PROMPT_REGISTRY[key]) {
    return NextResponse.json({ error: "Unknown prompt key" }, { status: 400 });
  }

  // Upsert override
  const [existing] = await db
    .select()
    .from(promptOverrides)
    .where(eq(promptOverrides.promptKey, key))
    .limit(1);

  if (existing) {
    await db
      .update(promptOverrides)
      .set({
        content,
        isActive: true,
        ...(typeof isPublished === "boolean" ? { isPublished } : {}),
        updatedBy: user!.id,
        updatedAt: new Date(),
      })
      .where(eq(promptOverrides.promptKey, key));
  } else {
    await db.insert(promptOverrides).values({
      promptKey: key,
      content,
      isActive: true,
      ...(typeof isPublished === "boolean" ? { isPublished } : {}),
      updatedBy: user!.id,
    });
  }

  return NextResponse.json({ success: true });
}
