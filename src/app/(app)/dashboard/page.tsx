import { requireAuth } from "@/lib/auth/helpers";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Welcome, {user.name ?? "Seeker"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Your mystical command center. View your decks, recent readings, and
        usage at a glance.
      </p>
    </div>
  );
}
