'use client';

import { motion } from 'motion/react';

type SpotlightProps = {
    gradientFirst?: string;
    gradientSecond?: string;
    gradientThird?: string;
    translateY?: number;
    width?: number;
    smallWidth?: number;
    height?: number;
    smallHeight?: number;
    duration?: number;
    xOffset?: number;
};

export const SpotlightNew = ({
    // Spotlight #1 — dim white, full length
    gradientFirst = 'radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(0, 0%, 100%, 0.08) 0, hsla(0, 0%, 100%, 0.03) 50%, hsla(0, 0%, 100%, 0) 80%)',
    // Spotlight #2 — dim white, same length as #1
    gradientSecond = 'radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, 0.07) 0, hsla(0, 0%, 100%, 0.025) 80%, transparent 100%)',
    // Spotlight #3 — dimmer white, shorter
    gradientThird = 'radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, 0.03) 0, hsla(0, 0%, 100%, 0.01) 80%, transparent 100%)',
    translateY = -350,
    width = 560,
    smallWidth = 240,
    height = 1380,
    smallHeight = 900,
    duration = 7,
    xOffset = 100
}: SpotlightProps = {}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className='pointer-events-none absolute inset-0 h-full w-full'>
            {/* LEFT corner — 3 spotlights */}
            <motion.div
                animate={{ x: [0, xOffset, 0] }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                }}
                className='pointer-events-none absolute top-0 left-0 z-40 h-screen w-screen'>
                {/* #1 — long, dim white */}
                <div
                    style={{
                        transform: `translateY(${translateY}px) rotate(-45deg)`,
                        background: gradientFirst,
                        width: `${width}px`,
                        height: `${height}px`
                    }}
                    className='absolute top-0 left-0'
                />

                {/* #2 — same length as #1, dim white */}
                <div
                    style={{
                        transform: 'rotate(-45deg) translate(5%, -50%)',
                        background: gradientSecond,
                        width: `${smallWidth}px`,
                        height: `${height}px`
                    }}
                    className='absolute top-0 left-0 origin-top-left'
                />

                {/* #3 — shorter and dimmer */}
                <div
                    style={{
                        transform: 'rotate(-45deg) translate(-180%, -70%)',
                        background: gradientThird,
                        width: `${smallWidth}px`,
                        height: `${smallHeight}px`
                    }}
                    className='absolute top-0 left-0 origin-top-left'
                />
            </motion.div>

            {/* RIGHT corner — 3 spotlights (mirrored) */}
            <motion.div
                animate={{ x: [0, -xOffset, 0] }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                }}
                className='pointer-events-none absolute top-0 right-0 z-40 h-screen w-screen'>
                {/* #1 — long, dim white */}
                <div
                    style={{
                        transform: `translateY(${translateY}px) rotate(45deg)`,
                        background: gradientFirst,
                        width: `${width}px`,
                        height: `${height}px`
                    }}
                    className='absolute top-0 right-0'
                />

                {/* #2 — same length as #1, dim white */}
                <div
                    style={{
                        transform: 'rotate(45deg) translate(-5%, -50%)',
                        background: gradientSecond,
                        width: `${smallWidth}px`,
                        height: `${height}px`
                    }}
                    className='absolute top-0 right-0 origin-top-right'
                />

                {/* #3 — shorter and dimmer */}
                <div
                    style={{
                        transform: 'rotate(45deg) translate(180%, -70%)',
                        background: gradientThird,
                        width: `${smallWidth}px`,
                        height: `${smallHeight}px`
                    }}
                    className='absolute top-0 right-0 origin-top-right'
                />
            </motion.div>
        </motion.div>
    );
};
