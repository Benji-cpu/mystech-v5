"use client";

import dynamic from "next/dynamic";

const OracleChamber = dynamic(
  () => import("./oracle-chamber").then((m) => m.OracleChamber),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-dvh w-full flex items-center justify-center"
        style={{ background: "#050012" }}
      >
        <div className="text-white/40 text-sm animate-pulse">
          Preparing the Oracle Chamber...
        </div>
      </div>
    ),
  },
);

export default function MockV14Page() {
  return <OracleChamber />;
}
