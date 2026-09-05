'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import GoldOutlineButton from '@/components/common/gold-outline-button';
import GoldPillButton from '@/components/common/gold-pill-button';
import { type PrizeStat, formatPoolAmount } from '@/lib/prize-content';
import { cn } from '@/lib/utils';

import { useMotionValueEvent, useScroll } from 'motion/react';

const COUNT_DURATION = 2000;
const TYPEWRITER_TEXT = 'WE PAY OUT PRIZES EVERY WEEK';

export interface PrizeTierCard {
    name: string;
    accent: string;
    accentGlow: string;
    price: string;
    membersCap: string;
    weekly: string[];
    monthly: string;
    monthlyNote: string;
    /** The milestone prize, shown below the monthly one — it unlocks at a higher member count. */
    bonus: { amount: string; note: string };
    footer: string;
    borderGradient: string;
    surface: string;
    pillBorder: string;
    prizeBox: string;
    footerBar: string;
    moneyFilter?: string;
}

export interface CurrentPrizesContentProps {
    /** Total to count up to. Null when the CMS headline holds non-numeric text. */
    poolAmount: number | null;
    /** Rendered as-is when poolAmount is null. */
    poolText: string;
    stats: PrizeStat[];
    tiers: PrizeTierCard[];
}

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fires once when the element first reaches the viewport. Progress is also > 0 for an
// element already scrolled past, which an IntersectionObserver never reports: an instant
// jump (deep link, restored scroll position) crosses the fold in a single frame and used
// to leave the counter frozen at $0.00.
function useReachedOnce(ref: React.RefObject<HTMLElement | null>, onReach: () => void) {
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const fired = useRef(false);
    const handler = useRef(onReach);
    handler.current = onReach;

    const reach = useCallback(() => {
        if (fired.current) return;
        fired.current = true;
        handler.current();
    }, []);

    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        if (progress > 0) reach();
    });

    useEffect(() => {
        if (scrollYProgress.get() > 0) reach();
    }, [reach, scrollYProgress]);
}

