import { getSharedArtStyleByToken } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const style = await getSharedArtStyleByToken(token);

  if (!style) {
    return { title: "Art Style Not Found" };
  }

  return {
    title: `${style.name} Art Style - MysTech`,
    description: style.description,
    openGraph: {
      title: `${style.name} Art Style - MysTech`,
      description: style.description,
    },
  };
}

export default async function SharedArtStylePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const style = await getSharedArtStyleByToken(token);

  if (!style) notFound();

  const previewImages = (style.previewImages as string[]) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold font-display">{style.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          {style.description}
        </p>
      </div>

      {/* Preview images gallery */}
      {previewImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {previewImages.map((url, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl overflow-hidden border border-border/50"
            >
              <img
                src={url}
                alt={`${style.name} preview ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No preview images available for this style.
        </div>
      )}
    </div>
  );
}
