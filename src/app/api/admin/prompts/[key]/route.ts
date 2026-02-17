import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promptOverrides } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth/helpers";
import { MASTER_EMAIL } from "@/lib/constants";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ key: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { key } = await params;
  const body = await request.json();
  const { isActive, isPublished } = body as { isActive?: boolean; isPublished?: boolean };

  if (typeof isActive !== "boolean" && typeof isPublished !== "boolean") {
    return NextResponse.json({ error: "isActive or isPublished boolean required" }, { status: 400 });
  }

  // Only master account can publish/unpublish
  if (typeof isPublished === "boolean" && user!.email !== MASTER_EMAIL) {
    return NextResponse.json({ error: "Only the master account can publish prompts" }, { status: 403 });
  }

  const [existing] = await db
    .select()
    .from(promptOverrides)
    .where(eq(promptOverrides.promptKey, key))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "No override found for this key" }, { status: 404 });
  }

  await db
    .update(promptOverrides)
    .set({
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(typeof isPublished === "boolean" ? { isPublished } : {}),
      updatedAt: new Date(),
    })
    .where(eq(promptOverrides.promptKey, key));

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { key } = await params;

  await db.delete(promptOverrides).where(eq(promptOverrides.promptKey, key));

  return NextResponse.json({ success: true });
}
