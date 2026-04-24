export type ShareIntentInput = {
  url: string;
  text?: string;
};

export function twitterIntent({ url, text }: ShareIntentInput): string {
  const params = new URLSearchParams();
  if (text) params.set("text", text);
  params.set("url", url);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function whatsappIntent({ url, text }: ShareIntentInput): string {
  const message = text ? `${text} ${url}` : url;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function emailIntent({
  url,
  text,
  subject,
}: ShareIntentInput & { subject?: string }): string {
  const resolvedSubject = subject ?? "An oracle reading to share with you";
  const body = text ? `${text}\n\n${url}` : url;
  const params = new URLSearchParams({ subject: resolvedSubject, body });
  return `mailto:?${params.toString()}`;
}

export function telegramIntent({ url, text }: ShareIntentInput): string {
  const params = new URLSearchParams({ url });
  if (text) params.set("text", text);
  return `https://t.me/share/url?${params.toString()}`;
}

export type WebShareData = {
  title?: string;
  text?: string;
  url: string;
};

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function triggerWebShare(data: WebShareData): Promise<boolean> {
  if (!canUseWebShare()) return false;
  try {
    await navigator.share(data);
    return true;
  } catch {
    return false;
  }
}
