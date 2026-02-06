"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "./site-header";
import { MarketingSidebar } from "./marketing-sidebar";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

interface MarketingNavbarProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function MarketingNavbar({ user }: MarketingNavbarProps) {
  const isLoggedIn = !!user;

  return (
    <SiteHeader
      logoHref="/"
      showLogoOnDesktop={true}
      sidebarContent={<MarketingSidebar isLoggedIn={isLoggedIn} />}
      desktopNav={
        <>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </>
      }
      rightContent={
        <Button asChild>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            {isLoggedIn ? "Dashboard" : "Sign In"}
          </Link>
        </Button>
      }
    />
  );
}
