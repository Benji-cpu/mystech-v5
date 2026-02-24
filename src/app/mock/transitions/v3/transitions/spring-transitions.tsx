'use client';

import { useEffect, useRef } from 'react';
import { useTrail, animated } from '@react-spring/web';
import type { TransitionProps } from '../mirror-types';

const STRIP_COUNT = 8;
const SPRING_CONFIG = { tension: 280, friction: 25 };

export function CascadeTrail({
  oldContent,
  newContent,
  isActive,
  onComplete,
}: TransitionProps) {
  const completedStripsRef = useRef(0);

  // Reset completed count whenever the transition starts
  useEffect(() => {
    if (isActive) {
      completedStripsRef.current = 0;
    }
  }, [isActive]);

  const trail = useTrail(STRIP_COUNT, {
    from: { oldOpacity: 1, oldX: 0, newOpacity: 0, newX: 20 },
    to: isActive
      ? { oldOpacity: 0, oldX: -20, newOpacity: 1, newX: 0 }
      : { oldOpacity: 1, oldX: 0, newOpacity: 0, newX: 20 },
    config: SPRING_CONFIG,
    reset: isActive,
    onRest: () => {
      if (!isActive) return;
      completedStripsRef.current += 1;
      if (completedStripsRef.current >= STRIP_COUNT) {
        onComplete();
      }
    },
  });

  if (!isActive) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {trail.map((springs, i) => {
        const topPct = i * (100 / STRIP_COUNT);
        const bottomPct = (STRIP_COUNT - 1 - i) * (100 / STRIP_COUNT);
        const clip = `inset(${topPct}% 0 ${bottomPct}% 0)`;

        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{ clipPath: clip }}
          >
            {/* Old content layer — slides and fades out */}
            <animated.div
              className="absolute inset-0"
              style={{
                opacity: springs.oldOpacity,
                transform: springs.oldX.to((x) => `translateX(${x}px)`),
              }}
            >
              {oldContent}
            </animated.div>

            {/* New content layer — slides and fades in */}
            <animated.div
              className="absolute inset-0"
              style={{
                opacity: springs.newOpacity,
                transform: springs.newX.to((x) => `translateX(${x}px)`),
              }}
            >
              {newContent}
            </animated.div>
          </div>
        );
      })}
    </div>
  );
}
