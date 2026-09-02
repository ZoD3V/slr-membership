'use client';

import { useEffect, useState } from 'react';

// Draws run Friday 8:00pm AEST. AEST is treated as a fixed UTC+10 offset, so the
// countdown does not shift when the browser sits in another timezone.
const AEST_OFFSET_MS = 10 * 60 * 60 * 1000;
const FIRST_DRAW_MS = Date.UTC(2026, 8, 11, 10, 0, 0);
const FRIDAY = 5;
const DRAW_HOUR_AEST = 20;

function nextDrawMs(now: number): number {
    if (now < FIRST_DRAW_MS) return FIRST_DRAW_MS;

    const aestNow = new Date(now + AEST_OFFSET_MS);
    let dayOffset = FRIDAY - aestNow.getUTCDay();
    if (dayOffset < 0 || (dayOffset === 0 && aestNow.getUTCHours() >= DRAW_HOUR_AEST)) {
        dayOffset += 7;
    }

    const drawAest = Date.UTC(
        aestNow.getUTCFullYear(),
        aestNow.getUTCMonth(),
        aestNow.getUTCDate() + dayOffset,
        DRAW_HOUR_AEST,
        0,
        0,
        0
    );

    return drawAest - AEST_OFFSET_MS;
}

function remaining(now: number) {
    const distance = Math.max(nextDrawMs(now) - now, 0);

    return {
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        mins: Math.floor((distance % 3600000) / 60000),
        secs: Math.floor((distance % 60000) / 1000)
    };
}

const pad = (value: number) => String(value).padStart(2, '0');

const ZERO = { days: 0, hours: 0, mins: 0, secs: 0 };

const Separator = () => (
    <span
        aria-hidden='true'
        className='font-bebas-neue pb-6 text-4xl text-[#403314] sm:pb-8 sm:text-6xl md:text-7xl lg:text-[80px]'>
        :
    </span>
);

const Unit = ({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) => (
    <div className='z-10 flex w-17.5 flex-col items-center sm:w-22.5 md:w-27.5'>
        <span
            className={`font-bebas-neue text-5xl leading-none tabular-nums sm:text-7xl md:text-8xl lg:text-[100px] ${highlight ? 'text-[#FFDC75]' : 'text-white'}`}
            style={highlight ? { textShadow: '0 0 20px rgba(212,175,55,0.4)' } : undefined}>
            {value}
        </span>
        <span className='text-slr-gold-label mt-2 text-[10px] font-bold tracking-widest uppercase sm:text-xs md:text-sm'>
            {label}
        </span>
    </div>
);

const DrawCountdownSection = () => {
    // Server render stays at 00:00:00:00 so the first client paint matches the markup.
    const [time, setTime] = useState(ZERO);

    useEffect(() => {
        const tick = () => setTime(remaining(Date.now()));
        tick();
        const timer = setInterval(tick, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='mt-4 flex items-center justify-center gap-4 sm:gap-8'>
                    <div
                        className='h-px w-12 shrink-0 sm:w-20 lg:w-32'
                        style={{ background: 'linear-gradient(270deg, #B08A20 0%, rgba(255,255,255,0) 100%)' }}
                        aria-hidden='true'
                    />
                    <h2 className='font-bebas-neue m-0 max-w-[60%] text-center text-4xl leading-none font-medium tracking-wider uppercase sm:max-w-[70%] sm:text-5xl lg:text-[50px]'>
                        <span className='text-gradient-gold'>Secure your entry before the Friday night draw!</span>
                    </h2>
                    <div
                        className='h-px w-12 shrink-0 sm:w-20 lg:w-32'
                        style={{ background: 'linear-gradient(90deg, #B08A20 0%, rgba(255,255,255,0) 100%)' }}
                        aria-hidden='true'
                    />
                </div>

                <div className='mt-12 flex flex-col items-center justify-center gap-4 sm:gap-6'>
                    <div
                        className='relative flex w-full max-w-4xl flex-wrap items-center justify-center gap-4 overflow-hidden rounded-2xl p-6 text-center sm:gap-8 sm:p-10 lg:gap-12'
                        style={{
                            border: '1px solid #403314',
                            background: 'linear-gradient(180deg, #212429 0%, #0F1214 100%)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}>
                        <Unit value={pad(time.days)} label='Days' />
                        <Separator />
                        <Unit value={pad(time.hours)} label='Hours' />
                        <Separator />
                        <Unit value={pad(time.mins)} label='Mins' />
                        <Separator />
                        <Unit value={pad(time.secs)} label='Secs' highlight />

                        <div
                            aria-hidden='true'
                            className='pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-[#B08A20] opacity-5 blur-3xl'
                        />
                        <div
                            aria-hidden='true'
                            className='pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-[#B08A20] opacity-5 blur-3xl'
                        />
                    </div>

                    <p className='px-4 text-center text-[11px] tracking-wide text-white/50 sm:text-sm'>
                        *All winners are announced publicly via email and across our social media channels.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default DrawCountdownSection;
