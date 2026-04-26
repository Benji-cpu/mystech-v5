"use client";

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
          <div className="relative min-h-dvh bg-background text-foreground">
            {/* Content: scrollable, z-10 */}
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
