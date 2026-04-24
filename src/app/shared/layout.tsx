import Link from "next/link";
import { FeedbackFab } from "@/components/feedback/feedback-fab";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="daylight flex min-h-screen flex-col"
      style={{ background: "var(--paper)" }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: "var(--line)", background: "rgba(251, 247, 238, 0.85)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="display text-lg"
            style={{ color: "var(--ink)" }}
          >
            MysTech
          </Link>
          <Link
            href="/login"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-[var(--ink)]"
            style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
          >
            Create your own →
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <FeedbackFab />

      <footer className="border-t py-10" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p
            className="whisper text-base mb-5"
            style={{ color: "var(--ink-soft)" }}
          >
            Want to create your own oracle card deck?
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            Get started free →
          </Link>
        </div>
      </footer>
    </div>
  );
}
