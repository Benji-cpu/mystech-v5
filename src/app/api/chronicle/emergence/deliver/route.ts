import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getEmergenceEventForUser, updateEmergenceEvent } from "@/lib/db/queries";
import type { ApiResponse } from "@/types";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { eventId } = await request.json();
  if (!eventId) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Missing eventId" },
      { status: 400 }
    );
  }

  const event = await getEmergenceEventForUser(eventId, user.id);
  if (!event) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Event not found" },
      { status: 404 }
    );
  }

  await updateEmergenceEvent(eventId, {
    status: "delivered",
    deliveredAt: new Date(),
  });

  return NextResponse.json<ApiResponse<{ delivered: boolean }>>({
    success: true,
    data: { delivered: true },
  });
}
