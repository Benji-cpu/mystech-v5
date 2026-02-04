import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function UpgradeCta() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">
            Unlock the full experience
          </h3>
          <p className="text-sm text-muted-foreground">
            Get unlimited decks, more readings, all spread types, and premium AI
            models with MysTech Pro.
          </p>
        </div>
        <Button asChild>
          <Link href="/pricing">Go Pro - $4.99/mo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
