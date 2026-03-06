import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users, decks } from "@/lib/db/schema";
import { eq, and, ne, count } from "drizzle-orm";
import { ImmersiveShell } from "@/components/immersive/immersive-shell";

// Paths that should never trigger the onboarding redirect
const ONBOARDING_EXEMPT_PREFIXES = ["/onboarding", "/readings", "/api"];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check onboarding status for non-exempt paths
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isExempt = ONBOARDING_EXEMPT_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isExempt && session.user.id) {
    const [[userData], deckResult] = await Promise.all([
      db
        .select({ initiationCompletedAt: users.initiationCompletedAt })
        .from(users)
        .where(eq(users.id, session.user.id)),
      db
        .select({ count: count() })
        .from(decks)
        .where(and(eq(decks.userId, session.user.id), ne(decks.status, "draft"))),
    ]);

    const initiationDone = userData?.initiationCompletedAt != null;
    const hasDeck = (deckResult[0]?.count ?? 0) > 0;

    if (!initiationDone) {
      // Existing user with decks — they predate this feature; auto-complete their initiation
      if (hasDeck) {
        await db
          .update(users)
          .set({ initiationCompletedAt: new Date() })
          .where(eq(users.id, session.user.id));
      } else {
        // Fresh user — redirect to onboarding
        redirect("/onboarding");
      }
    }
  }

  return (
    <ImmersiveShell user={session.user}>
      {children}
    </ImmersiveShell>
  );
}
