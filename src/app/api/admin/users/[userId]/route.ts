import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";

const VALID_ROLES = ["user", "tester", "admin"];

type Params = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { userId } = await params;
  const body = await request.json();
  const { role } = body as { role?: string };

  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "role must be 'user', 'tester', or 'admin'" },
      { status: 400 }
    );
  }

  // Safety: can't change your own role
  if (userId === user!.id) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return NextResponse.json({ success: true, role });
}
