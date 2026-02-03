"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { AppSidebar } from "./app-sidebar";

interface AppHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    decks: "My Decks",
    new: "New",
    readings: "Readings",
    "person-cards": "Person Cards",
    "art-styles": "Art Styles",
    settings: "Settings",
    billing: "Billing",
  };

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {segments.map((segment, i) => (
        <span key={segment + i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          <span className={i === segments.length - 1 ? "text-foreground" : ""}>
            {labels[segment] ?? segment}
          </span>
        </span>
      ))}
    </div>
  );
}

export function AppHeader({ user }: AppHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
      {/* Mobile sidebar trigger */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Mobile logo */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-bold">MysTech</span>
      </Link>

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
