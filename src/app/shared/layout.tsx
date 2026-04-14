import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeedbackFab } from "@/components/feedback/feedback-fab";
import { Sparkles } from "lucide-react";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <Sparkles className="h-5 w-5 text-gold" />
            <span>MysTech</span>
          </Link>
          <Link href="/login">
            <Button size="sm" variant="outline">
              Create Your Own
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>
      <FeedbackFab />

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-muted-foreground text-sm mb-3">
            Want to create your own oracle card deck?
          </p>
          <Link href="/login">
            <Button>Get Started Free</Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
