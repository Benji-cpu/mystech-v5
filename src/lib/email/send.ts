import { render } from "@react-email/components";
import { getResend, EMAIL_FROM } from "./client";
import { WelcomeEmail } from "@/emails/welcome";
import { FirstReadingReflectionEmail } from "@/emails/first-reading-reflection";

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
