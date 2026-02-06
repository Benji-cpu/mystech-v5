"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MockLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/mock/1", label: "Co-Star", num: "1" },
    { href: "/mock/2", label: "Golden Thread", num: "2" },
    { href: "/mock/3", label: "Calm", num: "3" },
    { href: "/mock/4", label: "Hybrid", num: "4" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}

      {/* Fixed bottom tab switcher */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <p className="hidden sm:block pt-1.5 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Mock Comparison
          </p>
          <nav className="flex items-center justify-around px-2 py-2">
            <Link
              href="/mock"
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                pathname === "/mock"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Index</span>
            </Link>
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  pathname === tab.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  pathname === tab.href
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {tab.num}
                </span>
                <span>{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom padding to account for fixed tab bar */}
      <div className="h-20 sm:h-24" />
    </div>
  );
}
