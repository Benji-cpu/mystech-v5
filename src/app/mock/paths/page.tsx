"use client";

import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { PathFlowShell } from "./path-flow-shell";

export default function PathFlowPage() {
  return (
    <MockImmersiveShell>
      <PathFlowShell />
    </MockImmersiveShell>
  );
}
