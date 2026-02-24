"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/mock",
    label: "Hub",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/mock/approved",
    label: "Approved",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    exact: false,
  },
  {
    href: "/mock/transitions",
    label: "Transitions",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    exact: false,
  },
];

// Pages where the tab bar should be hidden (immersive experiences)
const IMMERSIVE_ROUTES = [
  "/mock/approved/ceremony",
  "/mock/approved/background-moods",
  "/mock/approved/v1",
  "/mock/approved/lyra-journey",
  "/mock/approved/card-morph",
  "/mock/full/v",
  "/mock/transitions/v",
  "/mock/lyra/v",
  "/mock/lyra/integrated",
  "/mock/navigation",
  "/mock/reading/ceremony-v2",
];

export default function MockLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = IMMERSIVE_ROUTES.some((r) => pathname.startsWith(r));

  const isActive = (tab: (typeof tabs)[number]) => {
    if (tab.exact) return pathname === tab.href;
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}

      {/* Fixed bottom tab switcher */}
      {!hideChrome && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-lg">
            <p className="hidden sm:block pt-1.5 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              Mock Prototypes
            </p>
            <nav className="flex items-center justify-around px-2 py-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    isActive(tab)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom padding to account for fixed tab bar */}
      {!hideChrome && <div className="h-20 sm:h-24" />}
    </div>
  );
}
