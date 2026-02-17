"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, BookOpen, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_HOME } from "@/components/guide/lyra-constants";

const nodes = [
  { href: "/decks", label: "Decks", description: LYRA_HOME.nodes.decks, icon: Layers, delay: 0, x: "-8vw", y: "-6vh" },
  { href: "/readings", label: "Readings", description: LYRA_HOME.nodes.readings, icon: BookOpen, delay: 0.08, x: "10vw", y: "-8vh" },
  { href: "/explore", label: "Explore", description: LYRA_HOME.nodes.explore, icon: Compass, delay: 0.16, x: "-12vw", y: "8vh" },
  { href: "/profile", label: "You", description: LYRA_HOME.nodes.you, icon: User, delay: 0.24, x: "6vw", y: "10vh" },
];

export function HomeRadioView() {
  return (
    <div className="relative min-h-full">
      <div className="px-4 pt-8 text-center sm:pt-12">
        <motion.div
          className="flex justify-center mb-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <LyraSigil size="lg" state="attentive" />
        </motion.div>
        <motion.p
          className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
        >
          {LYRA_HOME.tagline}
        </motion.p>
        <motion.h1
          className="mt-2 text-2xl font-bold text-foreground sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        >
          {LYRA_HOME.prompt}
        </motion.h1>
      </div>
      <RadioNavNodes />
    </div>
  );
}

function RadioNavNodes() {
  return (
    <motion.div
      className="relative flex min-h-[60vh] flex-wrap items-center justify-center gap-4 px-4 py-12"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
    >
      {nodes.map((node, i) => {
        const Icon = node.icon;
        return (
          <motion.div
            key={node.href}
            className="absolute flex items-center justify-center"
            style={{ left: "50%", top: "50%", marginLeft: node.x, marginTop: node.y }}
            initial={{ opacity: 0, scale: 0.6, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24, delay: node.delay } }}
          >
            <Link
              href={node.href}
              className={cn(
                "group flex flex-col items-center gap-3 rounded-2xl p-6 transition-colors",
                "bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-purple-900/20",
                "hover:border-[#c9a94e]/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(201,169,78,0.15)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a94e] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              <motion.div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#c9a94e]/10 text-[#c9a94e]" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
                <Icon className="h-7 w-7" />
              </motion.div>
              <span className="block font-semibold">{node.label}</span>
              <span className="block text-xs text-muted-foreground">{node.description}</span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
