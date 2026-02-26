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
      "I cried when I saw the card about my grandmother's garden. It captured something I couldn't put into words.",
    name: 'Sarah M.',
    detail: 'Created her first deck in 10 minutes',
  },
  {
    quote:
      "The reading about my career change hit so hard. These aren't random cards — they're MY cards.",
    name: 'James K.',
    detail: 'Has done 30+ readings with his deck',
  },
  {
    quote:
      "I sent my reading to my best friend and she said 'this is exactly what you needed to hear.'",
    name: 'Priya R.',
    detail: 'Shared 12 readings with friends',
  },
];

const STAGGER_DELAYS = [0, 0.15, 0.3] as const;

interface SocialProofProps {
  className?: string;
}

export function SocialProof({ className }: SocialProofProps) {
  return (
    <section
      className={cn('py-16 sm:py-20 border-t border-border/40', className)}
    >
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <ScrollReveal className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">
            What people are saying
          </h2>
        </ScrollReveal>

        {/* Testimonial grid */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <ScrollReveal
              key={testimonial.name}
              delay={STAGGER_DELAYS[index]}
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
    <motion.div
      className={cn(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6',
        'flex flex-col',
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Star rating */}
      <div className="flex gap-0.5 mb-3" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-[#c9a94e] text-sm" aria-hidden="true">
            ★
          </span>
        ))}
      </div>

      {/* Quote */}
      <p className="text-base text-foreground/80 italic leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Attribution */}
      <p className="text-sm text-[#c9a94e]/70 mt-4">
        <span className="font-semibold not-italic">{testimonial.name}</span>
        {' · '}
        {testimonial.detail}
      </p>
    </motion.div>
  );
}
