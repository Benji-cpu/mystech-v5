import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getUserPlan } from "@/lib/db/queries";
import { and, eq } from "drizzle-orm";

type Params = { params: Promise<{ cardId: string }> };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "card";
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;

  const [row] = await db
    .select({
      title: cards.title,
      imageUrl: cards.imageUrl,
      imagePrintUrl: cards.imagePrintUrl,
      imageStatus: cards.imageStatus,
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cards.id, cardId), eq(decks.userId, user.id)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // Serve the full-resolution master. Cards forged before the print/web split
  // have no imagePrintUrl — for those imageUrl is still the original PNG.
  const sourceUrl = row.imagePrintUrl ?? row.imageUrl;
  if (!sourceUrl || row.imageStatus !== "completed") {
    return NextResponse.json({ error: "image_not_ready" }, { status: 409 });
  }

  const plan = await getUserPlan(user.id);
  if (plan !== "pro" && plan !== "admin") {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  const upstream = await fetch(sourceUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }

  const filename = `${slugify(row.title)}.png`;

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
