import { Suspense } from "react";
import { Settings } from "lucide-react";
import { requireAuth } from "@/lib/auth/helpers";
import {
  getUserProfile,
  getUserPlan,
  getUserReadingLength,
  getVoicePreferences,
  getGuidanceEnabled,
  getAstrologyProfile,
  getUserChronicleDeck,
  getChronicleSettings,
} from "@/lib/db/queries";
import { getUserPlanFromRole } from "@/lib/usage";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsContent } from "@/components/settings/settings-content";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedItem } from "@/components/ui/animated-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlanType } from "@/types";

function SettingsContentSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/5 border border-white/10 p-6"
        >
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function SettingsData({ userId, userRole }: { userId: string; userRole?: string }) {
  let plan: PlanType = getUserPlanFromRole(userRole);

  const [profile, subPlan, readingLength, voicePrefs, guidanceEnabled, astroProfile, chronicleDeck] =
    await Promise.all([
      getUserProfile(userId),
      plan === "free" ? getUserPlan(userId) : Promise.resolve(plan),
      getUserReadingLength(userId),
      getVoicePreferences(userId),
      getGuidanceEnabled(userId),
      getAstrologyProfile(userId),
      getUserChronicleDeck(userId),
    ]);

  if (plan === "free" && subPlan === "pro") plan = "pro";

  const chronicleSettings = chronicleDeck
    ? await getChronicleSettings(chronicleDeck.id)
    : null;

  if (!profile) {
    return (
      <p className="text-white/40 text-sm">
        Unable to load profile. Please try refreshing.
      </p>
    );
  }

  return (
    <SettingsContent
      profile={profile}
      plan={userRole === "admin" ? "admin" : plan}
      readingLength={readingLength}
      voicePrefs={voicePrefs}
      guidanceEnabled={guidanceEnabled}
      astroProfile={astroProfile}
      chronicleSettings={chronicleSettings}
    />
  );
}

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <AnimatedPage className="space-y-8 p-4 sm:p-6 lg:p-8">
      <AnimatedItem>
        <PageHeader
          title="Settings"
          subtitle="Manage your preferences, account, and subscription."
          icon={Settings}
        />
      </AnimatedItem>

      <Suspense fallback={<SettingsContentSkeleton />}>
        <SettingsData
          userId={user.id!}
          userRole={(user as { role?: string }).role}
        />
      </Suspense>
    </AnimatedPage>
  );
}
