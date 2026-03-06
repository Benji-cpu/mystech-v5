import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/types";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  await db
    .update(users)
    .set({ initiationCompletedAt: new Date() })
    .where(eq(users.id, user.id));

  return NextResponse.json<ApiResponse<{ success: true }>>(
    { success: true, data: { success: true } },
    { status: 200 }
  );
}