// The pool counter drives the whole section: stats fade in once it lands, cards follow.
function useRevealSequence(total: number | null, statCount: number) {
    const anchorRef = useRef<HTMLHeadingElement>(null);
    const [amount, setAmount] = useState(0);
    const [cardsIn, setCardsIn] = useState(false);
    const cleanup = useRef<() => void>(() => undefined);

    const countUp = useCallback(() => {
        if (total === null || prefersReducedMotion()) {
            setAmount(total ?? 0);
            setCardsIn(true);

            return;
        }

        let frame = 0;
        let cardsTimer: ReturnType<typeof setTimeout>;
        let startedAt: number | null = null;

        const step = (timestamp: number) => {
            if (startedAt === null) startedAt = timestamp;
            const progress = Math.min((timestamp - startedAt) / COUNT_DURATION, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setAmount(eased * total);
            if (progress < 1) {
                frame = window.requestAnimationFrame(step);

                return;
            }
            setAmount(total);
            cardsTimer = setTimeout(() => setCardsIn(true), statCount * 150 + 200);
        };
        frame = window.requestAnimationFrame(step);

        cleanup.current = () => {
            window.cancelAnimationFrame(frame);
            clearTimeout(cardsTimer);
        };
    }, [statCount, total]);

    useReachedOnce(anchorRef, countUp);
    useEffect(() => () => cleanup.current(), []);

    return { anchorRef, amount, cardsIn };
}

function useTypewriter(text: string) {
    const ref = useRef<HTMLHeadingElement>(null);
    const [typed, setTyped] = useState('');
    const cleanup = useRef<() => void>(() => undefined);

    const type = useCallback(() => {
        if (prefersReducedMotion()) {
            setTyped(text);

            return;
        }

        let index = 0;
        const timer = setInterval(() => {
            index += 1;
            setTyped(text.slice(0, index));
            if (index >= text.length) clearInterval(timer);
        }, 55);
        cleanup.current = () => clearInterval(timer);
    }, [text]);

    useReachedOnce(ref, type);
    useEffect(() => () => cleanup.current(), []);

    return { ref, typed };
}

const CARD_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

const TierCardBlock = ({ tier, shown, delayMs }: { tier: PrizeTierCard; shown: boolean; delayMs: number }) => (
    <div
        className='rounded-2xl p-0.5'
        style={{
            background: tier.borderGradient,
            opacity: shown ? 1 : 0,
            transform: shown ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 0.8s ${CARD_EASE} ${delayMs}ms, transform 0.8s ${CARD_EASE} ${delayMs}ms`
        }}>
        <div
            className='relative flex h-full flex-col overflow-hidden rounded-[14px]'
            style={{ background: tier.surface }}>
            <div
                aria-hidden='true'
                className='absolute top-[-10px] left-0 z-0 h-[210px] w-full opacity-35'
                style={{
                    background: "url('/images/clean_money_blue.jpg') no-repeat center 20%",
                    backgroundSize: 'cover',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                    filter: tier.moneyFilter
                }}
            />

            <div className='relative z-10 flex flex-col items-center px-4 pt-8 text-center sm:px-6'>
                <h3
                    className='font-bebas-neue text-5xl font-bold tracking-wider uppercase sm:text-6xl'
                    style={{ color: tier.accent, textShadow: `0px 0px 18px ${tier.accentGlow}` }}>
                    {tier.name}
                </h3>
                <span
                    className='mt-4 inline-block max-w-full rounded-full bg-black/50 px-6 py-2.5 text-lg font-bold tracking-wider whitespace-nowrap text-white uppercase sm:px-10 sm:py-3 sm:text-[22px]'
                    style={{ border: `1px solid ${tier.pillBorder}` }}>
                    From <span className='text-gradient-gold'>{tier.price}</span>
                </span>
                <p className='mt-4 text-sm font-bold tracking-widest text-white/60 uppercase sm:text-[15px]'>
                    {tier.membersCap}
                </p>
            </div>

            <div className='relative z-10 mx-auto flex w-full flex-col gap-6 px-4 pt-4 pb-6'>
                <div className='flex flex-col items-center text-center'>
                    <h4
                        className='text-gradient-gold font-bebas-neue mb-4 text-[26px] leading-none tracking-wider sm:text-[32px]'
                        style={{ textShadow: '0 0 16px rgba(212,175,55,0.4)' }}>
                        {tier.weekly.length} Weekly Prize Draws
                    </h4>
                    <div
                        className='mx-auto flex w-full max-w-90 items-center justify-center rounded-xl px-4 py-3 sm:px-5'
                        style={{ backgroundColor: tier.prizeBox }}>
                        <p
                            className='text-center text-lg leading-relaxed font-extrabold tracking-wide text-white sm:text-[22px]'
                            style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                            {tier.weekly.map((prize, index) => (
                                <span key={`${prize}-${index}`}>
                                    {index > 0 && <br />}
                                    {prize}
                                </span>
                            ))}
                        </p>
                    </div>
                </div>

                <div className='-mt-2 flex flex-col items-center text-center'>
                    <p
                        className='text-gradient-gold font-bebas-neue text-[32px] leading-none tracking-wider text-balance sm:text-[42px]'
                        style={{ textShadow: '0 0 16px rgba(212,175,55,0.4)' }}>
                        {tier.monthly}
                    </p>
                    <span className='mt-0.5 text-xs tracking-[0.1em] text-white/60 uppercase'>{tier.monthlyNote}</span>
                </div>

                <div className='mt-3 flex flex-col items-center text-center'>
                    <p
                        className='text-gradient-gold font-bebas-neue text-[44px] leading-none tracking-wider whitespace-nowrap sm:text-[56px]'
                        style={{ textShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
                        {tier.bonus.amount}
                    </p>
                    <span className='mt-0.5 text-xs tracking-[0.1em] text-white/60 uppercase'>{tier.bonus.note}</span>
                </div>
            </div>

            <div
                className='relative z-10 mt-auto px-3 py-3.5 text-center leading-tight'
                style={{ background: tier.footerBar, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <p className='text-[clamp(12px,3.4vw,17px)] font-bold tracking-wider whitespace-nowrap text-white uppercase md:text-[17px]'>
                    {tier.footer}
                </p>
            </div>
        </div>
    </div>
);

export function CurrentPrizesContent({ poolAmount, poolText, stats, tiers }: CurrentPrizesContentProps) {
    const { anchorRef, amount, cardsIn } = useRevealSequence(poolAmount, stats.length);
    const { ref: typeRef, typed } = useTypewriter(TYPEWRITER_TEXT);

    return (
        <section id='current-prizes' className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-6xl px-4'>
                <div className='mb-14 flex flex-col items-center justify-center text-center md:mb-[70px]'>
                    <p className='mb-2 text-[10px] font-semibold tracking-[0.2em] text-white/60 uppercase sm:mb-4 sm:text-xs md:text-sm'>
                        Monthly Total Prize Pool
                    </p>
                    <h2
                        ref={anchorRef}
                        className='text-gradient-gold font-bebas-neue text-[64px] leading-[0.9] tracking-wider tabular-nums sm:text-[90px] md:text-[130px]'
                        style={{ textShadow: '0 0 40px rgba(212,175,55,0.4)' }}>
                        {poolAmount === null ? poolText : formatPoolAmount(amount)}
                    </h2>

                    <div className='mt-8 flex items-center justify-center gap-3 min-[600px]:gap-6 md:gap-10'>
                        {stats.map((stat, index) => (
                            <div key={stat.value} className='flex items-center gap-3 min-[600px]:gap-6 md:gap-10'>
                                {index > 0 && (
                                    <div aria-hidden='true' className='h-8 w-px bg-white/20 min-[600px]:h-10 md:h-15' />
                                )}
                                <div className='flex flex-col items-center justify-center text-center'>
                                    <p
                                        className='text-gradient-gold font-bebas-neue text-[15px] leading-[1.1] tracking-wider min-[600px]:text-[24px] md:text-[40px]'
                                        style={{ textShadow: '0 0 12px rgba(212, 175, 55, 0.35)' }}>
                                        {stat.value}
                                    </p>
                                    <p className='mt-1 text-[8px] font-medium tracking-widest text-white/60 uppercase sm:mt-1.5 sm:text-[10px] md:text-xs'>
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='mx-auto grid max-w-[940px] grid-cols-1 items-stretch gap-8 md:grid-cols-2'>
                    {tiers.map((tier, index) => (
                        <TierCardBlock key={tier.name} tier={tier} shown={cardsIn} delayMs={index * 200} />
                    ))}
                </div>

                <div className='mx-auto mt-12 max-w-[940px] text-center'>
                    <div className='flex w-full items-center justify-center gap-4'>
                        <div
                            className='h-px w-12 sm:w-20 lg:w-32'
                            style={{ background: 'linear-gradient(270deg, #B08A20 0%, rgba(255,255,255,0) 100%)' }}
                            aria-hidden='true'
                        />
                        <h2
                            ref={typeRef}
                            className='font-bebas-neue m-0 min-h-[1em] text-center text-3xl leading-none font-medium tracking-wider uppercase sm:text-5xl lg:text-[50px]'>
                            <span className='text-gradient-gold'>{typed}</span>
                        </h2>
                        <div
                            className='h-px w-12 sm:w-20 lg:w-32'
                            style={{ background: 'linear-gradient(90deg, #B08A20 0%, rgba(255,255,255,0) 100%)' }}
                            aria-hidden='true'
                        />
                    </div>
                    <p className='mt-3 text-center text-[10px] tracking-wide text-white/50 sm:text-xs'>
                        <Link href='/terms' className='underline transition-colors hover:text-[#F5D78E]'>
                            T&amp;C
                        </Link>{' '}
                        and{' '}
                        <Link href='/giveaway-rules' className='underline transition-colors hover:text-[#F5D78E]'>
                            Draw Rules
                        </Link>{' '}
                        apply across all prizes and tiers.
                    </p>
                </div>

                <div className='mx-auto mt-8 flex w-full max-w-sm flex-row justify-center gap-2 px-2 sm:max-w-none sm:gap-4'>
                    <GoldPillButton
                        href='/sign-up'
                        className={cn(
                            'w-1/2 gap-1 px-2 py-2.5 text-[12px] whitespace-nowrap sm:w-auto sm:gap-2 sm:px-8',
                            'sm:text-base sm:whitespace-normal'
                        )}>
                        JOIN NOW
                    </GoldPillButton>
                    <GoldOutlineButton
                        href='/membership'
                        className='w-1/2 px-2 py-2.5 text-[12px] whitespace-nowrap sm:w-auto sm:px-8 sm:text-base sm:whitespace-normal'>
                        View Membership
                    </GoldOutlineButton>
                </div>
            </div>
        </section>
    );
}
