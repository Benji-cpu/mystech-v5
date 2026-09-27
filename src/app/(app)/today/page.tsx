import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserDeckCount,
  getUserTotalReadingCount,
  getUserChronicleDeck,
} from "@/lib/db/queries";
import { resolveUserName } from "@/lib/auth/get-user-name";
import { resolveInvitation } from "@/lib/dashboard/resolve-invitation";
import { dailyCardToday } from "@/lib/daily-card/open";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialHome } from "@/components/dashboard/editorial-home";

export const metadata = {
  title: "Today — MysTech",
};

function TodaySkeleton() {
  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto">
      <Skeleton className="h-[60px] rounded-2xl" />
      <Skeleton className="h-[180px] rounded-3xl" />
      <Skeleton className="h-[80px] rounded-2xl" />
    </div>
  );
}

function timeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Good night";
}

/**
 * Today's card is MysTech's daily ritual: for anyone with a deck, the main
 * action opens it (`/daily?on=<their local date>`, the same link the morning
 * email carries). Chronicle stays one quiet link below, for those who want it.
 */
async function TodayContent({
  userId,
  userName,
  isPostInitiation,
}: {
  userId: string;
  userName: string;
  isPostInitiation: boolean;
}) {
  const [deckCount, readingCount, chronicleDeck, today] = await Promise.all([
    getUserDeckCount(userId),
    getUserTotalReadingCount(userId),
    getUserChronicleDeck(userId),
    dailyCardToday(userId),
  ]);

  const drawn = today.readingId !== null;
  const invitation = resolveInvitation({
    deckCount,
    readingCount,
    dailyCardDrawn: drawn,
    isPostInitiation,
  });

  const primary =
    deckCount === 0
      ? {
          eyebrow: "Begin",
          title: "Begin your initiation",
          description: "Create your first oracle deck. Your daily card comes from it.",
          href: "/onboarding",
          cta: "Start",
        }
      : {
          eyebrow: "Today's card",
          title: drawn ? "Return to today's card" : "Draw today's card",
          description: drawn
            ? "It stays with you all day, reading and all."
            : "One card from your own deck, chosen for today, with its reading.",
          href: `/daily?on=${today.date}`,
          cta: drawn ? "Open" : "Draw",
        };

  const secondary =
    deckCount === 0
      ? null
      : chronicleDeck
      ? { label: "Chronicle — write today's entry", href: "/chronicle" }
      : { label: "Chronicle — a deeper daily practice, if you want one", href: "/chronicle/setup" };

  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <EditorialHome
      data={{
        greeting: timeBasedGreeting(),
        userName,
        whisper: invitation.greeting,
        subtitle: null,
        weekday,
        primary,
        secondary,
      }}
    />
  );
}

interface TodayPageProps {
  searchParams: Promise<{ initiated?: string }>;
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const user = await requireAuth();
  const params = await searchParams;

  return (
    <Suspense fallback={<TodaySkeleton />}>
      <TodayContent
        userId={user.id!}
        userName={resolveUserName(user)}
        isPostInitiation={params.initiated === "true"}
      />
    </Suspense>
  );
}
