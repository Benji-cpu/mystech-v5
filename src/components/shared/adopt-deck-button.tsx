"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdoptDeckButtonProps {
  deckId: string;
  isAdopted?: boolean;
  isOwner?: boolean;
  isLoggedIn?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AdoptDeckButton({
  deckId,
  isAdopted = false,
  isOwner = false,
  isLoggedIn = true,
  variant = "default",
  size = "sm",
}: AdoptDeckButtonProps) {
  const [adopted, setAdopted] = useState(isAdopted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (isOwner) return null;

  if (!isLoggedIn) {
    return (
      <Button asChild size={size} variant={variant}>
        <Link href="/login">
          <Plus className="h-4 w-4 mr-1" />
          Sign Up to Add
        </Link>
      </Button>
    );
  }

  async function handleToggle() {
    setLoading(true);
    try {
      const method = adopted ? "DELETE" : "POST";
      const res = await fetch(`/api/decks/${deckId}/adopt`, { method });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      setAdopted(!adopted);
      toast.success(adopted ? "Removed from collection" : "Added to collection");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (adopted) {
    return (
      <Button
        size={size}
        variant="outline"
        onClick={handleToggle}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <X className="h-4 w-4 mr-1" />
        )}
        Remove from Collection
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Plus className="h-4 w-4 mr-1" />
      )}
      Add to Collection
    </Button>
  );
}
