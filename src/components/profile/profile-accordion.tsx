"use client";

import { useState, useEffect, useCallback } from "react";

export type AccordionSection = "sanctum" | "settings";

interface ProfileAccordionProps {
  defaultOpen?: AccordionSection | null;
  children: (api: {
    openSection: AccordionSection | null;
    toggleSection: (section: AccordionSection) => void;
  }) => React.ReactNode;
  className?: string;
}

export function ProfileAccordion({
  defaultOpen = null,
  children,
  className,
}: ProfileAccordionProps) {
  const [openSection, setOpenSection] = useState<AccordionSection | null>(defaultOpen);

  // Absorb #settings hash auto-open logic
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#settings") {
      setOpenSection("settings");
      setTimeout(() => {
        document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  const toggleSection = useCallback((section: AccordionSection) => {
    setOpenSection((prev) => (prev === section ? null : section));
  }, []);

  return (
    <div className={className}>
      {children({ openSection, toggleSection })}
    </div>
  );
}
