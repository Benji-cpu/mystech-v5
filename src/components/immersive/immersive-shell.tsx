"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { ImmersiveProvider } from "./immersive-provider";
import { PageTransitionWrapper } from "./page-transition-wrapper";
import { BottomNav } from "./bottom-nav";
import { DesktopNav } from "./desktop-nav";
import { FocusHeader } from "./focus-header";
import { PromptFabProvider } from "@/components/admin/prompt-fab";
import { OnboardingProvider } from "@/components/guide/onboarding-provider";
import { FeedbackProvider } from "@/components/feedback/feedback-provider";
import { FeedbackSheet } from "@/components/feedback/feedback-sheet";
import type { OnboardingMilestone, OnboardingStage } from "@/types";

const AmbientBackground = dynamic(
  () =>
    import("./ambient-background").then((mod) => ({
      default: mod.AmbientBackground,
    })),
  { ssr: false, loading: () => null }
);

interface ImmersiveShellProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  initialMilestones?: OnboardingMilestone[];
  initialStage?: OnboardingStage;
}

export function ImmersiveShell({
  children,
  user,
  initialMilestones,
  initialStage,
}: ImmersiveShellProps) {
  return (
    <ImmersiveProvider>
      <OnboardingProvider
        initialMilestones={initialMilestones}
        initialStage={initialStage}
      >
        <FeedbackProvider>
          <div className="relative min-h-dvh">
            {/* Background: fixed, full bleed, z-0 */}
            <div className="fixed inset-0 z-0 bg-surface-deep">
              <AmbientBackground />
            </div>

            {/* Content: above background, scrollable, z-10 */}
            <div className="relative z-10 min-h-dvh lg:pl-16">
              <PageTransitionWrapper>
                <main className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8 lg:pb-8">
                  {children}
                </main>
              </PageTransitionWrapper>
            </div>

            {/* Navigation: BottomNav on mobile, DesktopNav on lg+ */}
            <BottomNav />
            <DesktopNav />
            <FocusHeader />
            <FeedbackSheet />
            <PromptFabProvider />
          </div>
        </FeedbackProvider>
      </OnboardingProvider>
    </ImmersiveProvider>
  );
}
