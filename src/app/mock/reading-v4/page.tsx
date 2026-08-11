"use client";

import dynamic from "next/dynamic";

/** ssr: false — the surface reads its first-run hint in a lazy initialiser. */
const InHandSurface = dynamic(() => import("./surface"), {
  ssr: false,
  loading: () => <div className="fixed inset-0" style={{ background: "#15110E" }} />,
});

export default function ReadingV4Page() {
  return <InHandSurface />;
}
