"use client";

import { useSpring, animated } from "@react-spring/web";
import { DemoWrapper } from "../demo-wrapper";
import { DemoCard } from "../demo-card";
import { TransitionStage } from "../transition-stage";

const configs = [
  { label: "Wobbly", tension: 180, friction: 12 },
  { label: "Gentle", tension: 120, friction: 14 },
  { label: "Stiff", tension: 400, friction: 30 },
  { label: "Slow", tension: 100, friction: 40 },
];

function SpringCard({
  label,
  config,
  playing,
  delay,
}: {
  label: string;
  config: { tension: number; friction: number };
  playing: boolean;
  delay: number;
}) {
  const spring = useSpring({
    from: { opacity: 0, transform: "translateY(80px) scale(0.6)" },
    to: playing
      ? { opacity: 1, transform: "translateY(0px) scale(1)" }
      : { opacity: 0, transform: "translateY(80px) scale(0.6)" },
    config,
    delay: playing ? delay : 0,
  });

  return (
    <animated.div style={spring}>
      <DemoCard title={label} size="sm" />
    </animated.div>
  );
}

export function SpringWobble() {
  return (
    <DemoWrapper
      title="Spring Configs"
      description="Compare wobbly, gentle, stiff, and slow spring configurations"
      library="React Spring"
    >
      {(playing) => (
        <TransitionStage>
          <div className="flex gap-2 items-end flex-wrap justify-center">
            {configs.map((cfg, i) => (
              <SpringCard
                key={cfg.label}
                label={cfg.label}
                config={{ tension: cfg.tension, friction: cfg.friction }}
                playing={playing}
                delay={i * 150}
              />
            ))}
          </div>
        </TransitionStage>
      )}
    </DemoWrapper>
  );
}
