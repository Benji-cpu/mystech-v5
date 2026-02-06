"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

interface MarketingSidebarProps {
  isLoggedIn: boolean;
  onNavigate?: () => void;
}

export function MarketingSidebar({ isLoggedIn, onNavigate }: MarketingSidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo header — matches AppSidebar */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Sparkles className="h-5 w-5 text-sidebar-primary" />
        <span className="text-lg font-bold">MysTech</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href={isLoggedIn ? "/dashboard" : "/login"}
          onClick={onNavigate}
          className="flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          {isLoggedIn ? "Dashboard" : "Sign In"}
        </Link>
      </div>
    </aside>
  );
}
