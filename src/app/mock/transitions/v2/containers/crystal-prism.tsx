"use client";

export function CrystalPrism({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{ background: "#0a0b1e" }}
    >
      {/* Prismatic edge strips - top */}
      <div
        className="absolute top-0 inset-x-0 h-[6px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, #ff000060, #ff880060, #ffff0060, #00ff0060, #0088ff60, #8800ff60, #ff00ff60)",
          filter: "blur(2px)",
          zIndex: 3,
        }}
      />

      {/* Bottom edge */}
      <div
        className="absolute bottom-0 inset-x-0 h-[6px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, #ff00ff60, #8800ff60, #0088ff60, #00ff0060, #ffff0060, #ff880060, #ff000060)",
          filter: "blur(2px)",
          zIndex: 3,
        }}
      />

      {/* Left edge */}
      <div
        className="absolute left-0 inset-y-0 w-[6px] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #ff000060, #ff880060, #ffff0060, #00ff0060, #0088ff60, #8800ff60, #ff00ff60)",
          filter: "blur(2px)",
          zIndex: 3,
        }}
      />

      {/* Right edge */}
      <div
        className="absolute right-0 inset-y-0 w-[6px] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #ff00ff60, #8800ff60, #0088ff60, #00ff0060, #ffff0060, #ff880060, #ff000060)",
          filter: "blur(2px)",
          zIndex: 3,
        }}
      />

      {/* Inner glass effect */}
      <div
        className="absolute inset-[6px] pointer-events-none"
        style={{
          backdropFilter: "blur(0.5px) saturate(1.5)",
          border: "1px solid rgba(255,255,255,0.08)",
          zIndex: 2,
        }}
      />

      {/* Facet reflections - animated */}
      <style>{`
        @keyframes prism-shift {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      `}</style>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.03) 45%, transparent 55%, rgba(200,180,255,0.02) 70%, transparent 80%)",
          backgroundSize: "200% 200%",
          animation: "prism-shift 8s ease-in-out infinite",
          zIndex: 4,
        }}
      />

      {/* Content */}
      <div className="absolute inset-[10px] overflow-hidden" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
