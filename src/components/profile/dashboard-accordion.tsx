"use client";

import { ProfileAccordion } from "./profile-accordion";
import type { AccordionSection } from "./profile-accordion";
import { CelestialEventsSection } from "./celestial-events-section";
import { ActivitySection } from "./activity-section";
import { OverviewCollapsible } from "@/components/dashboard/overview-collapsible";
import { ProfileSettingsCollapsible } from "@/components/settings/profile-settings-collapsible";
import type {
  PlanType,
  ActivityItemWithTemporal,
  AstrologyProfile,
  UserProfile,
  ReadingLength,
  VoicePreferences,
} from "@/types";

interface DashboardAccordionProps {
  defaultOpen: AccordionSection | null;
  celestialItems: ActivityItemWithTemporal[];
  activityItems: ActivityItemWithTemporal[];
  deckCount: number;
  plan: PlanType;
  creditsUsed: number;
  creditsLimit: number;
  readingsToday: number;
  readingsPerDay: number;
  isLifetimeCredits: boolean;
  celestialProfile?: AstrologyProfile | null;
  profile: UserProfile | null;
  settingsPlan: PlanType;
  readingLength: ReadingLength;
  voicePrefs: VoicePreferences;
}

export function DashboardAccordion({
  defaultOpen,
  celestialItems,
  activityItems,
  deckCount,
  plan,
  creditsUsed,
  creditsLimit,
  readingsToday,
  readingsPerDay,
  isLifetimeCredits,
  celestialProfile,
  profile,
  settingsPlan,
  readingLength,
  voicePrefs,
}: DashboardAccordionProps) {
  return (
    <div className="space-y-3">
      <CelestialEventsSection items={celestialItems} />
      <ActivitySection items={activityItems} />

      <ProfileAccordion defaultOpen={defaultOpen} className="space-y-3">
        {({ openSection, toggleSection }) => (
          <>
            <OverviewCollapsible
              deckCount={deckCount}
              plan={plan}
              creditsUsed={creditsUsed}
              creditsLimit={creditsLimit}
              readingsToday={readingsToday}
              readingsPerDay={readingsPerDay}
              isLifetimeCredits={isLifetimeCredits}
              celestialProfile={celestialProfile}
              open={openSection === "sanctum"}
              onOpenChange={() => toggleSection("sanctum")}
            />
            {profile && (
              <ProfileSettingsCollapsible
                profile={profile}
                plan={settingsPlan}
                readingLength={readingLength}
                voicePrefs={voicePrefs}
                open={openSection === "settings"}
                onOpenChange={() => toggleSection("settings")}
              />
            )}
          </>
        )}
      </ProfileAccordion>
    </div>
  );
}
