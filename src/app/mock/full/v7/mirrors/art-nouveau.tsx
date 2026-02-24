"use client";

import { cn } from "@/lib/utils";
import { MT } from "../mirror-theme";
import type { MirrorFrameProps } from "../mirror-types";

export function ArtNouveauMirror({ children, className }: MirrorFrameProps) {
  return (
    <div
      className={cn("relative w-full h-full flex items-center justify-center", className)}
      style={{ background: MT.bg }}
    >
      <style>{`
        @keyframes nouveau-sway {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          33% { transform: scaleX(1.008) scaleY(0.996); }
          66% { transform: scaleX(0.994) scaleY(1.006); }
        }
        @keyframes nouveau-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes tendril-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -200; }
        }
        .nouveau-frame { animation: nouveau-sway 8s ease-in-out infinite; }
        .nouveau-glow { animation: nouveau-glow 4s ease-in-out infinite; }
        .tendril-animate {
          stroke-dasharray: 8 6;
          animation: tendril-flow 6s linear infinite;
        }
        .tendril-animate-slow {
          stroke-dasharray: 5 8;
          animation: tendril-flow 10s linear infinite reverse;
        }
      `}</style>

      {/* Organic SVG frame */}
      <svg
        className="nouveau-frame absolute inset-0 w-full h-full"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background fill for the organic frame shape */}
        <path
          d="M200 4
             C240 4 290 10 320 30
             C355 52 380 90 388 140
             C396 190 392 240 390 280
             C388 330 392 380 380 420
             C368 460 340 488 300 494
             C260 500 240 498 200 496
             C160 498 140 500 100 494
             C60 488 32 460 20 420
             C8 380 12 330 10 280
             C8 240 4 190 12 140
             C20 90 45 52 80 30
             C110 10 160 4 200 4Z"
          fill={MT.surface}
          stroke={MT.gold}
          strokeWidth="3"
        />

        {/* Inner organic border */}
        <path
          d="M200 22
             C234 22 278 28 305 46
             C338 67 360 102 367 148
             C374 194 370 240 368 278
             C366 326 370 374 359 412
             C348 450 322 476 285 482
             C248 488 228 486 200 484
             C172 486 152 488 115 482
             C78 476 52 450 41 412
             C30 374 34 326 32 278
             C30 240 26 194 33 148
             C40 102 62 67 95 46
             C122 28 166 22 200 22Z"
          stroke={`${MT.gold}66`}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Left vine tendrils */}
        <g className="nouveau-glow">
          <path
            d="M20 150 C-10 160 -5 200 20 210 C45 220 60 200 50 180 C40 160 10 170 15 200"
            stroke={MT.gold} strokeWidth="2" fill="none" strokeLinecap="round"
          />
          <path
            d="M10 280 C-15 270 -20 300 5 315 C25 325 45 310 38 290 C30 270 5 285 8 300"
            stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round"
          />
          {/* Leaf shapes left */}
          <path d="M20 155 C5 145 -8 158 5 168 C18 178 28 165 20 155Z" fill={`${MT.gold}88`} />
          <path d="M12 290 C-2 278 -12 292 2 302 C14 310 24 296 12 290Z" fill={`${MT.gold}66`} />
          <path d="M22 220 C8 212 0 228 12 234 C22 240 30 224 22 220Z" fill={`${MT.gold}55`} />
        </g>

        {/* Right vine tendrils */}
        <g className="nouveau-glow">
          <path
            d="M380 150 C410 160 405 200 380 210 C355 220 340 200 350 180 C360 160 390 170 385 200"
            stroke={MT.gold} strokeWidth="2" fill="none" strokeLinecap="round"
          />
          <path
            d="M390 280 C415 270 420 300 395 315 C375 325 355 310 362 290 C370 270 395 285 392 300"
            stroke={MT.gold} strokeWidth="1.5" fill="none" strokeLinecap="round"
          />
          {/* Leaf shapes right */}
          <path d="M380 155 C395 145 408 158 395 168 C382 178 372 165 380 155Z" fill={`${MT.gold}88`} />
          <path d="M388 290 C402 278 412 292 398 302 C386 310 376 296 388 290Z" fill={`${MT.gold}66`} />
          <path d="M378 220 C392 212 400 228 388 234 C378 240 370 224 378 220Z" fill={`${MT.gold}55`} />
        </g>

        {/* Top floral motif */}
        <g transform="translate(200, 12)" fill={MT.gold}>
          {/* Stylized lily */}
          <path d="M0 -4 C-8 -20 -20 -24 -18 -14 C-16 -6 -8 -4 0 0 C8 -4 16 -6 18 -14 C20 -24 8 -20 0 -4Z" opacity="0.9" />
          <path d="M0 -4 C-4 -12 -10 -8 -8 -2 C-6 4 -2 2 0 0 C2 2 6 4 8 -2 C10 -8 4 -12 0 -4Z" fill={MT.bg} opacity="0.8" />
          {/* Stamens */}
          <circle cx="0" cy="-18" r="2.5" />
          <circle cx="-14" cy="-14" r="2" />
          <circle cx="14" cy="-14" r="2" />
          {/* Stem curves */}
          <path d="M-20 4 C-15 -2 -5 0 0 6 C5 0 15 -2 20 4" stroke={MT.gold} strokeWidth="1.5" fill="none" />
        </g>

        {/* Bottom floral motif */}
        <g transform="translate(200, 490) scale(1,-1)" fill={MT.gold}>
          <path d="M0 -4 C-8 -20 -20 -24 -18 -14 C-16 -6 -8 -4 0 0 C8 -4 16 -6 18 -14 C20 -24 8 -20 0 -4Z" opacity="0.9" />
          <path d="M0 -4 C-4 -12 -10 -8 -8 -2 C-6 4 -2 2 0 0 C2 2 6 4 8 -2 C10 -8 4 -12 0 -4Z" fill={MT.bg} opacity="0.8" />
          <circle cx="0" cy="-18" r="2.5" />
          <circle cx="-14" cy="-14" r="2" />
          <circle cx="14" cy="-14" r="2" />
        </g>

        {/* Flowing tendril lines around frame */}
        <path
          className="tendril-animate"
          d="M80 30 C60 60 45 100 50 150 C55 200 70 240 65 280 C60 320 40 360 50 410"
          stroke={`${MT.gold}55`} strokeWidth="1.5" fill="none" strokeLinecap="round"
        />
        <path
          className="tendril-animate-slow"
          d="M320 30 C340 60 355 100 350 150 C345 200 330 240 335 280 C340 320 360 360 350 410"
          stroke={`${MT.gold}44`} strokeWidth="1.5" fill="none" strokeLinecap="round"
        />

        {/* Small detail circles at vine joints */}
        {[[30, 170], [18, 300], [370, 170], [382, 300]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={MT.gold} opacity="0.6" />
        ))}
      </svg>

      {/* Content area with organic clip */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: "78%",
          height: "85%",
          borderRadius: "44% 44% 40% 40% / 48% 48% 42% 42%",
          background: `radial-gradient(ellipse at 40% 30%, ${MT.surface2} 0%, ${MT.bg} 80%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
