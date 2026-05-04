export interface CompressImageOptions {
  maxEdge?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp";
}

const DEFAULTS = {
  maxEdge: 1600,
  quality: 0.82,
  mimeType: "image/jpeg" as const,
  skipBelowBytes: 400 * 1024,
};

export async function compressImage(
  file: File,
  opts: CompressImageOptions = {},
): Promise<Blob> {
  const maxEdge = opts.maxEdge ?? DEFAULTS.maxEdge;
  const quality = opts.quality ?? DEFAULTS.quality;
  const mimeType = opts.mimeType ?? DEFAULTS.mimeType;

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  try {
    const { width, height } = bitmap;
    const longest = Math.max(width, height);
    const alreadySmall =
      file.size <= DEFAULTS.skipBelowBytes && longest <= maxEdge;

    const scale = longest > maxEdge ? maxEdge / longest : 1;
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    if (alreadySmall && file.type === mimeType) {
      return file;
    }

    const canvas = typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(targetW, targetH)
      : Object.assign(document.createElement("canvas"), {
          width: targetW,
          height: targetH,
        });

    const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    (ctx as CanvasRenderingContext2D).drawImage(bitmap, 0, 0, targetW, targetH);

    if ("convertToBlob" in canvas) {
      return await canvas.convertToBlob({ type: mimeType, quality });
    }

    return await new Promise<Blob>((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob returned null"))),
        mimeType,
        quality,
      );
    });
  } finally {
    bitmap.close?.();
  }
}
