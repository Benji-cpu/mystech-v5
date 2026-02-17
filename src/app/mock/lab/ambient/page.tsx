"use client";

import dynamic from "next/dynamic";

const AmbientScene = dynamic(
  () => import("@/components/lab/scenes/ambient-scene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-[#0a0118]">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading ambient scene...
        </p>
      </div>
    ),
  }
);

export default function AmbientPage() {
  return <AmbientScene />;
}
