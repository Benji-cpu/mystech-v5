import { CustomStyleForm } from "@/components/art-styles/custom-style-form";

export default function NewArtStylePage() {
  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Create Custom Style</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define a unique art style for your oracle cards
        </p>
      </div>

      <CustomStyleForm />
    </div>
  );
}
