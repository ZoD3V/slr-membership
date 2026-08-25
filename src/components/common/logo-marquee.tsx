'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import { motion, useAnimationFrame, useMotionValue } from 'motion/react';

// Auto-scroll speed (pixels per second)
const SPEED = 30;

export interface LogoMarqueeProps {
    logos: { src: string; alt: string }[];
    /** Card size classes — defaults match the Community Givebacks marquee. */
    cardClassName?: string;
    imageClassName?: string;
}

/** Two-row auto-scrolling, drag-to-pan logo marquee. Shared by the Community
 *  Givebacks section and the About page's Trusted-by section. */
const LogoMarquee = ({
    logos,
    cardClassName = 'h-28 w-36 sm:h-32 sm:w-44 md:h-36 md:w-52 lg:h-40 lg:w-56',
    imageClassName = 'h-8 sm:h-9 lg:h-10'
}: LogoMarqueeProps) => {
    const xRow1 = useMotionValue(0);
    const xRow2 = useMotionValue(0);

    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    // Use a ref for drag state so the animation frame always sees the latest value
    const draggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Filter out blank/broken URLs to avoid empty icon slots
    const validLogos = React.useMemo(() => {
        return (logos || []).filter(
            (logo) => logo.src && logo.src.trim() !== '' && logo.src !== 'undefined' && logo.src !== 'null'
        );
    }, [logos]);

    // Multiply the logos list to guarantee total width exceeds viewport size (> 35 items)
    const multipliedLogos = React.useMemo(() => {
        if (validLogos.length === 0) return [];
        let items = [...validLogos];
        while (items.length < 35) {
            items = [...items, ...validLogos];
        }

        return items;
    }, [validLogos]);

    // Initialize row 1 and row 2 with offset staggers
    useEffect(() => {
        const init = () => {
            if (row1Ref.current) {
                const half = row1Ref.current.scrollWidth / 2;
                if (half > 0) {
                    xRow1.set(-half);
                    // Stagger row 2 slightly to the left relative to row 1 to prevent vertical alignment overlap and gaps
                    xRow2.set(-half / 3);
                    setMounted(true);
                }
            } else {
                setMounted(true);
            }
        };
        // Wait one frame for layout
        const t = window.requestAnimationFrame(init);

        return () => window.cancelAnimationFrame(t);
    }, [xRow1, xRow2, multipliedLogos]);

    useAnimationFrame((_time, delta) => {
        if (draggingRef.current) return;

        const dx = (SPEED * delta) / 1000;

        // Row 1 — moves right visually: translateX increases toward 0, wraps back to -half
        if (row1Ref.current) {
            const half = row1Ref.current.scrollWidth / 2;
            if (half > 0) {
                let next = xRow1.get() + dx;
                while (next >= 0) next -= half;
                while (next < -half) next += half;
                xRow1.set(next);
            }
        }

        // Row 2 — moves left visually: translateX decreases toward -half, wraps back to 0
        if (row2Ref.current) {
            const half = row2Ref.current.scrollWidth / 2;
            if (half > 0) {
                let next = xRow2.get() - dx;
                while (next <= -half) next += half;
                while (next > 0) next -= half;
                xRow2.set(next);
            }
        }
    });

    const handlePanStart = () => {
        draggingRef.current = true;
        setIsDragging(true);
    };

    const handlePanEnd = () => {
        draggingRef.current = false;
        setIsDragging(false);
    };

    // While dragging, both rows follow the user's horizontal drag direction
    const handlePan = (_: PointerEvent, info: { delta: { x: number } }) => {
        xRow1.set(xRow1.get() + info.delta.x);
        xRow2.set(xRow2.get() + info.delta.x);
    };

    if (multipliedLogos.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
                // The rows below are `w-max` — far wider than any viewport — so the
                // clipping belongs here rather than on each caller. Without it the
                // overflow reaches the document and the whole page scrolls sideways.
                'overflow-hidden transition-opacity duration-300 select-none',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
                mounted ? 'opacity-100' : 'opacity-0'
            )}
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            style={{ touchAction: 'pan-y' }}>
            {/* Row 1 — moves right when idle */}
            <motion.div ref={row1Ref} className='flex w-max will-change-transform' style={{ x: xRow1 }}>
                {[...multipliedLogos, ...multipliedLogos].map((logo, idx) => (
                    <LogoCard
                        key={`row1-${idx}`}
                        src={logo.src}
                        alt={logo.alt}
                        cardClassName={cardClassName}
                        imageClassName={imageClassName}
                    />
                ))}
            </motion.div>

            {/* Row 2 — moves left when idle */}
            <motion.div ref={row2Ref} className='flex w-max will-change-transform' style={{ x: xRow2 }}>
                {[...multipliedLogos, ...multipliedLogos].map((logo, idx) => (
                    <LogoCard
                        key={`row2-${idx}`}
                        src={logo.src}
                        alt={logo.alt}
                        cardClassName={cardClassName}
                        imageClassName={imageClassName}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
};

type LogoCardProps = {
    src: string;
    alt: string;
    cardClassName: string;
    imageClassName: string;
};

const LogoCard: React.FC<LogoCardProps> = ({ src, alt, cardClassName, imageClassName }) => (
    <div
        className={`border-slr-navy-border bg-slr-navy-foreground/95 flex shrink-0 items-center justify-center border ${cardClassName}`}>
        <Image
            src={src}
            alt={alt}
            width={140}
            height={60}
            draggable={false}
            unoptimized
            className={`pointer-events-none w-auto object-contain ${imageClassName}`}
        />
    </div>
);

export default LogoMarquee;
