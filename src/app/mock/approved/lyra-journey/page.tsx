"use client";

import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { LyraV4Shell } from "./lyra-v4-shell";

export default function LyraV4Page() {
  return (
    <MockImmersiveShell>
      <LyraV4Shell />
    </MockImmersiveShell>
  );
}
