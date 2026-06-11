import { CustomStyleForm } from "@/components/art-styles/custom-style-form";
import { EditorialShell, EditorialHeader } from "@/components/editorial";

export default function NewDeckStylePage() {
  return (
    <EditorialShell>
      <div className="mx-auto max-w-lg px-6 pb-28 pt-10 sm:px-10 sm:pt-14">
        <EditorialHeader
          backHref="/decks/styles"
          backLabel="Art styles"
          eyebrow="Deck"
          title="Create custom style"
          whisper="Define a unique visual language for your oracle cards."
          className="mb-8"
        />
        <CustomStyleForm />
      </div>
    </EditorialShell>
  );
}
