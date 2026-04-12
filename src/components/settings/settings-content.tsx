"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { StaggeredList } from "@/components/ui/staggered-list";
import { ProfileForm } from "@/components/settings/profile-form";
import { CelestialProfile } from "@/components/settings/celestial-profile";
import { ReadingPreferences } from "@/components/settings/reading-preferences";
import { VoicePreferences } from "@/components/settings/voice-preferences";
import { ChroniclePreferences } from "@/components/settings/chronicle-preferences";
import { DisplayPreferences } from "@/components/settings/display-preferences";
import { ConnectedAccount } from "@/components/settings/connected-account";
import { SubscriptionSection } from "@/components/settings/subscription-section";
import { DeleteAccount } from "@/components/settings/delete-account";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import type {
  UserProfile,
  ReadingLength,
  VoicePreferences as VoicePrefs,
  AstrologyProfile,
  ChronicleSettings,
  PlanType,
} from "@/types";

interface SettingsContentProps {
  profile: UserProfile;
  plan: PlanType;
  readingLength: ReadingLength;
  voicePrefs: VoicePrefs;
  guidanceEnabled?: boolean;
  astroProfile: AstrologyProfile | null;
  chronicleSettings: ChronicleSettings | null;
}

export function SettingsContent({
  profile,
  plan,
  readingLength,
  voicePrefs,
  guidanceEnabled = true,
  astroProfile,
  chronicleSettings,
}: SettingsContentProps) {
  const { stage } = useOnboarding();

  return (
    <StaggeredList className="space-y-6">
      {/* Profile */}
      <ProfileForm profile={profile} />

      {/* Celestial Profile (unlocked at stage 3+) */}
      {stage >= 3 && <CelestialProfile profile={astroProfile} />}

      {/* Reading Preferences */}
      <ReadingPreferences initialLength={readingLength} />

      {/* Voice & Speech */}
      <VoicePreferences initialPrefs={voicePrefs} initialGuidanceEnabled={guidanceEnabled} />

      {/* Chronicle (conditional) */}
      {chronicleSettings && (
        <ChroniclePreferences settings={chronicleSettings} />
      )}

      {/* Display & Performance */}
      <DisplayPreferences />

      {/* Connected Account */}
      <ConnectedAccount
        email={profile.email}
        image={profile.image}
        name={profile.name}
      />

      {/* Subscription */}
      <SubscriptionSection plan={plan} />

      {/* Sign Out */}
      <GlassPanel className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white/90">Sign Out</h3>
            <p className="text-sm text-white/40">
              Sign out of your account on this device.
            </p>
          </div>
          <SignOutButton />
        </div>
      </GlassPanel>

      {/* Delete Account */}
      <DeleteAccount />
    </StaggeredList>
  );
}
