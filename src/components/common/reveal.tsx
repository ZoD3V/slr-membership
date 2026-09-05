'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { type Transition, motion, useReducedMotion } from 'motion/react';

/** Shared easing for every entrance on the marketing pages — settles, never bounces. */
const EASE = [0.16, 1, 0.3, 1] as const;

const transition = (duration: number, delay: number): Transition => ({ duration, delay, ease: EASE });

interface MotionBlockProps {
    children: ReactNode;
    /** Seconds before the entrance starts. */
    delay?: number;
    className?: string;
}

/**
 * Wipes a line of type up from behind its own edge. The wrapper clips, so the child has to
 * travel further than its own height (`bleed`) when a drop-shadow would otherwise be cut off.
 */
export function MaskSlideUp({ children, delay = 0, className, bleed = 4 }: MotionBlockProps & { bleed?: number }) {
    const reduced = useReducedMotion();

    return (
        <div
            className='overflow-hidden'
            style={bleed > 4 ? { paddingBottom: bleed, marginBottom: -bleed } : { paddingBottom: bleed }}>
            <motion.div
                className={className}
                initial={reduced ? false : { y: `calc(100% + ${bleed}px)` }}
                animate={{ y: 0 }}
                transition={transition(1, delay)}>
                {children}
            </motion.div>
        </div>
    );
}

/** Mount-time fade + lift. Use for the tail of an intro sequence, after the type has landed. */
export function FadeUp({ children, delay = 0, className }: MotionBlockProps) {
    const reduced = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={reduced ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition(1.2, delay)}>
            {children}
        </motion.div>
    );
}

/**
 * Scroll-triggered fade + lift, fired once. `amount` is how much of the block must be on
 * screen before it counts as seen — cards that are taller than the viewport need a low value.
 */
export function Reveal({
    children,
    delay = 0,
    className,
    amount = 0.2,
    y = 30
}: MotionBlockProps & { amount?: number; y?: number }) {
    const reduced = useReducedMotion();

    return (
        <motion.div
            className={cn(className)}
            initial={reduced ? false : { opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount, margin: '0px 0px -10% 0px' }}
            transition={transition(0.8, delay)}>
            {children}
        </motion.div>
    );
}
