import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import { checkVoiceCharacters, incrementVoiceCharacters } from "@/lib/usage/usage";
import { getTTSProvider, MAX_TTS_TEXT_LENGTH, DEFAULT_VOICE_ID, VOICE_SPEED_VALUES } from "@/lib/voice";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { text, voiceId, speed } = body as {
    text?: string;
    voiceId?: string;
    speed?: string;
  };

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (text.length > MAX_TTS_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text exceeds maximum length of ${MAX_TTS_TEXT_LENGTH} characters` },
      { status: 400 }
    );
  }

  const plan = await getUserPlan(user.id);

  // Check usage limits
  const usage = await checkVoiceCharacters(user.id, plan, text.length);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: "Voice character limit exceeded", remaining: usage.remaining, limit: usage.limit },
      { status: 429 }
    );
  }

  try {
    const provider = getTTSProvider(plan);
    const audioBuffer = await provider.synthesize(text, {
      voiceId: voiceId || DEFAULT_VOICE_ID,
      speed: VOICE_SPEED_VALUES[speed || "1.0"] ?? 1.0,
    });

    // Increment usage after successful synthesis
    await incrementVoiceCharacters(user.id, plan, text.length);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("TTS synthesis error:", err);
    return NextResponse.json({ error: "Failed to synthesize speech" }, { status: 500 });
  }
}
