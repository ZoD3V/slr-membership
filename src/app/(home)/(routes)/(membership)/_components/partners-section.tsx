'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import SectionHeading from '@/components/common/section-heading';

import { motion, useAnimationFrame, useMotionValue } from 'motion/react';

const STATIC_PARTNERS = Array.from({ length: 10 }, (_, idx) => ({
    src: `/images/list-partner-logo-${idx + 1}.webp`,
    alt: `Partner Logo ${idx + 1}`
}));

// Auto-scroll speed (pixels per second)
const SPEED = 30;

// `logos` = public discount logo_urls (fetched server-side). Section-level fallback:
// any real logos → show them; none (empty / fetch failed) → the static partner set.
const PartnersSection = ({ logos }: { logos?: string[] }) => {
    const partners =
        logos && logos.length > 0 ? logos.map((src, idx) => ({ src, alt: `Partner Logo ${idx + 1}` })) : STATIC_PARTNERS;

    const xRow1 = useMotionValue(0);
    const xRow2 = useMotionValue(0);

    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    // Use a ref for drag state so the animation frame always sees the latest value
    const draggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize row 1 to start at -halfWidth so it can move right (x increasing toward 0)
    useEffect(() => {
        const init = () => {
            if (row1Ref.current) {
                const half = row1Ref.current.scrollWidth / 2;
                if (half > 0) xRow1.set(-half);
            }
        };
        // Wait one frame for layout
        const t = window.requestAnimationFrame(init);

        return () => window.cancelAnimationFrame(t);
    }, [xRow1]);

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

    return (
        <section id='partners' className='bg-slr-ink relative overflow-hidden pt-16 md:pt-24'>
            <div className='px-4 pb-12 text-center'>
                <div className='flex justify-center'>
                    <Image
                        src='/images/knotted-rope.png'
                        alt=''
                        width={960}
                        height={90}
                        className='h-auto w-56 sm:w-72'
                    />
                </div>

                <SectionHeading className='mt-6 text-[42px] leading-none sm:text-[56px] md:text-[72px] xl:text-[90px] xl:leading-22.5'>
                    <span className='text-gradient-silver'>Community Givebacks</span>
                </SectionHeading>

                <p className='text-slr-muted mt-4 text-sm md:text-base'>
                    Draw prizes and discounts to support community
                </p>

                <div className='mt-6 flex justify-center'>
                    <Image
                        src='/images/knotted-rope.png'
                        alt=''
                        width={960}
                        height={90}
                        className='h-auto w-56 sm:w-72'
                    />
                </div>
            </div>

            <motion.div
                className={`mt-10 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onPanStart={handlePanStart}
                onPan={handlePan}
                onPanEnd={handlePanEnd}
                style={{ touchAction: 'pan-y' }}>
                {/* Row 1 — moves right when idle */}
                <motion.div ref={row1Ref} className='flex w-max will-change-transform' style={{ x: xRow1 }}>
                    {[...partners, ...partners].map((partner, idx) => (
                        <PartnerCard key={`row1-${idx}`} src={partner.src} alt={partner.alt} />
                    ))}
                </motion.div>

                {/* Row 2 — moves left when idle */}
                <motion.div ref={row2Ref} className='flex w-max will-change-transform' style={{ x: xRow2 }}>
                    {[...partners, ...partners].map((partner, idx) => (
                        <PartnerCard key={`row2-${idx}`} src={partner.src} alt={partner.alt} />
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
};

type PartnerCardProps = {
    src: string;
    alt: string;
};

const PartnerCard: React.FC<PartnerCardProps> = ({ src, alt }) => (
    <div className='border-slr-navy-border bg-slr-navy-foreground/95 flex h-28 w-36 shrink-0 items-center justify-center border sm:h-32 sm:w-44 md:h-36 md:w-52 lg:h-40 lg:w-56'>
        <Image
            src={src}
            alt={alt}
            width={140}
            height={60}
            draggable={false}
            unoptimized
            className='pointer-events-none h-8 w-auto object-contain sm:h-9 lg:h-10'
        />
    </div>
);

export default PartnersSection;
