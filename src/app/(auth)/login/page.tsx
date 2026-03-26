import Link from "next/link";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const errorMessages: Record<string, string> = {
  AccessDenied: "Access was denied. You may have cancelled the sign-in.",
  OAuthCallback:
    "There was a problem signing in with Google. Please try again.",
  OAuthAccountNotLinked:
    "This email is already associated with another sign-in method.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error
    ? errorMessages[error] ?? "An unexpected error occurred. Please try again."
    : null;

  return (
    <div className="w-full max-w-sm space-y-8 text-center">
      {/* Sigil */}
      <div className="flex justify-center">
        <LyraSigil size="xl" state="idle" />
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">MysTech</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to begin your mystical exploration
        </p>
      </div>

      {/* Error + Button */}
      <div className="space-y-4">
        {errorMessage && (
          <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errorMessage}
          </div>
        )}
        <GoogleSignInButton />
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our terms of service.
        </p>
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back to home
      </Link>
    </div>
  );
}
