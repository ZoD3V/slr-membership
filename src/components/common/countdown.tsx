'use client';

import { useCountdown } from '@/hooks/use-countdown';
import { cn } from '@/lib/utils';

function DrawingNow({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-400',
                className
            )}>
            <span className='size-2 animate-pulse rounded-full bg-emerald-400' />
            Drawing now…
        </div>
    );
}

function Box({ value, label, mounted }: { value: number; label: string; mounted: boolean }) {
    return (
        <div className='flex flex-col items-center gap-1'>
            <span className='border-slr-gold-edge-faint flex h-12 w-full items-center justify-center rounded-lg border bg-black/40 shadow-[inset_0_1px_0_rgba(255,220,117,0.12)] md:h-14'>
                <span className='text-gradient-gold font-bebas-neue text-2xl leading-none tabular-nums md:text-3xl'>
                    {mounted ? String(value).padStart(2, '0') : '--'}
                </span>
            </span>
            <span className='text-slr-dim text-[10px] tracking-widest uppercase sm:text-xs'>{label}</span>
        </div>
    );
}

export function CountdownBoxes({ targetIso, className }: { targetIso: string; className?: string }) {
    const { days, hours, minutes, seconds, done, mounted } = useCountdown(targetIso);

    if (done) return <DrawingNow />;

    return (
        <div className={cn('grid max-w-xs grid-cols-4 gap-1.5 sm:gap-2', className)}>
            <Box value={days} label='Days' mounted={mounted} />
            <Box value={hours} label='Hrs' mounted={mounted} />
            <Box value={minutes} label='Min' mounted={mounted} />
            <Box value={seconds} label='Sec' mounted={mounted} />
        </div>
    );
}

export function CountdownCompact({ targetIso, className }: { targetIso: string; className?: string }) {
    const { days, hours, minutes, done, mounted } = useCountdown(targetIso);

    if (!mounted) return <span className={cn('text-slr-dim tabular-nums', className)}>—</span>;
    if (done) return <span className={cn('font-semibold text-emerald-400', className)}>Drawing now</span>;

    return (
        <span className={cn('tabular-nums', className)}>
            {days > 0 ? `${days}d ` : ''}
            {hours}h {minutes}m
        </span>
    );
}
