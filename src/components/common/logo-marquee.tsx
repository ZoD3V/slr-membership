'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import { motion, useAnimationFrame, useMotionValue } from 'motion/react';

const SPEED = 30;

function repeatToFill(logos: { src: string; alt: string }[]): { src: string; alt: string }[] {
    if (logos.length === 0) return [];

    let items = [...logos];
    while (items.length < 35) {
        items = [...items, ...logos];
    }

    return items;
}

export interface LogoMarqueeProps {
    logos: { src: string; alt: string }[];

    cardClassName?: string;
    imageClassName?: string;
}

const LogoMarquee = ({
    logos,
    cardClassName = 'h-28 w-36 sm:h-32 sm:w-44 md:h-36 md:w-52 lg:h-40 lg:w-56',
    imageClassName = 'h-8 sm:h-9 lg:h-10'
}: LogoMarqueeProps) => {
    const xRow1 = useMotionValue(0);
    const xRow2 = useMotionValue(0);

    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    const draggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const [mounted, setMounted] = useState(false);

    const validLogos = React.useMemo(() => {
        return (logos || []).filter(
            (logo) => logo.src && logo.src.trim() !== '' && logo.src !== 'undefined' && logo.src !== 'null'
        );
    }, [logos]);

    const row1Logos = React.useMemo(() => {
        if (validLogos.length === 0) return [];
        if (validLogos.length === 1) return repeatToFill(validLogos);

        return repeatToFill(validLogos.slice(0, Math.ceil(validLogos.length / 2)));
    }, [validLogos]);

    const row2Logos = React.useMemo(() => {
        if (validLogos.length === 0) return [];
        if (validLogos.length === 1) return repeatToFill(validLogos);
        const secondHalf = validLogos.slice(Math.ceil(validLogos.length / 2));

        return repeatToFill(secondHalf.length > 0 ? secondHalf : validLogos);
    }, [validLogos]);

    useEffect(() => {
        const init = () => {
            if (row1Ref.current) {
                const half = row1Ref.current.scrollWidth / 2;
                if (half > 0) {
                    xRow1.set(-half);
                    setMounted(true);
                }
            } else {
                setMounted(true);
            }

            if (row2Ref.current) {
                const half2 = row2Ref.current.scrollWidth / 2;
                if (half2 > 0) xRow2.set(-half2);
            }
        };

        const t = window.requestAnimationFrame(init);

        return () => window.cancelAnimationFrame(t);
    }, [xRow1, xRow2, row1Logos, row2Logos]);

    useAnimationFrame((_time, delta) => {
        if (draggingRef.current) return;

        const dx = (SPEED * delta) / 1000;

        if (row1Ref.current) {
            const half = row1Ref.current.scrollWidth / 2;
            if (half > 0) {
                let next = xRow1.get() - dx;
                while (next <= -half) next += half;
                while (next > 0) next -= half;
                xRow1.set(next);
            }
        }

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

    const handlePan = (_: PointerEvent, info: { delta: { x: number } }) => {
        xRow1.set(xRow1.get() + info.delta.x);
        xRow2.set(xRow2.get() + info.delta.x);
    };

    if (row1Logos.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
                'flex flex-col overflow-hidden transition-opacity duration-300 select-none',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
                mounted ? 'opacity-100' : 'opacity-0'
            )}
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            style={{ touchAction: 'pan-y' }}>
            <motion.div ref={row1Ref} className='flex w-max will-change-transform' style={{ x: xRow1 }}>
                {[...row1Logos, ...row1Logos].map((logo, idx) => (
                    <LogoCard
                        key={`row1-${idx}`}
                        src={logo.src}
                        alt={logo.alt}
                        cardClassName={cardClassName}
                        imageClassName={imageClassName}
                    />
                ))}
            </motion.div>

            <motion.div ref={row2Ref} className='flex w-max will-change-transform' style={{ x: xRow2 }}>
                {[...row2Logos, ...row2Logos].map((logo, idx) => (
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
