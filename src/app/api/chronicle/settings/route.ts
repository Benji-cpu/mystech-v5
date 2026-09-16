import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decks, chronicleSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  getUserChronicleDeck,
  getChronicleSettings,
} from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import type { ApiResponse, ChronicleInterests } from "@/types";

import { parseBody } from "@/lib/api/validate";
import { UpdateChronicleSettingsSchema } from "@/lib/api/schemas";
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const deck = await getUserChronicleDeck(user.id);
  if (!deck) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Chronicle deck not found" },
      { status: 404 }
    );
  }

  const parsed = await parseBody(request, UpdateChronicleSettingsSchema);
  if (!parsed.ok) return parsed.response;
  const { artStyleId, interests, chronicleEnabled } = parsed.data as {
    artStyleId?: string | null;
    interests?: ChronicleInterests;
    chronicleEnabled?: boolean;
  };

  // Update deck art style if provided
  if (artStyleId !== undefined) {
    await db
      .update(decks)
      .set({ artStyleId: artStyleId ?? null, updatedAt: new Date() })
      .where(eq(decks.id, deck.id));
  }

  // Build settings update
  const settingsUpdate: Record<string, unknown> = { updatedAt: new Date() };
  if (interests !== undefined) {
    settingsUpdate.interests = interests;
  }
  if (chronicleEnabled !== undefined) {
    settingsUpdate.chronicleEnabled = chronicleEnabled;
  }

  // Only update if there's something to change
  if (Object.keys(settingsUpdate).length > 1) {
    await db
      .update(chronicleSettings)
      .set(settingsUpdate)
      .where(eq(chronicleSettings.deckId, deck.id));
  }

  const updatedSettings = await getChronicleSettings(deck.id);

  return NextResponse.json<ApiResponse<typeof updatedSettings>>({
    success: true,
    data: updatedSettings,
  });
}
