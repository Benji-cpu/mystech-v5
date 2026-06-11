import { redirect } from "next/navigation";

/**
 * Legacy route — the daily ritual lives at /today.
 * Old daily-card emails deep-linked /daily?d=<readingId>; those readings
 * still exist, so route them to the reading detail page.
 */
export default async function DailyPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  if (d) redirect(`/readings/${d}`);
  redirect("/today");
}
