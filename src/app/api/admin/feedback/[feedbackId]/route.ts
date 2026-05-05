import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";

const patchSchema = z.object({
  status: z.enum(["new", "reviewed", "actioned", "dismissed"]).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { feedbackId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.adminNotes !== undefined) updates.adminNotes = parsed.data.adminNotes;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  await db.update(feedback).set(updates).where(eq(feedback.id, feedbackId));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { feedbackId } = await params;
  await db.delete(feedback).where(eq(feedback.id, feedbackId));

  return NextResponse.json({ success: true });
}
