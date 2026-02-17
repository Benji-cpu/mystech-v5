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
    href: "/mock/reading",
    label: "Reading",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    exact: false,
  },
  {
    href: "/mock/creation",
    label: "Creation",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    exact: false,
  },
  {
    href: "/mock/effects",
    label: "Effects",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    exact: false,
  },
];

// Pages where the tab bar should be hidden (immersive experiences)
const IMMERSIVE_ROUTES = [
  "/mock/reading/ceremony",
  "/mock/reading/materialization",
  "/mock/creation/simple",
  "/mock/creation/journey",
  "/mock/creation/forging",
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
