import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomStyleForm } from "@/components/art-styles/custom-style-form";

export default function NewArtStylePage() {
  return (
    <div
      className="daylight fixed inset-0 overflow-y-auto"
      style={{ background: "var(--paper)", zIndex: 1 }}
    >
      <div className="mx-auto max-w-lg px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <Link
          href="/art-styles"
          className="eyebrow inline-flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={14} /> Art styles
        </Link>
        <header className="mt-6 mb-8">
          <p className="eyebrow">Studio</p>
          <h1
            className="display mt-3 text-[clamp(2rem,7vw,3rem)] leading-[0.98]"
            style={{ color: "var(--ink)" }}
          >
            Create custom style
          </h1>
          <p
            className="whisper mt-3 text-base"
            style={{ color: "var(--ink-soft)" }}
          >
            Define a unique visual language for your oracle cards.
          </p>
        </header>
        <CustomStyleForm />
      </div>
    </div>
  );
}
