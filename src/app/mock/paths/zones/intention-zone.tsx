'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IntentionZoneProps {
  intention: string;
  waypointName: string;
  className?: string;
}

export function IntentionZone({ intention, waypointName, className }: IntentionZoneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn('flex flex-col items-center justify-center gap-5 p-4', className)}
    >
      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-xs font-medium tracking-widest uppercase text-white/40 text-center"
      >
        Your intention for {waypointName}
      </motion.p>

      {/* Top divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.18, type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-[240px] h-px origin-center"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(201,169,78,0.4), transparent)',
        }}
      />

      {/* Breathing intention text */}
      <motion.div
        animate={{ scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="px-4 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
          className="font-serif italic text-lg text-[#c9a94e] leading-relaxed"
          style={{ textShadow: '0 0 24px rgba(201,169,78,0.3)' }}
        >
          &ldquo;{intention}&rdquo;
        </motion.p>
      </motion.div>

      {/* Bottom divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.32, type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-[240px] h-px origin-center"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(201,169,78,0.4), transparent)',
        }}
      />

      {/* Decorative stars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38 }}
        className="flex items-center gap-3"
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.35,
            }}
            className="w-1 h-1 rounded-full bg-[#c9a94e]"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
