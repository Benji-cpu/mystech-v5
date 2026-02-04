import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <div className="relative">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Primary glow */}
        <div className="absolute -inset-20 rounded-full bg-primary/5 blur-3xl" />
        {/* Secondary offset glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/5 blur-2xl" />
        {/* Star dots */}
        <div className="absolute -left-8 top-12 h-1 w-1 rounded-full bg-primary/30" />
        <div className="absolute -right-12 top-24 h-1.5 w-1.5 rounded-full bg-primary/20" />
        <div className="absolute -left-16 bottom-20 h-1 w-1 rounded-full bg-primary/25" />
        <div className="absolute -right-6 bottom-8 h-1 w-1 rounded-full bg-primary/30" />
        <div className="absolute left-4 -top-8 h-1.5 w-1.5 rounded-full bg-primary/20" />
        <div className="absolute right-8 -bottom-6 h-1 w-1 rounded-full bg-primary/25" />
      </div>

      <Card className="relative w-full max-w-sm border-border/50">
        <CardHeader className="items-center space-y-3 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome to MysTech</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to begin your mystical journey
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <GoogleSignInButton />
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
