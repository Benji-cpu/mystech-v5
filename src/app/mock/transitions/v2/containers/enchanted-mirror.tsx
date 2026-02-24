"use client";

export function EnchantedMirror({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full w-full relative overflow-hidden flex flex-col"
      style={{ background: "#0a0b1e" }}
    >
      {/* Gold frame border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: "2px solid rgba(212,168,67,0.3)",
          zIndex: 5,
        }}
      />

      {/* Main content area (65%) */}
      <div
        className="relative overflow-hidden"
        style={{ height: "65%", zIndex: 1 }}
      >
        {children}
      </div>

      {/* Divider line */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)",
          zIndex: 2,
        }}
      />

      {/* Reflection area (35%) */}
      <div className="relative flex-1 overflow-hidden" style={{ zIndex: 1 }}>
        <div
          style={{
            transform: "scaleY(-1)",
            height: "100%",
            opacity: 0.25,
            filter: "blur(1px)",
          }}
        >
          {children}
        </div>

        {/* Fade-out gradient mask over reflection */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(10,11,30,0.6) 40%, rgba(10,11,30,0.95) 100%)",
          }}
        />
      </div>

      {/* Animated shimmer */}
      <style>{`
        @keyframes mirror-shimmer {
          0% { transform: translateX(-100%) rotate(15deg); }
          100% { transform: translateX(200%) rotate(15deg); }
        }
      `}</style>
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 3 }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-20%",
            width: "40%",
            height: "140%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
            animation: "mirror-shimmer 4s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
