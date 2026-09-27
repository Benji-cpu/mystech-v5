import { render } from "@react-email/components";
import { getResend, EMAIL_FROM } from "./client";
import { WelcomeEmail } from "@/emails/welcome";
import { FirstReadingReflectionEmail } from "@/emails/first-reading-reflection";
import { DailyCardEmail } from "@/emails/daily-card";
import { PrintOrderConfirmationEmail } from "@/emails/print-order-confirmation";
import { PrintOrderShippedEmail } from "@/emails/print-order-shipped";
import { PrintOrderRefundedEmail } from "@/emails/print-order-refunded";
import { APP_URL } from "@/lib/app-url";

type ResendClient = NonNullable<ReturnType<typeof getResend>>;
type EmailPayload = Parameters<ResendClient["emails"]["send"]>[0];

/**
 * Resend does not throw when it refuses a message (an unverified sending
 * domain, a bad address): it resolves `{ data: null, error }`. Awaiting the
 * call and moving on therefore read every rejection as a success, and nothing
 * was ever logged. Log it, and hand the outcome back to callers that record it.
 */
async function sendOrLog(
  resend: ResendClient,
  payload: EmailPayload,
  options?: { idempotencyKey?: string },
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await resend.emails.send(payload, options);
  if (error || !data?.id) {
    const message = error?.message ?? "Resend returned no message id";
    console.error(`[email] "${payload.subject}" to ${payload.to} rejected: ${message}`);
    return { error: message };
  }
  return { id: data.id };
}

type BaseOptions = {
  to: string;
  name?: string | null;
};

export async function sendWelcomeEmail(opts: BaseOptions): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    const html = await render(WelcomeEmail({ name: opts.name ?? undefined, appUrl: APP_URL }));
    await sendOrLog(resend, {
      from: EMAIL_FROM,
      to: opts.to,
      subject: "Your oracle awaits ✦",
      html,
    });
  } catch (err) {
    console.error("[email] sendWelcomeEmail failed:", err);
  }
}

export async function sendFirstReadingReflection(opts: BaseOptions & {
  readingUrl: string | null;
  spreadLabel: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    const html = await render(
      FirstReadingReflectionEmail({
        name: opts.name ?? undefined,
        readingUrl: opts.readingUrl,
        spreadLabel: opts.spreadLabel,
        appUrl: APP_URL,
      }),
    );
    await sendOrLog(resend, {
      from: EMAIL_FROM,
      to: opts.to,
      subject: "How did that first reading land?",
      html,
    });
  } catch (err) {
    console.error("[email] sendFirstReadingReflection failed:", err);
  }
}

export async function sendPrintOrderConfirmation(opts: BaseOptions & {
  orderId: string;
  deckTitle: string;
  cardCount: number;
  amountTotal: number;
  currency: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    const html = await render(
      PrintOrderConfirmationEmail({
        name: opts.name ?? undefined,
        orderId: opts.orderId,
        deckTitle: opts.deckTitle,
        cardCount: opts.cardCount,
        amountTotal: opts.amountTotal,
        currency: opts.currency,
        appUrl: APP_URL,
      })
    );
    await sendOrLog(resend, {
      from: EMAIL_FROM,
      to: opts.to,
      subject: `Your ${opts.deckTitle} deck is in production`,
      html,
      tags: [{ name: "kind", value: "print-confirmation" }],
    });
  } catch (err) {
    console.error("[email] sendPrintOrderConfirmation failed:", err);
  }
}

export async function sendPrintOrderShipped(opts: BaseOptions & {
  orderId: string;
  deckTitle: string;
  carrier: string;
  tracking: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    const html = await render(
      PrintOrderShippedEmail({
        name: opts.name ?? undefined,
        orderId: opts.orderId,
        deckTitle: opts.deckTitle,
        carrier: opts.carrier,
        tracking: opts.tracking,
        appUrl: APP_URL,
      })
    );
    await sendOrLog(resend, {
      from: EMAIL_FROM,
      to: opts.to,
      subject: `Your ${opts.deckTitle} deck has shipped`,
      html,
      tags: [{ name: "kind", value: "print-shipped" }],
    });
  } catch (err) {
    console.error("[email] sendPrintOrderShipped failed:", err);
  }
}

export async function sendPrintOrderRefunded(opts: BaseOptions & {
  orderId: string;
  deckTitle: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    const html = await render(
      PrintOrderRefundedEmail({
        name: opts.name ?? undefined,
        orderId: opts.orderId,
        deckTitle: opts.deckTitle,
        appUrl: APP_URL,
      })
    );
    await sendOrLog(resend, {
      from: EMAIL_FROM,
      to: opts.to,
      subject: `Refund processed — ${opts.deckTitle}`,
      html,
      tags: [{ name: "kind", value: "print-refunded" }],
    });
  } catch (err) {
    console.error("[email] sendPrintOrderRefunded failed:", err);
  }
}

export async function sendDailyCardEmail(opts: BaseOptions & {
  streakCount: number;
  hasChronicle: boolean;
  card: { title: string; imageUrl: string | null } | null;
  /** No deck to draw from — send the one-off invitation instead of nothing. */
  noDeck?: boolean;
  deepLinkPath: string; // e.g. "/today"
  /** Resend drops a repeat of the same key for 24h, so a retried tick cannot double-send. */
  idempotencyKey?: string;
}): Promise<{ id: string } | { error: string }> {
  const resend = getResend();
  if (!resend) return { error: "RESEND_API_KEY is not set" };
  const ctaUrl = `${APP_URL}${opts.deepLinkPath}`;
  const subject = opts.noDeck
    ? "Your daily card is on — you just need a deck"
    : opts.streakCount > 0
      ? `Day ${opts.streakCount} and counting — your card awaits`
      : "Your card awaits";
  try {
    const html = await render(
      DailyCardEmail({
        name: opts.name ?? undefined,
        streakCount: opts.streakCount,
        hasChronicle: opts.hasChronicle,
        card: opts.card,
        noDeck: opts.noDeck,
        ctaUrl,
        appUrl: APP_URL,
      }),
    );
    return await sendOrLog(
      resend,
      {
        from: EMAIL_FROM,
        to: opts.to,
        subject,
        html,
        tags: [{ name: "kind", value: "daily-card" }],
      },
      opts.idempotencyKey ? { idempotencyKey: opts.idempotencyKey } : undefined,
    );
  } catch (err) {
    console.error("[email] sendDailyCardEmail failed:", err);
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
