import Link from "next/link";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { EmailSignInForm } from "@/components/auth/email-sign-in-form";

const errorMessages: Record<string, string> = {
  AccessDenied: "Access was denied. You may have cancelled the sign-in.",
  OAuthCallback:
    "There was a problem signing in with Google. Please try again.",
  OAuthAccountNotLinked:
    "This email is already associated with another sign-in method.",
};

const emailAuthEnabled = Boolean(process.env.RESEND_API_KEY);

// Only allow internal paths to prevent open-redirect via ?next=
function safeCallbackUrl(next: string | undefined): string {
  if (!next) return "/home";
  if (!next.startsWith("/") || next.startsWith("//")) return "/home";
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const errorMessage = error
    ? errorMessages[error] ?? "An unexpected error occurred. Please try again."
    : null;
  const callbackUrl = safeCallbackUrl(next);

  return (
    <div className="w-full max-w-sm space-y-10 text-center">
      {/* Sigil — small, understated */}
      <div className="flex justify-center opacity-80">
        <LyraSigil size="lg" state="idle" />
      </div>

      {/* Heading */}
      <div>
        <p className="eyebrow">MysTech</p>
        <h1
          className="display mt-3 text-[clamp(2.5rem,10vw,3.5rem)] leading-[0.95]"
          style={{ color: "var(--ink)" }}
        >
          Welcome back.
        </h1>
        <p
          className="whisper mt-4 text-base leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          Sign in to continue your practice.
        </p>
      </div>

      {/* Error + Button */}
      <div className="space-y-4">
        {errorMessage && (
          <div
            className="rounded-xl border p-3 text-center text-sm"
            style={{
              borderColor: "var(--line)",
              background: "var(--paper-card)",
              color: "var(--ink)",
            }}
          >
            {errorMessage}
          </div>
        )}
        <GoogleSignInButton callbackUrl={callbackUrl} />
        {emailAuthEnabled && (
          <>
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: "var(--ink-faint)" }}
            >
              <span
                className="h-px flex-1"
                style={{ background: "var(--line)" }}
              />
              <span className="uppercase tracking-[0.18em]">or</span>
              <span
                className="h-px flex-1"
                style={{ background: "var(--line)" }}
              />
            </div>
            <EmailSignInForm callbackUrl={callbackUrl} />
          </>
        )}
        <p className="text-xs" style={{ color: "var(--ink-mute)" }}>
          By signing in, you agree to our terms of service.
        </p>
      </div>

      <Link
        href="/"
        className="inline-block text-sm transition-colors"
        style={{ color: "var(--ink-mute)" }}
      >
        ← Back to home
      </Link>
    </div>
  );
}
