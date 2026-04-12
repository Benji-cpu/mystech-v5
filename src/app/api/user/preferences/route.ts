import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserReadingLength, upsertUserReadingLength, getVoicePreferences, upsertVoicePreferences } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ReadingLength, VoiceSpeed } from "@/types";

const VALID_LENGTHS: ReadingLength[] = ["brief", "standard", "deep"];
const VALID_VOICE_SPEEDS: VoiceSpeed[] = ["0.75", "1.0", "1.25", "1.5"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [readingLength, voice] = await Promise.all([
    getUserReadingLength(user.id),
    getVoicePreferences(user.id),
  ]);

  return NextResponse.json({ readingLength, voice });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Handle reading length update
  if (body.readingLength !== undefined) {
    const { readingLength } = body as { readingLength?: string };
    if (!readingLength || !VALID_LENGTHS.includes(readingLength as ReadingLength)) {
      return NextResponse.json(
        { error: "Invalid readingLength. Must be 'brief', 'standard', or 'deep'." },
        { status: 400 }
      );
    }
    await upsertUserReadingLength(user.id, readingLength as ReadingLength);
    return NextResponse.json({ readingLength });
  }

  // Handle voice preference updates
  if (
    body.voiceEnabled !== undefined ||
    body.voiceAutoplay !== undefined ||
    body.voiceSpeed !== undefined ||
    body.voiceId !== undefined
  ) {
    const update: Record<string, unknown> = {};

    if (typeof body.voiceEnabled === "boolean") {
      update.voiceEnabled = body.voiceEnabled;
    }
    if (typeof body.voiceAutoplay === "boolean") {
      update.voiceAutoplay = body.voiceAutoplay;
    }
    if (body.voiceSpeed !== undefined) {
      if (!VALID_VOICE_SPEEDS.includes(body.voiceSpeed as VoiceSpeed)) {
        return NextResponse.json(
          { error: "Invalid voiceSpeed. Must be '0.75', '1.0', '1.25', or '1.5'." },
          { status: 400 }
        );
      }
      update.voiceSpeed = body.voiceSpeed;
    }
    if (body.voiceId !== undefined) {
      update.voiceId = body.voiceId;
    }

    await upsertVoicePreferences(user.id, update);
    const voice = await getVoicePreferences(user.id);
    return NextResponse.json({ voice });
  }

  // Handle guidanceEnabled toggle
  if (typeof body.guidanceEnabled === "boolean") {
    await db
      .update(userProfiles)
      .set({ guidanceEnabled: body.guidanceEnabled, updatedAt: new Date() })
      .where(eq(userProfiles.userId, user.id));
    return NextResponse.json({ guidanceEnabled: body.guidanceEnabled });
  }

  return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
}
