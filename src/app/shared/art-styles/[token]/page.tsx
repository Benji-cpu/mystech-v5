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
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <header className="mb-10 text-center">
        <p className="eyebrow">A shared art style</p>
        <h1
          className="display mt-3 text-[clamp(2rem,7vw,3rem)] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          {style.name}
        </h1>
        <p
          className="whisper mx-auto mt-4 max-w-lg text-base leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          {style.description}
        </p>
      </header>

      {previewImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {previewImages.map((url, i) => (
            <div
              key={i}
              className="aspect-[2/3] overflow-hidden rounded-md border"
              style={{ borderColor: "var(--line)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${style.name} preview ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="whisper py-12 text-center text-base"
          style={{ color: "var(--ink-mute)" }}
        >
          No preview images available for this style.
        </div>
      )}
    </div>
  );
}
