"use client";

import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/40 bg-background/80 px-6 backdrop-blur-md">
      <Badge variant="outline" className="border-orange-500/50 text-orange-500">
        ADMIN
      </Badge>
      {user.role === "tester" && (
        <Badge variant="secondary" className="text-xs">
          View Only
        </Badge>
      )}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
