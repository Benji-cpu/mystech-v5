"use client";

import type { ReactNode } from "react";
import { MockImmersiveProvider } from "./mock-immersive-provider";
import type { Mood } from "@/components/immersive/mood-config";

function ShellContent({ children }: { children: ReactNode }) {
  return (
    <div
      className="daylight relative min-h-screen"
      style={{ background: "var(--paper)" }}
    >
      <div className="relative z-10">{children}</div>
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
