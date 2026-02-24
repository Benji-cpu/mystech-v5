"use client";

import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { LyraV3Shell } from "./lyra-v3-shell";

export default function LyraV3Page() {
  return (
    <MockImmersiveShell initialMood={{ primaryHue: 240, sparkleColor: "#c9a94e" }}>
      <LyraV3Shell />
    </MockImmersiveShell>
  );
}
