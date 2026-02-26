"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Layers,
  ScrollText,
  BookOpen,
  Compass,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UsageIndicator } from "@/components/shared/usage-indicator";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/decks", label: "My Decks", icon: Layers },
  { href: "/chronicle", label: "Chronicle", icon: ScrollText },
  { href: "/readings", label: "Readings", icon: BookOpen },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/profile", label: "Dashboard", icon: User },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Sparkles className="h-5 w-5 text-sidebar-primary" />
        <span className="text-lg font-bold">MysTech</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <UsageIndicator />
      </div>
    </aside>
  );
}
