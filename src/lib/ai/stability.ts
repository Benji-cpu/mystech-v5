const STABILITY_API_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/core";

interface StabilityOptions {
  prompt: string;
  aspectRatio?: string;
  outputFormat?: "png" | "jpeg" | "webp";
}

export async function generateStabilityImage(
  options: StabilityOptions
): Promise<Buffer> {
  const apiKey = process.env.STABILITY_AI_API_KEY;
  if (!apiKey) {
    console.error("[stability] STABILITY_AI_API_KEY is not configured");
    throw new Error("STABILITY_AI_API_KEY is not configured");
  }

  const formData = new FormData();
  formData.append("prompt", options.prompt);
  formData.append("aspect_ratio", options.aspectRatio ?? "2:3");
  formData.append("output_format", options.outputFormat ?? "png");

  const response = await fetch(STABILITY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[stability] API error ${response.status}:`, errorText);
    throw new Error(
      `Stability AI error ${response.status}: ${errorText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
