import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTesterApi, requireAdminApi } from "@/lib/auth/helpers";
import {
  fetchRecentVercelFailures,
  ingestFailures,
  recentFailures,
  TEAM_OWNER_EMAIL,
} from "@/lib/deployment-events";

export async function GET(req: NextRequest) {
  const { error } = await requireTesterApi();
  if (error) return error;

  const days = Math.min(
    Number(req.nextUrl.searchParams.get("days") ?? 14),
    90
  );

  try {
    const rows = await recentFailures(days);
    return NextResponse.json({ data: rows });
  } catch (e) {
    return NextResponse.json(
      { error: "DB error", details: String(e) },
      { status: 500 }
    );
  }
}

const PostBody = z.object({
  action: z.literal("ingest"),
  sinceHours: z.number().int().positive().max(720).optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  let parsed;
  try {
    parsed = PostBody.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid body", details: String(e) },
      { status: 400 }
    );
  }

  const sinceMs = Date.now() - (parsed.sinceHours ?? 24) * 60 * 60 * 1000;

  try {
    const rows = await fetchRecentVercelFailures(sinceMs);
    const { inserted, skipped } = await ingestFailures(rows);
    const wrongAuthor = rows.filter(
      (r) =>
        r.commitAuthorEmail !== null &&
        r.commitAuthorEmail !== TEAM_OWNER_EMAIL
    );
    return NextResponse.json({
      data: {
        fetched: rows.length,
        inserted,
        skipped,
        wrong_author_count: wrongAuthor.length,
        wrong_authors: Array.from(
          new Set(wrongAuthor.map((r) => r.commitAuthorEmail))
        ),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Ingest failed", details: String(e) },
      { status: 500 }
    );
  }
}
