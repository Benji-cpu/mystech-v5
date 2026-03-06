import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { detectSTTProvider, isBraveBrowser, hasWebSpeechAPI, canRunWhisper } from "./detect";

describe("isBraveBrowser", () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
  });

  it("returns true when navigator.brave exists", () => {
    Object.defineProperty(global, "navigator", {
      value: { brave: { isBrave: vi.fn() } },
      configurable: true,
    });
    expect(isBraveBrowser()).toBe(true);
  });

  it("returns false for standard Chrome", () => {
    Object.defineProperty(global, "navigator", {
      value: {},
      configurable: true,
    });
    expect(isBraveBrowser()).toBe(false);
  });

  it("returns false during SSR (no navigator)", () => {
    Object.defineProperty(global, "navigator", {
      value: undefined,
      configurable: true,
    });
    expect(isBraveBrowser()).toBe(false);
  });
});

describe("hasWebSpeechAPI", () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, "window", {
      value: originalWindow,
      configurable: true,
    });
  });

  it("returns true when SpeechRecognition exists", () => {
    Object.defineProperty(global.window, "SpeechRecognition", {
      value: class {},
      configurable: true,
    });
    expect(hasWebSpeechAPI()).toBe(true);
    // Clean up
    Object.defineProperty(global.window, "SpeechRecognition", {
      value: undefined,
      configurable: true,
    });
  });

  it("returns true when webkitSpeechRecognition exists", () => {
    Object.defineProperty(global.window, "webkitSpeechRecognition", {
      value: class {},
      configurable: true,
    });
    expect(hasWebSpeechAPI()).toBe(true);
    Object.defineProperty(global.window, "webkitSpeechRecognition", {
      value: undefined,
      configurable: true,
    });
  });

  it("returns false when neither exists", () => {
    expect(hasWebSpeechAPI()).toBe(false);
  });
});

describe("canRunWhisper", () => {
  it("returns true when MediaRecorder and WebAssembly exist", () => {
    // jsdom provides WebAssembly; MediaRecorder may not be available
    const hadMediaRecorder = typeof global.MediaRecorder !== "undefined";
    if (!hadMediaRecorder) {
      Object.defineProperty(global, "MediaRecorder", {
        value: class {},
        configurable: true,
      });
    }
    expect(canRunWhisper()).toBe(true);
    if (!hadMediaRecorder) {
      Object.defineProperty(global, "MediaRecorder", {
        value: undefined,
        configurable: true,
      });
    }
  });
});

describe("detectSTTProvider", () => {
  let originalNavigator: typeof global.navigator;

  beforeEach(() => {
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
    // Clean up speech APIs
    Object.defineProperty(global.window, "SpeechRecognition", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(global.window, "webkitSpeechRecognition", {
      value: undefined,
      configurable: true,
    });
  });

  it("returns 'web-speech' for Chrome (SpeechRecognition + not Brave)", () => {
    Object.defineProperty(global.window, "webkitSpeechRecognition", {
      value: class {},
      configurable: true,
    });
    Object.defineProperty(global, "navigator", {
      value: {},
      configurable: true,
    });
    expect(detectSTTProvider()).toBe("web-speech");
  });

  it("returns 'whisper' for Brave (has Speech API but blocked)", () => {
    Object.defineProperty(global.window, "webkitSpeechRecognition", {
      value: class {},
      configurable: true,
    });
    Object.defineProperty(global, "navigator", {
      value: { brave: { isBrave: vi.fn() } },
      configurable: true,
    });
    // Ensure MediaRecorder is available for Whisper fallback
    const hadMediaRecorder = typeof global.MediaRecorder !== "undefined";
    if (!hadMediaRecorder) {
      Object.defineProperty(global, "MediaRecorder", {
        value: class {},
        configurable: true,
      });
    }
    expect(detectSTTProvider()).toBe("whisper");
    if (!hadMediaRecorder) {
      Object.defineProperty(global, "MediaRecorder", {
        value: undefined,
        configurable: true,
      });
    }
  });

  it("returns 'whisper' for Firefox (no Speech API, has MediaRecorder)", () => {
    Object.defineProperty(global, "navigator", {
      value: {},
      configurable: true,
    });
    const hadMediaRecorder = typeof global.MediaRecorder !== "undefined";
    if (!hadMediaRecorder) {
      Object.defineProperty(global, "MediaRecorder", {
        value: class {},
        configurable: true,
      });
    }
    expect(detectSTTProvider()).toBe("whisper");
    if (!hadMediaRecorder) {
      Object.defineProperty(global, "MediaRecorder", {
        value: undefined,
        configurable: true,
      });
    }
  });

  it("returns null when nothing is available", () => {
    Object.defineProperty(global, "navigator", {
      value: {},
      configurable: true,
    });
    // Ensure no MediaRecorder
    const hadMediaRecorder = typeof global.MediaRecorder !== "undefined";
    if (hadMediaRecorder) {
      Object.defineProperty(global, "MediaRecorder", {
        value: undefined,
        configurable: true,
      });
    }
    // Also need to remove WebAssembly to make canRunWhisper fail
    const hadWasm = typeof global.WebAssembly !== "undefined";
    if (hadWasm) {
      Object.defineProperty(global, "WebAssembly", {
        value: undefined,
        configurable: true,
      });
    }
    expect(detectSTTProvider()).toBe(null);
    if (hadMediaRecorder) {
      Object.defineProperty(global, "MediaRecorder", {
        value: class {},
        configurable: true,
      });
    }
    if (hadWasm) {
      Object.defineProperty(global, "WebAssembly", {
        value: WebAssembly,
        configurable: true,
      });
    }
  });
});
