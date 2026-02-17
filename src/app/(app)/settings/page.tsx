import { Settings } from "lucide-react";
import { requireAuth, isAdmin } from "@/lib/auth/helpers";
import { getUserProfile, getUserPlan, getUserReadingLength, getVoicePreferences } from "@/lib/db/queries";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { ReadingPreferences } from "@/components/settings/reading-preferences";
import { VoicePreferences } from "@/components/settings/voice-preferences";
import { ConnectedAccount } from "@/components/settings/connected-account";
import { SubscriptionSection } from "@/components/settings/subscription-section";
import { DeleteAccount } from "@/components/settings/delete-account";
import { Separator } from "@/components/ui/separator";
import type { PlanType } from "@/types";

export default async function SettingsPage() {
  const user = await requireAuth();

  const [profile, resolvedPlan, readingLength, voicePrefs] = await Promise.all([
    getUserProfile(user.id!),
    getUserPlan(user.id!),
    getUserReadingLength(user.id!),
    getVoicePreferences(user.id!),
  ]);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  const plan: PlanType = isAdmin(user) ? "admin" : resolvedPlan;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and account."
        icon={Settings}
      />
      <ProfileForm profile={profile} />
      <Separator />
      <ReadingPreferences initialLength={readingLength} />
      <Separator />
      <VoicePreferences initialPrefs={voicePrefs} />
      <Separator />
      <ConnectedAccount
        email={profile.email}
        image={profile.image}
        name={profile.name}
      />
      <Separator />
      <SubscriptionSection plan={plan} />
      <Separator />
      <DeleteAccount />
    </div>
  );
}
