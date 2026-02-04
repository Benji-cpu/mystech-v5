import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomStyleForm } from "@/components/art-styles/custom-style-form";

export default function NewArtStylePage() {
  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <Link
        href="/art-styles"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Art Styles
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Create Custom Style</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define a unique art style for your oracle cards
        </p>
      </div>

      <CustomStyleForm />
    </div>
  );
}
