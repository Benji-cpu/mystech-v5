'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './scroll-reveal';

interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I cried when I saw the card about my grandmother's garden. It captured something I couldn't put into words — a feeling I'd been carrying for years, finally given shape.",
    name: 'Sarah M.',
    detail: 'Created her first deck in 10 minutes',
  },
  {
    quote:
      "The reading about my career change hit so hard. These aren't random cards — they're MY cards. Every image, every symbol, drawn from my own story.",
    name: 'James K.',
    detail: 'Has done 30+ readings with his deck',
  },
  {
    quote:
      "I sent my reading to my best friend and she said 'this is exactly what you needed to hear.' That's when I knew this was something different.",
    name: 'Priya R.',
    detail: 'Shared 12 readings with friends',
  },
];

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

interface SocialProofProps {
  className?: string;
}

export function SocialProof({ className }: SocialProofProps) {
  return (
    <section
      className={cn('py-16 sm:py-20 border-t border-border/40', className)}
    >
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display">
            What people are saying
          </h2>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <ScrollReveal
              key={testimonial.name}
              delay={index * 0.15}
              direction="up"
            >
              <TestimonialCard testimonial={testimonial} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.blockquote
      className={cn(
        'bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6',
        'flex flex-col h-full',
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={spring}
    >
      {/* Quote */}
      <p className="text-base text-foreground/80 italic leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Attribution */}
      <footer className="text-sm text-white/50 mt-4 not-italic">
        <span className="font-semibold text-white/70">{testimonial.name}</span>
        <span className="block text-xs text-white/30 mt-0.5">
          {testimonial.detail}
        </span>
      </footer>
    </motion.blockquote>
  );
}
