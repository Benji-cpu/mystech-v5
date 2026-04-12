"use client";

import { useGuidance } from "@/hooks/use-guidance";
import { GuidanceScreen } from "@/components/guide/guidance-screen";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PathsGuidanceWrapperProps {
  children: ReactNode;
}

export function PathsGuidanceWrapper({ children }: PathsGuidanceWrapperProps) {
  const {
    shouldShow,
    guidance,
    isFirstEncounter,
    isLoading,
    complete,
    skip,
    listenAgain,
  } = useGuidance({ triggerKey: "app.what_are_paths" });

  if (isLoading) {
    return <>{children}</>;
  }

  if (shouldShow && guidance && isFirstEncounter) {
    return (
      <>
        {/* Paths page hidden behind guidance */}
        <div className="opacity-0 pointer-events-none">{children}</div>
        <GuidanceScreen
          guidance={guidance}
          isFirstEncounter={isFirstEncounter}
          onComplete={complete}
          onSkip={skip}
          onListenAgain={listenAgain}
        />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
