"use client";

import dynamic from "next/dynamic";
import { Leva } from "leva";

const ImmersiveJourneyScene = dynamic(
  () => import("@/components/lab/scenes/immersive-journey-scene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0118]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <span className="text-sm text-muted-foreground">Loading experience...</span>
        </div>
      </div>
    ),
  }
);

export default function JourneyMockPage() {
  return (
    <div className="h-dvh overflow-hidden">
      <Leva hidden />
      <ImmersiveJourneyScene />
    </div>
  );
}
