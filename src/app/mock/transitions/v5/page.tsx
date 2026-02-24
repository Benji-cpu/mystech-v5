"use client";

import dynamic from "next/dynamic";

const MirrorExplorer = dynamic(() => import("./mirror-explorer").then(m => m.MirrorExplorer), {
  ssr: false,
  loading: () => (
    <div className="h-dvh w-full flex items-center justify-center" style={{ background: "#050012" }}>
      <div className="text-white/40 text-sm animate-pulse">Loading Scrying Mirror...</div>
    </div>
  ),
});

export default function MockV11Page() {
  return <MirrorExplorer />;
}
