"use client";

import { useSpring, animated } from "@react-spring/web";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

export function ChainSequence() {
  return (
    <DemoWrapper
      title="Chain Sequence"
      description="3-step chained animation: appear → glow → settle into position"
      library="React Spring"
    >
      {(playing) => <ChainContent playing={playing} />}
    </DemoWrapper>
  );
}

function ChainContent({ playing }: { playing: boolean }) {
  // Step 1: Appear
  const appear = useSpring({
    from: { opacity: 0, scale: 0.3, y: 80 },
    to: playing
      ? { opacity: 1, scale: 1.15, y: -10 }
      : { opacity: 0, scale: 0.3, y: 80 },
    config: { tension: 200, friction: 15 },
  });

  // Step 2: Glow (triggered after appear)
  const glow = useSpring({
    from: { boxShadow: "0 0 0px rgba(201,169,78,0)" },
    to: playing
      ? { boxShadow: "0 0 40px rgba(201,169,78,0.6)" }
      : { boxShadow: "0 0 0px rgba(201,169,78,0)" },
    delay: playing ? 600 : 0,
    config: { tension: 120, friction: 14 },
  });

  // Step 3: Settle
  const settle = useSpring({
    from: { scale: 1.15, y: -10 },
    to: playing
      ? { scale: 1, y: 0 }
      : { scale: 1.15, y: -10 },
    delay: playing ? 1200 : 0,
    config: { tension: 300, friction: 25 },
  });

  return (
    <TransitionStage>
      <animated.div
        style={{
          opacity: appear.opacity,
          transform: appear.scale.to((s) => {
            const finalScale = playing ? settle.scale.get() : s;
            const finalY = playing && settle.y ? settle.y.get() : appear.y.get();
            return `scale(${finalScale}) translateY(${finalY}px)`;
          }),
          ...glow,
          borderRadius: "12px",
        }}
      >
        <DemoCard title="Chained" size="md" />
      </animated.div>
      {playing && (
        <div className="absolute bottom-2 flex gap-2">
          {["Appear", "Glow", "Settle"].map((step, i) => (
            <span
              key={step}
              className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-white/5"
            >
              {i + 1}. {step}
            </span>
          ))}
        </div>
      )}
    </TransitionStage>
  );
}
