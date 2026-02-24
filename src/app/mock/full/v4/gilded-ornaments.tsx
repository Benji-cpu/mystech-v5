"use client";

import React from "react";

// ---------------------------------------------------------------------------
// CornerFlourish
// A small SVG curling scroll ornament positioned absolutely in a corner.
// ---------------------------------------------------------------------------

type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface CornerFlourishProps {
  position: CornerPosition;
  size?: number;
}

const positionClasses: Record<CornerPosition, string> = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
};

const positionTransforms: Record<CornerPosition, string> = {
  "top-left": "",
  "top-right": "scaleX(-1)",
  "bottom-left": "scaleY(-1)",
  "bottom-right": "scale(-1, -1)",
};

export function CornerFlourish({ position, size = 24 }: CornerFlourishProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`absolute pointer-events-none ${positionClasses[position]}`}
      style={{ transform: positionTransforms[position] || undefined }}
      aria-hidden="true"
    >
      {/* Main curling scroll from corner outward */}
      <path
        d="M4 4 C4 4, 4 20, 12 28 C16 32, 24 34, 32 32 C28 36, 20 38, 14 34 C8 30, 6 22, 6 14"
        stroke="#c9a94e"
        strokeOpacity={0.4}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner spiral curl */}
      <path
        d="M4 4 C4 4, 6 12, 10 18 C12 22, 16 24, 22 24 C18 26, 12 26, 9 22 C6 18, 5 12, 5 8"
        stroke="#c9a94e"
        strokeOpacity={0.4}
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
      />
      {/* Small leaf accent off the main scroll */}
      <path
        d="M18 26 C20 24, 24 22, 26 24 C24 26, 20 28, 18 26 Z"
        fill="#c9a94e"
        fillOpacity={0.2}
      />
      {/* Tiny tendril */}
      <path
        d="M10 16 C12 14, 16 12, 18 14"
        stroke="#c9a94e"
        strokeOpacity={0.3}
        strokeWidth={0.8}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// OrnamentDivider
// A horizontal divider with a center diamond motif.
// ---------------------------------------------------------------------------

interface OrnamentDividerProps {
  className?: string;
}

export function OrnamentDivider({ className = "" }: OrnamentDividerProps) {
  return (
    <div
      className={`w-full flex items-center justify-center py-2 ${className}`}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="12"
        viewBox="0 0 400 12"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        className="max-w-full"
      >
        {/* Left line */}
        <line
          x1="20"
          y1="6"
          x2="185"
          y2="6"
          stroke="#3d3020"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
        {/* Right line */}
        <line
          x1="215"
          y1="6"
          x2="380"
          y2="6"
          stroke="#3d3020"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
        {/* Center diamond */}
        <path
          d="M200 1 L205 6 L200 11 L195 6 Z"
          fill="#c9a94e"
          fillOpacity={0.5}
        />
        {/* Small decorative dots flanking the diamond */}
        <circle cx="188" cy="6" r="1" fill="#c9a94e" fillOpacity={0.3} />
        <circle cx="212" cy="6" r="1" fill="#c9a94e" fillOpacity={0.3} />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionFrame
// Wraps children with 4 CornerFlourish ornaments and a thin gold border.
// ---------------------------------------------------------------------------

interface SectionFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionFrame({ children, className = "" }: SectionFrameProps) {
  return (
    <div
      className={`relative border border-[#3d3020]/30 rounded-xl p-4 ${className}`}
    >
      <CornerFlourish position="top-left" />
      <CornerFlourish position="top-right" />
      <CornerFlourish position="bottom-left" />
      <CornerFlourish position="bottom-right" />
      {children}
    </div>
  );
}
