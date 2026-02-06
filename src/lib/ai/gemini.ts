import { google } from "@ai-sdk/google";

// Pro tier model (Gemini 2.5 Flash)
export const geminiProModel = google("gemini-2.5-flash");

// Free tier model - using gemini-2.5-flash-lite
// - gemini-2.0-flash-lite is DEPRECATED (retiring March 31, 2026, quota disabled)
// - gemini-1.5-flash has v1beta compatibility issues
// - gemini-2.5-flash-lite has best free tier limits (15 RPM, 1000 RPD)
export const geminiFreeModel = google("gemini-2.5-flash-lite");

// Default model used for generation (Free tier for now until Pro credits available)
export const geminiModel = geminiFreeModel;
