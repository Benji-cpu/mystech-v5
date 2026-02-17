"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { ImmersiveProvider } from "./immersive-provider";
import { PageTransitionWrapper } from "./page-transition-wrapper";
import { FloatingOrb } from "./floating-orb";
import { PromptFabProvider } from "@/components/admin/prompt-fab";

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
}

export function ImmersiveShell({ children, user }: ImmersiveShellProps) {
  return (
    <ImmersiveProvider>
      <div className="relative min-h-dvh">
        {/* Background: fixed, full bleed, z-0 */}
        <div className="fixed inset-0 z-0 bg-[#0a0118]">
          <AmbientBackground />
        </div>

        {/* Content: above background, scrollable, z-10 */}
        <div className="relative z-10 min-h-dvh">
          <PageTransitionWrapper>
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </PageTransitionWrapper>
        </div>

        {/* Navigation: fixed overlay, z-50 */}
        <FloatingOrb />
        <PromptFabProvider />
      </div>
    </ImmersiveProvider>
  );
}
