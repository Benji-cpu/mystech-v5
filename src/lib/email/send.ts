import { render } from "@react-email/components";
import { getResend, EMAIL_FROM } from "./client";
import { WelcomeEmail } from "@/emails/welcome";
import { FirstReadingReflectionEmail } from "@/emails/first-reading-reflection";
import { DailyCardEmail } from "@/emails/daily-card";
import { PrintOrderConfirmationEmail } from "@/emails/print-order-confirmation";
import { PrintOrderShippedEmail } from "@/emails/print-order-shipped";
import { PrintOrderRefundedEmail } from "@/emails/print-order-refunded";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mystech.app";

type BaseOptions = {
  to: string;
  name?: string | null;
};

export async function sendWelcomeEmail(opts: BaseOptions): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    const html = await render(WelcomeEmail({ name: opts.name ?? undefined, appUrl: APP_URL }));
    await resend.emails.send({
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
    await resend.emails.send({
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
    await resend.emails.send({
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
    await resend.emails.send({
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
    await resend.emails.send({
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
  card: { title: string; meaning: string; guidance: string; imageUrl: string | null };
  deck: { id: string; title: string };
  deepLinkPath: string; // e.g. "/daily?d=<readingId>"
}): Promise<{ id: string } | null> {
  const resend = getResend();
  if (!resend) return null;
  const cardUrl = `${APP_URL}${opts.deepLinkPath}`;
  const subject = `Today's card: ${opts.card.title}`;
  try {
    const html = await render(
      DailyCardEmail({
        name: opts.name ?? undefined,
        card: opts.card,
        deck: opts.deck,
        cardUrl,
        appUrl: APP_URL,
      }),
    );
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject,
      html,
      tags: [{ name: "kind", value: "daily-card" }],
    });
    const id = result?.data?.id ?? null;
    return id ? { id } : null;
  } catch (err) {
    console.error("[email] sendDailyCardEmail failed:", err);
    return null;
  }
}
