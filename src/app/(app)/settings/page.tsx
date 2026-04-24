import { Suspense } from "react";
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
import { SettingsContent } from "@/components/settings/settings-content";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlanType } from "@/types";

function SettingsContentSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border p-5 hair"
          style={{ background: "var(--paper-card)" }}
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
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-2xl space-y-10 px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <header>
          <p className="eyebrow">Preferences</p>
          <h1
            className="display mt-3 text-[clamp(2.25rem,8vw,3.25rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            Settings
          </h1>
          <p
            className="whisper mt-3 text-base leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            Manage your profile, preferences, and subscription.
          </p>
        </header>

        <Suspense fallback={<SettingsContentSkeleton />}>
          <SettingsData
            userId={user.id!}
            userRole={(user as { role?: string }).role}
          />
        </Suspense>
      </div>
    </div>
  );
}
