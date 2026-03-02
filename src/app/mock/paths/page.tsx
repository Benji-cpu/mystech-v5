"use client";

import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { PathJourneyShell } from "./path-journey-shell";

export default function PathJourneyPage() {
  return (
    <MockImmersiveShell>
      <PathJourneyShell />
    </MockImmersiveShell>
  );
}
