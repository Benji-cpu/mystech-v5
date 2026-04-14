"use client";

import { useState } from "react";
import { Settings, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ProfileForm } from "@/components/settings/profile-form";
import { ReadingPreferences } from "@/components/settings/reading-preferences";
import { VoicePreferences } from "@/components/settings/voice-preferences";
import { ConnectedAccount } from "@/components/settings/connected-account";
import { SubscriptionSection } from "@/components/settings/subscription-section";
import { DeleteAccount } from "@/components/settings/delete-account";
import { SignOutButton } from "@/components/settings/sign-out-button";

import type { PlanType, ReadingLength, UserProfile, VoicePreferences as VoicePrefs } from "@/types";

interface ProfileSettingsCollapsibleProps {
  profile: UserProfile;
  plan: PlanType;
  readingLength: ReadingLength;
  voicePrefs: VoicePrefs;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function ProfileSettingsCollapsible({
  profile,
  plan,
  readingLength,
  voicePrefs,
  open: controlledOpen,
  onOpenChange,
  className,
}: ProfileSettingsCollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <CollapsibleTrigger
        id="settings"
        className={cn(
          "bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl",
          "p-4 cursor-pointer transition-colors hover:bg-white/[0.07]",
          "flex items-center justify-between w-full"
        )}
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-white/50" />
          <span className="text-sm font-medium text-white/80">
            Account & Settings
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ChevronDown className="h-4 w-4 text-white/40" />
        </motion.div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="space-y-6 pt-4">
          <ProfileForm profile={profile} />
          <ReadingPreferences initialLength={readingLength} />
          <VoicePreferences initialPrefs={voicePrefs} />
          <ConnectedAccount
            email={profile.email}
            image={profile.image}
            name={profile.name}
          />
          <SubscriptionSection plan={plan} />
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
          <DeleteAccount />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
