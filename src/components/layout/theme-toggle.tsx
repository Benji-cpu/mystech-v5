"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const order = ["light", "dark", "system"] as const;
type ThemeMode = (typeof order)[number];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = (mounted ? (theme as ThemeMode) : "system") ?? "system";
  const next = order[(order.indexOf(current) + 1) % order.length];
  const Icon = current === "dark" ? Moon : current === "light" ? Sun : Monitor;
  const label = `Theme: ${current}. Switch to ${next}.`;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={cn("text-foreground/70 hover:text-foreground", className)}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
