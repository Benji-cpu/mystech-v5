"use client";

import { useState, ReactNode, isValidElement, cloneElement, ReactElement } from "react";
import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";

interface SiteHeaderProps {
  /** Content to render in the mobile drawer - can be a ReactNode or render function */
  sidebarContent: ReactNode | ((onNavigate: () => void) => ReactNode);
  /** Content to render on the right side (UserMenu, SignIn button, etc.) */
  rightContent?: ReactNode;
  /** Optional desktop nav links (marketing only) */
  desktopNav?: ReactNode;
  /** Link destination for logo click */
  logoHref?: string;
  /** Show logo on desktop? (false for app — sidebar has logo) */
  showLogoOnDesktop?: boolean;
}

export function SiteHeader({
  sidebarContent,
  rightContent,
  desktopNav,
  logoHref = "/",
  showLogoOnDesktop = true,
}: SiteHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = () => setSidebarOpen(false);

  // Render sidebar content - support both ReactNode and render function
  const renderSidebarContent = () => {
    if (typeof sidebarContent === "function") {
      return sidebarContent(handleNavigate);
    }
    // If it's a valid React element with onNavigate prop support, clone with the callback
    if (isValidElement(sidebarContent)) {
      return cloneElement(sidebarContent as ReactElement<{ onNavigate?: () => void }>, {
        onNavigate: handleNavigate,
      });
    }
    return sidebarContent;
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
      {/* Mobile sidebar trigger — LEFT side */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      {/* Logo — LEFT side, next to hamburger */}
      <Link
        href={logoHref}
        className={`flex items-center gap-2 ${showLogoOnDesktop ? "" : "md:hidden"}`}
      >
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-bold">MysTech</span>
      </Link>

      {/* Desktop nav links (optional, marketing only) */}
      {desktopNav && (
        <nav className="ml-8 hidden items-center gap-6 md:flex">
          {desktopNav}
        </nav>
      )}

      {/* Right side content */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {rightContent}
      </div>
    </header>
  );
}
