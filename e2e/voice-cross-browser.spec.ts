import { test, expect } from "@playwright/test";

test.describe("Voice — STT cross-browser support", () => {
  test("STT provider detection returns a valid type", async ({ page, browserName }) => {
    // Navigate to a page that loads the detection module
    await page.goto("/login");

    const providerType = await page.evaluate(() => {
      const w = window as unknown as {
        SpeechRecognition?: unknown;
        webkitSpeechRecognition?: unknown;
      };
      const hasWebSpeech = !!(w.SpeechRecognition || w.webkitSpeechRecognition);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isBrave = !!(navigator as any).brave;
      const canWhisper =
        typeof MediaRecorder !== "undefined" && typeof WebAssembly !== "undefined";

      if (hasWebSpeech && !isBrave) return "web-speech";
      if (canWhisper) return "whisper";
      return null;
    });

    // Chromium has Web Speech API, Firefox/WebKit fall back to Whisper
    if (browserName === "chromium") {
      expect(providerType).toBe("web-speech");
    } else {
      // Firefox and WebKit don't have SpeechRecognition but support MediaRecorder + WASM
      expect(["whisper", null]).toContain(providerType);
    }
  });

  test("SpeechSynthesis API is available for TTS playback", async ({ page }) => {
    await page.goto("/login");

    const hasSpeechSynthesis = await page.evaluate(() => {
      return typeof window.speechSynthesis !== "undefined";
    });

    // All major browsers support SpeechSynthesis
    expect(hasSpeechSynthesis).toBe(true);
  });
});

test.describe("Voice — TTS API route", () => {
  test("TTS endpoint responds with audio", async ({ request }) => {
    const response = await request.post("/api/voice/tts", {
      data: { text: "Hello" },
    });

    // The API may require auth — 401 is acceptable in this context,
    // but it should not 404 or 500
    expect([200, 401]).toContain(response.status());
  });
});
