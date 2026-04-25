import { LyraLoading } from "@/components/guide/lyra-loading";

export default function ChronicleSetupLoading() {
  return (
    <div
      className="daylight fixed inset-0 flex items-center justify-center"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <LyraLoading message="Setting up your Chronicle..." />
    </div>
  );
}
