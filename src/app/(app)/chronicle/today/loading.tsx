import { LyraLoading } from "@/components/guide/lyra-loading";

export default function ChronicleTodayLoading() {
  return (
    <div
      className="daylight fixed inset-0 flex items-center justify-center"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <LyraLoading message="Preparing your chronicle..." />
    </div>
  );
}
