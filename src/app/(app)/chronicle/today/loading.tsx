import { LyraLoading } from "@/components/guide/lyra-loading";

export default function ChronicleTodayLoading() {
  return (
    <div className="h-[100dvh] flex items-center justify-center">
      <LyraLoading message="Preparing your chronicle..." />
    </div>
  );
}
