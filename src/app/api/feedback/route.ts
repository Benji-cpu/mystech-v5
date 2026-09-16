import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";
import { getCurrentUser, isTesterOrAdmin } from "@/lib/auth/helpers";
import { put } from "@vercel/blob";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, gte, sql } from "drizzle-orm";
import { createHash } from "node:crypto";

/** Anonymous submit times by IP hash. Per-instance; see the guard below. */
const anonHits = new Map<string, number[]>();

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
  domainSnapshot: z.record(z.string(), z.unknown()).optional(),
  /** Honeypot. A real user never sees the field, so any value means a bot. */
  website: z.string().max(200).optional(),
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
    domainSnapshot,
    website,
  } = parsed.data;

  // Honeypot: answer 200 and store nothing. Telling a bot it was caught only
  // teaches whoever wrote it to stop filling the field.
  if (website && website.trim().length > 0) {
    return NextResponse.json({ success: true, data: { id: createId() } });
  }

  // Anonymous submissions (the FAB also renders on the marketing pages) have
  // no user row to count against, so they are capped in memory on a hash of
  // the caller's IP. Per-instance and therefore leaky on serverless, but it
  // costs nothing, stores no address, and is the difference between "one
  // script can write the table" and "one script per warm instance can write
  // five rows an hour."
  if (!user?.id) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const key = createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const now = Date.now();
    const hits = (anonHits.get(key) ?? []).filter((t) => now - t < 60 * 60 * 1000);
    if (hits.length >= 5) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }
    hits.push(now);
    anonHits.set(key, hits);
    if (anonHits.size > 500) {
      for (const [k, v] of anonHits) if (v.every((t) => now - t >= 60 * 60 * 1000)) anonHits.delete(k);
    }
  }

  // 5/hour for ordinary users — the cross-project standard. Power users
  // (admin or tester role; MysTech keeps roles in the database rather than in
  // an ADMIN_EMAILS env var) bypass entirely, because dogfooding a session
  // legitimately produces a dozen notes in an hour.
  if (user?.id && !isTesterOrAdmin(user)) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedback)
      .where(and(eq(feedback.userId, user.id), gte(feedback.createdAt, oneHourAgo)));
    if (Number(countResult.count) >= 5) {
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
    domainSnapshot: domainSnapshot ?? null,
  });

  return NextResponse.json({ success: true, data: { id } });
}
