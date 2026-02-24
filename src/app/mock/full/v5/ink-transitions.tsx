"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

// View transition wrapper — wraps content with ink dissolve enter/exit
interface InkViewTransitionProps {
  viewKey: string;
  children: ReactNode;
}

const viewVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(6px)",
    scale: 0.99,
  },
};

const viewTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 32,
  mass: 0.8,
};

export function InkViewTransition({ viewKey, children }: InkViewTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        variants={viewVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={viewTransition}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Stagger wrapper — staggers children entrance
interface InkStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function InkStagger({ children, className = "", staggerDelay = 0.06 }: InkStaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger child item
interface InkStaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function InkStaggerItem({ children, className = "" }: InkStaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 28,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Fade-in wrapper with optional direction
interface InkFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function InkFade({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: InkFadeProps) {
  const directionOffset = {
    up: { y: 16 },
    down: { y: -16 },
    left: { x: 16 },
    right: { x: -16 },
    none: {},
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// Scale-in for modals, cards emerging from ink
interface InkScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function InkScaleIn({ children, className = "", delay = 0 }: InkScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 28,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
