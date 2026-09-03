import { CountdownBoxes } from '@/components/common/countdown';
import { EntryStatusBadge } from '@/components/common/entry-status-badge';
import { LIVE_DRAW_URL } from '@/constant/links';
import { goldButtonStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { DrawStatus } from '@/types/member';

import { ExternalLink, Ticket, Trophy } from 'lucide-react';

interface DrawStatusCardProps {
    draw: DrawStatus;

    drawsAtLabel: string;

    eyebrow?: string;

    dateWord?: string;
    className?: string;
}

export function DrawStatusCard({
    draw,
    drawsAtLabel,
    eyebrow = 'Current Draw',
    dateWord = 'Draws',
    className
}: DrawStatusCardProps) {
    const hasPrize = Boolean(draw.prize_label) && draw.prize_label !== '-';

    return (
        <div
            className={cn(
                'bg-card-dark-navy border-slr-navy-border shadow-card-warm relative isolate overflow-hidden rounded-2xl border p-5 md:p-6',
                className
            )}>
            <div aria-hidden className='slr-stars-overlay pointer-events-none absolute inset-0 -z-10 opacity-40' />
            <div
                aria-hidden
                className='bg-slr-gold-metal/10 pointer-events-none absolute -top-16 -right-16 -z-10 size-56 rounded-full blur-3xl'
            />
            <div
                aria-hidden
                className='pointer-events-none absolute -bottom-20 -left-16 -z-10 hidden size-56 rounded-full bg-[#2878E8]/8 blur-3xl md:block'
            />

            <div className='flex items-start justify-between gap-2'>
                <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>{eyebrow}</p>
                <EntryStatusBadge status={draw.entry_status} />
            </div>

            <h3 className='font-bebas-neue mt-2 text-2xl tracking-wide text-white uppercase md:text-3xl'>
                {draw.title}
            </h3>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
                <span className='text-slr-muted inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-xs'>
                    <Ticket className='text-slr-gold-label size-3.5' />
                    <span className='tabular-nums'>{draw.total_entries.toLocaleString('en-AU')}</span> entries
                </span>
            </div>

            <div className='mt-5'>
                <CountdownBoxes targetIso={draw.draws_at} />
            </div>

            <a
                href={LIVE_DRAW_URL}
                target='_blank'
                rel='noopener noreferrer'
                style={goldButtonStyle}
                className='mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase transition-opacity hover:opacity-90'>
                Watch Live Draw <ExternalLink className='size-4' />
            </a>

            <div className='mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4'>
                {hasPrize ? (
                    <span className='inline-flex items-center gap-2 font-semibold'>
                        <Trophy className='text-slr-gold-label size-4' />
                        <span className='text-gradient-gold'>{draw.prize_label}</span>
                    </span>
                ) : (
                    <span className='text-slr-muted text-xs'>Entries reset each 28-day cycle</span>
                )}
                <span className='text-slr-dim text-xs'>
                    {dateWord} {drawsAtLabel}
                </span>
            </div>
        </div>
    );
}
