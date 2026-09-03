import type { FC } from 'react';

import { cn } from '@/lib/utils';

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 92;

const quadrant = (index: number) => {
    const start = (index * Math.PI) / 2 - Math.PI / 2;
    const end = start + Math.PI / 2;
    const x1 = CENTER + RADIUS * Math.cos(start);
    const y1 = CENTER + RADIUS * Math.sin(start);
    const x2 = CENTER + RADIUS * Math.cos(end);
    const y2 = CENTER + RADIUS * Math.sin(end);

    return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;
};

const duckAt = (index: number) => {
    const mid = (index * Math.PI) / 2 - Math.PI / 4;

    return { x: CENTER + RADIUS * 0.55 * Math.cos(mid) - 22, y: CENTER + RADIUS * 0.55 * Math.sin(mid) - 22 };
};

/**
 * Static prize wheel: one gold winning segment carrying the live discount, three blanks.
 * Replaces the baked-in $5/$10/$15/$20 artwork so the amount can follow the API.
 */
const SpinWheelBadge: FC<{ amount: number; className?: string }> = ({ amount, className }) => {
    const winLabel = `$${amount}`;
    const winMid = -Math.PI / 4;

    return (
        <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className={cn('h-24 w-24 sm:h-28 sm:w-28 md:h-30 md:w-30 lg:h-32 lg:w-32', className)}
            role='img'
            aria-label={`Monthly spin wheel — win ${winLabel} off`}>
            <defs>
                <linearGradient id='swb-ring' x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0%' stopColor='#F5D78E' />
                    <stop offset='45%' stopColor='#D4AF37' />
                    <stop offset='100%' stopColor='#A07018' />
                </linearGradient>
                <linearGradient id='swb-win' x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0%' stopColor='#E8C463' />
                    <stop offset='100%' stopColor='#B98C1C' />
                </linearGradient>
            </defs>

            <circle cx={CENTER} cy={CENTER} r={RADIUS + 5} fill='none' stroke='url(#swb-ring)' strokeWidth='6' />

            {[0, 1, 2, 3].map((index) => (
                <path
                    key={index}
                    d={quadrant(index)}
                    fill={index === 0 ? 'url(#swb-win)' : '#0B0B0B'}
                    stroke='rgba(212,175,55,0.45)'
                    strokeWidth='1.5'
                />
            ))}

            {[1, 2, 3].map((index) => {
                const { x, y } = duckAt(index);

                return <image key={index} href='/icons/ic-duck.webp' x={x} y={y} width='44' height='44' />;
            })}

            <text
                x={CENTER + RADIUS * 0.55 * Math.cos(winMid)}
                y={CENTER + RADIUS * 0.55 * Math.sin(winMid)}
                fill='#FFF8E1'
                fontSize='34'
                fontWeight='800'
                textAnchor='middle'
                dominantBaseline='central'>
                {winLabel}
            </text>

            <circle cx={CENTER} cy={CENTER} r='24' fill='#050505' stroke='#D4AF37' strokeWidth='2' />
            <text
                x={CENTER}
                y={CENTER}
                fill='#D4AF37'
                fontSize='13'
                fontWeight='800'
                letterSpacing='1'
                textAnchor='middle'
                dominantBaseline='central'>
                SLR
            </text>
        </svg>
    );
};

export default SpinWheelBadge;
