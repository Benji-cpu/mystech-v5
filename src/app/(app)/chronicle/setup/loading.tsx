import { LyraLoading } from "@/components/guide/lyra-loading";

export default function ChronicleSetupLoading() {
  return (
    <div className="h-[100dvh] flex items-center justify-center">
      <LyraLoading message="Setting up your Chronicle..." />
    </div>
  );
}
