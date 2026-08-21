'use client';

import { useState } from 'react';

import { motion, useAnimationControls } from 'motion/react';

type Segment = { label: string; isWin: boolean; fill: string; textColor: string };

const SEGMENT_COUNT = 4;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;
const RADIUS = 140;
const CENTER = 150;
const FULL_SPINS = 5;
const SPIN_MS = 3400;

// One winning wedge out of four (1/4 odds visual) with duck icons for no-prize
const buildSegments = (winLabel: string): Segment[] => [
    { label: '', isWin: false, fill: '#1E2530', textColor: '#8EA0B8' },
    { label: winLabel, isWin: true, fill: '#D4AF37', textColor: '#0C1132' },
    { label: '', isWin: false, fill: '#2A0810', textColor: '#E88888' },
    { label: '', isWin: false, fill: '#142034', textColor: '#6AB0F0' }
];

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;

    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const arcPath = (startAngle: number, endAngle: number): string => {
    const start = polarToCartesian(CENTER, CENTER, RADIUS, endAngle);
    const end = polarToCartesian(CENTER, CENTER, RADIUS, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
};

/** Land on a wedge that matches the outcome the server already decided. */
const pickSegmentIndex = (segments: Segment[], won: boolean): number => {
    const candidates = segments.map((s, i) => ({ s, i })).filter(({ s }) => s.isWin === won);

    return candidates[Math.floor(Math.random() * candidates.length)].i;
};

export type SpinOutcome = { won: boolean; discount: number };

type SpinWheelProps = {
    /** Dollar value shown on the winning wedges. */
    winDiscount: number;
    /**
     * Runs the real spin. Must resolve to the server's decision — the animation
     * is started only after it returns, so the wheel can never contradict it.
     */
    onSpin: () => Promise<SpinOutcome | null>;
    /** Fired once the wheel has come to a stop. */
    onSettled: (outcome: SpinOutcome) => void;
    spinLabel?: string;
    disabled?: boolean;
};

/**
 * Shared spin wheel for both PRD moments: at registration (before checkout) and
 * 24h before auto-renewal from the member dashboard.
 */
export function SpinWheel({ winDiscount, onSpin, onSettled, spinLabel = 'Spin the wheel', disabled }: SpinWheelProps) {
    const [spinning, setSpinning] = useState(false);
    const [done, setDone] = useState(false);
    const controls = useAnimationControls();
    const segments = buildSegments(`$${winDiscount} off`);

    const spin = async () => {
        if (spinning || done || disabled) return;
        setSpinning(true);

        const outcome = await onSpin();
        if (!outcome) {
            setSpinning(false); // the caller surfaced the error; let them try again

            return;
        }

        const targetIndex = pickSegmentIndex(segments, outcome.won);
        const targetAngle = targetIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;

        await controls.start({
            rotate: 360 * FULL_SPINS - targetAngle,
            transition: { duration: SPIN_MS / 1000, ease: [0.17, 0.67, 0.21, 0.99] }
        });

        setSpinning(false);
        setDone(true);
        onSettled(outcome);
    };

    return (
        <div className='flex flex-col items-center gap-6'>
            <div className='relative'>
                <svg
                    width='300'
                    height='300'
                    viewBox='0 0 300 300'
                    className='drop-shadow-[0_0_30px_rgba(212,175,55,0.25)]'>
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS + 8}
                        fill='url(#wheelBorder)'
                        stroke='#FFDC75'
                        strokeWidth='2'
                    />
                    <defs>
                        <linearGradient id='wheelBorder' x1='0' y1='0' x2='1' y2='1'>
                            <stop offset='0%' stopColor='#F5D78E' />
                            <stop offset='50%' stopColor='#D4AF37' />
                            <stop offset='100%' stopColor='#A07018' />
                        </linearGradient>
                    </defs>

                    <motion.g animate={controls} initial={{ rotate: 0 }} style={{ transformOrigin: 'center' }}>
                        {segments.map((seg, i) => {
                            const startAngle = i * SEGMENT_ANGLE;
                            const midAngle = startAngle + SEGMENT_ANGLE / 2;
                            const labelPos = polarToCartesian(CENTER, CENTER, RADIUS * 0.65, midAngle);

                            return (
                                <g key={i}>
                                    <path
                                        d={arcPath(startAngle, startAngle + SEGMENT_ANGLE)}
                                        fill={seg.fill}
                                        stroke='rgba(255,255,255,0.08)'
                                        strokeWidth='1'
                                    />
                                    {seg.isWin ? (
                                        <text
                                            x={labelPos.x}
                                            y={labelPos.y}
                                            fill={seg.textColor}
                                            fontSize='18'
                                            fontWeight='700'
                                            textAnchor='middle'
                                            dominantBaseline='middle'
                                            transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}>
                                            {seg.label}
                                        </text>
                                    ) : (
                                        <image
                                            href='/icons/ic-duck.webp'
                                            x={labelPos.x - 22}
                                            y={labelPos.y - 22}
                                            width='44'
                                            height='44'
                                            transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </motion.g>

                    <circle cx={CENTER} cy={CENTER} r='18' fill='#0C1132' stroke='#D4AF37' strokeWidth='2' />
                    <circle cx={CENTER} cy={CENTER} r='5' fill='#FFDC75' />
                </svg>

                <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1' aria-hidden='true'>
                    <svg width='28' height='32' viewBox='0 0 28 32'>
                        <path
                            d='M 14 30 L 0 6 A 14 14 0 0 1 28 6 Z'
                            fill='#FFDC75'
                            stroke='#0C1132'
                            strokeWidth='1.5'
                        />
                    </svg>
                </div>
            </div>

            {done ? null : (
                <button
                    type='button'
                    onClick={spin}
                    disabled={spinning || disabled}
                    className='h-12 rounded-xl bg-[linear-gradient(89.12deg,#F5D78E_3.07%,#D4AF37_41.36%,#FFE066_60.5%,#A07018_98.79%)] px-12 text-sm font-bold text-[#0C1132] uppercase shadow-md transition-opacity hover:opacity-90 disabled:opacity-70'>
                    {spinning ? 'Spinning…' : spinLabel}
                </button>
            )}
        </div>
    );
}
