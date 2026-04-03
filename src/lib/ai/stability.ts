const STABILITY_API_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/core";

export interface StabilityOptions {
  prompt: string;
  negativePrompt?: string;
  stylePreset?: string;
  aspectRatio?: string;
  outputFormat?: "png" | "jpeg" | "webp";
  // Studio additions
  seed?: number;
  cfgScale?: number;
  sampler?: string;
  initImage?: Buffer;
  initImageStrength?: number;
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
  if (options.negativePrompt) {
    formData.append("negative_prompt", options.negativePrompt);
  }
  if (options.stylePreset) {
    formData.append("style_preset", options.stylePreset);
  }
  formData.append("aspect_ratio", options.aspectRatio ?? "2:3");
  formData.append("output_format", options.outputFormat ?? "png");

  // Studio parameters
  if (options.seed != null && options.seed > 0) {
    formData.append("seed", String(options.seed));
  }
  if (options.cfgScale != null) {
    formData.append("cfg_scale", String(Math.min(15, Math.max(5, options.cfgScale))));
  }
  if (options.sampler) {
    formData.append("sampler", options.sampler);
  }
  if (options.initImage) {
    const blob = new Blob([new Uint8Array(options.initImage)], { type: "image/png" });
    formData.append("init_image", blob, "init_image.png");
    formData.append(
      "init_image_mode",
      "IMAGE_STRENGTH"
    );
    formData.append(
      "image_strength",
      String(options.initImageStrength ?? 0.35)
    );
  }

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
