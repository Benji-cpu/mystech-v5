import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { practiceSegments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { GoogleTTSProvider } from "@/lib/voice/providers/google-tts";
import { DEFAULT_VOICE_ID } from "@/lib/voice/constants";

const bodySchema = z.object({
  practiceId: z.string().min(1),
  segmentId: z.string().min(1),
});

let ttsProvider: GoogleTTSProvider | null = null;

function getProvider(): GoogleTTSProvider {
  if (!ttsProvider) {
    ttsProvider = new GoogleTTSProvider();
  }
  return ttsProvider;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { practiceId, segmentId } = parsed.data;

  // Look up segment text server-side
  const [segment] = await db
    .select()
    .from(practiceSegments)
    .where(
      and(
        eq(practiceSegments.id, segmentId),
        eq(practiceSegments.practiceId, practiceId)
      )
    );

  if (!segment) {
    return NextResponse.json({ error: "Segment not found" }, { status: 404 });
  }

  if (segment.segmentType !== "speech" || !segment.text) {
    return NextResponse.json({ error: "Not a speech segment" }, { status: 400 });
  }

  try {
    const provider = getProvider();
    const audioBuffer = await provider.synthesize(segment.text, {
      voiceId: DEFAULT_VOICE_ID,
      speed: 1.0,
    });

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[practices/tts] Synthesis error:", err);
    return NextResponse.json({ error: "Failed to synthesize speech" }, { status: 500 });
  }
}
