"use client";

import { cn } from "@/lib/utils";

interface TransitionStageProps {
  children: React.ReactNode;
  className?: string;
}

export function TransitionStage({ children, className }: TransitionStageProps) {
  return (
    <div
      className={cn(
        "relative w-full min-h-[260px] rounded-lg overflow-hidden",
        "bg-gradient-to-b from-[#0d0020] to-[#0a0118]",
        "flex items-center justify-center",
        "border border-white/5",
        className
      )}
    >
      {/* Subtle star dots */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(1px 1px at 20px 30px, rgba(201,169,78,0.4), transparent), radial-gradient(1px 1px at 80px 60px, rgba(201,169,78,0.3), transparent), radial-gradient(1px 1px at 140px 20px, rgba(201,169,78,0.2), transparent), radial-gradient(1px 1px at 200px 80px, rgba(201,169,78,0.3), transparent)",
          backgroundSize: "220px 100px",
        }}
      />
      {children}
    </div>
  );
}
