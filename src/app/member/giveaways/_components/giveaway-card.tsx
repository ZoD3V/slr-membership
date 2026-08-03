import Link from 'next/link';

import { CountdownCompact } from '@/components/common/countdown';
import { DrawTypeBadge } from '@/components/common/draw-type-badge';
import { TierGroupBadge } from '@/components/common/tier-badge';
import { TIER_VISUALS } from '@/constant/tiers';
import { formatShortDate } from '@/lib/member';
import { cn } from '@/lib/utils';
import type { Giveaway } from '@/types/member';

import { ArrowRight, CheckCircle2, Clock, Lock, MapPin, Ticket, Trophy } from 'lucide-react';

export function GiveawayCard({ giveaway }: { giveaway: Giveaway }) {
    const visual = TIER_VISUALS[giveaway.tier_group];

    return (
        <article
            className='shadow-card-soft flex flex-col gap-3 rounded-2xl border p-4 md:p-5'
            style={{ background: visual.badgeBg, borderColor: visual.badgeBorder }}>
            <div className='flex items-center justify-between gap-2'>
                <span className='flex items-center gap-1.5'>
                    <TierGroupBadge group={giveaway.tier_group} />
                    <DrawTypeBadge type={giveaway.draw_type} />
                </span>
                {giveaway.entered ? (
                    <span className='inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400 uppercase'>
                        <CheckCircle2 className='size-3' /> You&apos;re Entered
                    </span>
                ) : giveaway.locked ? (
                    <span className='text-slr-dim inline-flex items-center gap-1 text-xs font-semibold uppercase'>
                        <Lock className='size-3' /> Not your tier
                    </span>
                ) : null}
            </div>

            <div className={cn('space-y-1', giveaway.locked && 'opacity-75')}>
                <h3 className='font-bebas-neue text-xl tracking-wide text-white uppercase md:text-2xl'>
                    {giveaway.title}
                </h3>
                <p className='inline-flex items-center gap-1.5 text-sm font-semibold'>
                    <Trophy className='text-slr-gold-label size-4 shrink-0' />
                    <span className='text-gradient-gold'>{giveaway.prize_label}</span>
                </p>
            </div>

            <div className='text-slr-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
                <span className='inline-flex items-center gap-1'>
                    <MapPin className='size-3.5' /> {giveaway.draw_pool}
                </span>
                {giveaway.entered && (
                    <span className='inline-flex items-center gap-1'>
                        <Ticket className='size-3.5' />
                        <span className='tabular-nums'>{giveaway.total_entries}</span> entries
                    </span>
                )}
            </div>

            <div className='flex items-center gap-1.5 text-sm text-white/90'>
                <Clock className='text-slr-dim size-4' />
                {giveaway.phase === 'drawn' ? (
                    <span className='text-slr-dim'>Drawn · {formatShortDate(giveaway.draws_at)}</span>
                ) : giveaway.phase === 'upcoming' ? (
                    <span className='text-slr-muted'>Opens {formatShortDate(giveaway.opens_at)}</span>
                ) : (
                    <CountdownCompact targetIso={giveaway.draws_at} />
                )}
            </div>

            <div className='mt-auto border-t border-white/10 pt-3'>
                {giveaway.locked ? (
                    <Link
                        href='/member/membership'
                        className='text-slr-gold-label inline-flex items-center gap-1 text-xs font-semibold uppercase transition-opacity hover:opacity-80'>
                        Upgrade to enter <ArrowRight className='size-3.5' />
                    </Link>
                ) : (
                    <Link
                        href={`/member/giveaways/${giveaway.id}`}
                        className='inline-flex items-center gap-1 text-xs font-semibold text-white/80 uppercase transition-colors hover:text-white'>
                        View details <ArrowRight className='size-3.5' />
                    </Link>
                )}
            </div>
        </article>
    );
}
