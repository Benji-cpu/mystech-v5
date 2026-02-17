import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import { checkVoiceCharacters, incrementVoiceCharacters } from "@/lib/usage/usage";
import { getTTSProvider, MAX_TTS_TEXT_LENGTH, MAX_TTS_BATCH_SIZE, DEFAULT_VOICE_ID, VOICE_SPEED_VALUES } from "@/lib/voice";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { texts, voiceId, speed } = body as {
    texts?: string[];
    voiceId?: string;
    speed?: string;
  };

  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ error: "texts array is required" }, { status: 400 });
  }

  if (texts.length > MAX_TTS_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Maximum batch size is ${MAX_TTS_BATCH_SIZE}` },
      { status: 400 }
    );
  }

  // Validate each text
  for (const text of texts) {
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "All texts must be non-empty strings" }, { status: 400 });
    }
    if (text.length > MAX_TTS_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${MAX_TTS_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }
  }

  const totalChars = texts.reduce((sum, t) => sum + t.length, 0);
  const plan = await getUserPlan(user.id);

  // Check usage limits
  const usage = await checkVoiceCharacters(user.id, plan, totalChars);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: "Voice character limit exceeded", remaining: usage.remaining, limit: usage.limit },
      { status: 429 }
    );
  }

  try {
    const provider = getTTSProvider(plan);
    const resolvedVoiceId = voiceId || DEFAULT_VOICE_ID;
    const resolvedSpeed = VOICE_SPEED_VALUES[speed || "1.0"] ?? 1.0;

    const results = await Promise.all(
      texts.map((text) =>
        provider.synthesize(text, { voiceId: resolvedVoiceId, speed: resolvedSpeed })
      )
    );

    // Increment usage after successful synthesis
    await incrementVoiceCharacters(user.id, plan, totalChars);

    // Convert to base64 array
    const audioBase64 = results.map((buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    });

    return NextResponse.json({ audio: audioBase64 });
  } catch (err) {
    console.error("TTS batch synthesis error:", err);
    return NextResponse.json({ error: "Failed to synthesize speech" }, { status: 500 });
  }
}
