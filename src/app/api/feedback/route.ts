import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";
import { getCurrentUser, isAdmin } from "@/lib/auth/helpers";
import { put } from "@vercel/blob";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, gte, sql } from "drizzle-orm";

const activityEventSchema = z.object({
  t: z.number(),
  kind: z.enum(["route", "click", "fetch", "error"]),
  detail: z.string().max(400),
});

const feedbackSchema = z.object({
  message: z.string().min(1).max(2000),
  pageUrl: z.string().min(1).max(500),
  pageTitle: z.string().max(500).optional(),
  routeParams: z.record(z.string(), z.string()).optional(),
  screenshotDataUrl: z.string().optional(),
  email: z.string().email().optional(),
  viewportWidth: z.number().int().positive().optional(),
  viewportHeight: z.number().int().positive().optional(),
  userAgent: z.string().max(1000).optional(),
  activityTrail: z.array(activityEventSchema).max(120).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const {
    message,
    pageUrl,
    pageTitle,
    routeParams,
    screenshotDataUrl,
    email,
    viewportWidth,
    viewportHeight,
    userAgent: clientUserAgent,
    activityTrail,
  } = parsed.data;

  // Light abuse guard: 50/hour for signed-in users. Admins bypass entirely.
  if (user?.id && !isAdmin(user)) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedback)
      .where(and(eq(feedback.userId, user.id), gte(feedback.createdAt, oneHourAgo)));
    if (Number(countResult.count) >= 50) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }
  }

  const id = createId();
  let screenshotUrl: string | undefined;

  // Upload screenshot to Vercel Blob if provided
  if (screenshotDataUrl) {
    try {
      const base64Match = screenshotDataUrl.match(/^data:image\/\w+;base64,(.+)$/);
      if (base64Match) {
        const buffer = Buffer.from(base64Match[1], "base64");
        // Cap at 2MB
        if (buffer.length <= 2 * 1024 * 1024) {
          const blob = await put(`feedback/${id}.png`, buffer, {
            access: "public",
            contentType: "image/png",
          });
          screenshotUrl = blob.url;
        }
      }
    } catch {
      // Silently skip screenshot upload failures — still save the feedback
    }
  }

  const userAgent = clientUserAgent ?? request.headers.get("user-agent") ?? undefined;

  await db.insert(feedback).values({
    id,
    userId: user?.id ?? null,
    email: user?.email ?? email ?? null,
    message,
    pageUrl,
    pageTitle: pageTitle ?? null,
    routeParams: routeParams ?? null,
    screenshotUrl: screenshotUrl ?? null,
    viewportWidth: viewportWidth ?? null,
    viewportHeight: viewportHeight ?? null,
    userAgent: userAgent ?? null,
    activityTrail: activityTrail ?? null,
  });

  return NextResponse.json({ success: true, data: { id } });
}
