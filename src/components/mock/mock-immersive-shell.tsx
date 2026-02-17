"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { MockImmersiveProvider, useMockImmersive } from "./mock-immersive-provider";
import type { Mood } from "@/components/immersive/mood-config";

const AmbientBackground = dynamic(
  () => import("@/components/immersive/ambient-background").then((m) => m.AmbientBackground),
  { ssr: false }
);

function ShellContent({ children }: { children: ReactNode }) {
  const { mood, performanceTier, tierConfig } = useMockImmersive();

  return (
    <div className="relative min-h-screen">
      {/* Fixed background at z-0 */}
      <div className="fixed inset-0 z-0">
        <AmbientBackground
          mood={mood}
          tierConfig={tierConfig}
          performanceTier={performanceTier}
        />
      </div>
      {/* Content at z-10 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface MockImmersiveShellProps {
  children: ReactNode;
  initialMood?: Mood;
}

export function MockImmersiveShell({ children, initialMood }: MockImmersiveShellProps) {
  return (
    <MockImmersiveProvider initialMood={initialMood}>
      <ShellContent>{children}</ShellContent>
    </MockImmersiveProvider>
  );
}
