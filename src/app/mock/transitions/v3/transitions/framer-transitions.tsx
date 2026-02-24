'use client';

import { motion } from 'framer-motion';
import type { TransitionProps } from '../mirror-types';

const SPRING = { stiffness: 300, damping: 30 };

export function SpringCrossfade({
  oldContent,
  newContent,
  isActive,
  onComplete,
}: TransitionProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Old content layer — fades and scales out */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        animate={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
        transition={SPRING}
      >
        {oldContent}
      </motion.div>

      {/* New content layer — fades and scales in */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={SPRING}
        onAnimationComplete={onComplete}
      >
        {newContent}
      </motion.div>
    </div>
  );
}
