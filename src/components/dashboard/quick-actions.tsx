import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const actions = [
  {
    icon: Plus,
    title: "Create New Deck",
    description: "Build a personalized oracle deck from your experiences.",
    href: "/decks/new",
  },
  {
    icon: BookOpen,
    title: "Start a Reading",
    description: "Draw cards and receive AI-powered insights.",
    href: "/readings/new",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {actions.map((action) => (
        <Button
          key={action.title}
          variant="outline"
          className="h-auto p-0"
          asChild
        >
          <Link href={action.href}>
            <Card className="w-full border-0 shadow-none">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{action.title}</p>
                  <p className="text-sm font-normal text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </Button>
      ))}
    </div>
  );
}
