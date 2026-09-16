import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { requireAdminApi } from "@/lib/auth/helpers";
import { geminiProModel } from "@/lib/ai/gemini";

import { parseBody } from "@/lib/api/validate";
import { TestPromptSchema } from "@/lib/api/schemas";
export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const parsed = await parseBody(request, TestPromptSchema);
  if (!parsed.ok) return parsed.response;
  const { systemPrompt, userPrompt } = parsed.data;

  try {
    const startTime = Date.now();
    const result = await generateText({
      model: geminiProModel,
      system: systemPrompt || undefined,
      prompt: userPrompt,
      maxOutputTokens: 1000,
    });

    return NextResponse.json({
      text: result.text,
      durationMs: Date.now() - startTime,
      usage: result.usage,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 502 }
    );
  }
}
