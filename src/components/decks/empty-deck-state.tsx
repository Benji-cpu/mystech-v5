import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function EmptyDeckState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-[#c9a94e]/10 p-4">
        <Sparkles className="h-8 w-8 text-[#c9a94e]" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Create your first oracle deck</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Describe a theme from your life and let AI craft a personalized deck of
        oracle cards just for you.
      </p>
      <Button asChild>
        <Link href="/decks/new">Create a Deck</Link>
      </Button>
    </div>
  );
}
