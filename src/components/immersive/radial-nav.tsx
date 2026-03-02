"use client";

import { motion } from "framer-motion";
import { Layers, BookOpen, Map, User } from "lucide-react";
import Link from "next/link";
import { useImmersive } from "./immersive-provider";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  section: string;
  angle: number;
}

const allItems = {
  dashboard: { href: "/dashboard", label: "Dashboard", icon: User, section: "dashboard" },
  decks: { href: "/decks", label: "Decks", icon: Layers, section: "decks" },
  readings: { href: "/readings", label: "Readings", icon: BookOpen, section: "readings" },
  paths: { href: "/paths", label: "Paths", icon: Map, section: "paths" },
};

/**
 * Returns exactly 3 nav items with fixed slot assignments:
 *   Left (-135°): Profile preferred
 *   Center (-90°): Decks/Readings (rotates based on current section)
 *   Right (-45°): Paths preferred
 *
 * The current section is excluded, and remaining items fill the 3 slots.
 */
function getRadialItems(currentSection: string | null): NavItem[] {
  const pool = [allItems.dashboard, allItems.decks, allItems.readings, allItems.paths]
    .filter(item => item.section !== currentSection);

  // If we filtered nothing (user is on settings/etc.), drop readings to keep 3
  if (pool.length > 3) {
    pool.splice(pool.findIndex(i => i.section === "readings"), 1);
  }

  // Assign slots by preference
  const left = pool.find(i => i.section === "dashboard") ?? pool[0];
  const right = pool.find(i => i.section === "paths" && i !== left) ?? pool[pool.length - 1];
  const center = pool.find(i => i !== left && i !== right)!;

  return [
    { ...left, angle: -135 },
    { ...center, angle: -90 },
    { ...right, angle: -45 },
  ];
}

const RADIUS_DESKTOP = 90;
const RADIUS_MOBILE = 75;

function getPosition(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
}

export function RadialNav() {
  const { state, closeOrb } = useImmersive();
  const { isOrbExpanded, currentSection } = state;

  const items = getRadialItems(currentSection);

  if (!isOrbExpanded) return null;

  return (
    <>
      {/* Backdrop to close on outside click */}
      <motion.div
        className="fixed inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeOrb}
      />

      {/* Nav items */}
      {items.map((item, i) => {
        const desktopPos = getPosition(item.angle, RADIUS_DESKTOP);
        const mobilePos = getPosition(item.angle, RADIUS_MOBILE);

        return (
          <motion.div
            key={item.section}
            className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: desktopPos.x,
              y: desktopPos.y,
            }}
            exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 22,
              delay: i * 0.06,
            }}
          >
            <Link
              href={item.href}
              onClick={closeOrb}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-purple-900/30 transition-colors hover:bg-white/20"
            >
              <item.icon className="h-5 w-5 text-gold" />

              {/* Label tooltip */}
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </>
  );
}
