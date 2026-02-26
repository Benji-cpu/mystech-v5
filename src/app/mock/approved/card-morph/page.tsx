"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { MorphExplorer } from "./morph-explorer";
import { OracleJourney } from "./flows/oracle-journey";
import { CardForging } from "./flows/card-forging";

type Tab = "oracle" | "forge" | "lab";

const TABS: { id: Tab; label: string }[] = [
  { id: "oracle", label: "Oracle Journey" },
  { id: "forge", label: "Card Forge" },
  { id: "lab", label: "Technique Lab" },
];

export default function CardMorphPage() {
  const [activeTab, setActiveTab] = useState<Tab>("oracle");

  return (
    <MockImmersiveShell>
      {/* Tab Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-3 pb-2">
        <div className="flex gap-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                color:
                  activeTab === tab.id
                    ? "rgba(201, 169, 78, 0.9)"
                    : "rgba(255, 255, 255, 0.5)",
              }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-full bg-[#c9a94e]/15 border border-[#c9a94e]/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content — offset for tab bar */}
      <div className="pt-12">
        {activeTab === "oracle" && <OracleJourney />}
        {activeTab === "forge" && <CardForging />}
        {activeTab === "lab" && <MorphExplorer />}
      </div>
    </MockImmersiveShell>
  );
}
