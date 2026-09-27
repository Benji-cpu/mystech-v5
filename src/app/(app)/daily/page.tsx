import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";
import { openDailyCard } from "@/lib/daily-card/open";

/**
 * The daily-card email's one tap.
 *
 * `?on=<YYYY-MM-DD>` opens that day's card as a reading from the user's own
 * deck. `?d=<readingId>` is the older email link; those readings still exist.
 * Anything else goes to /today.
 */
export default async function DailyPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string; on?: string }>;
}) {
  const { d, on } = await searchParams;
  if (d) redirect(`/readings/${d}`);
  if (on && /^\d{4}-\d{2}-\d{2}$/.test(on)) {
    const user = await requireAuth();
    const readingId = await openDailyCard(user.id!, on);
    if (readingId) redirect(`/readings/${readingId}`);
  }
  redirect("/today");
}
