import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SharedNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-2xl font-bold mb-2">Content Not Available</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        This content is no longer available. It may have been removed or the
        share link has been revoked.
      </p>
      <Link href="/login">
        <Button>Create Your Own Deck</Button>
      </Link>
    </div>
  );
}
