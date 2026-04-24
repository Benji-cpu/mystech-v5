import { Resend } from "resend";

let client: Resend | null = null;

export function getResend(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client = new Resend(apiKey);
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "MysTech <hello@mystech.app>";
