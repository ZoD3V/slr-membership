import Link from 'next/link';

import { DrawTypeBadge } from '@/components/common/draw-type-badge';
import { TierGroupBadge } from '@/components/common/tier-badge';
import { TIER_VISUALS } from '@/constant/tiers';
import { formatDrawDateTime } from '@/lib/member';
import { cn } from '@/lib/utils';
import type { UpcomingGiveaway } from '@/types/member';

import { SectionTitle } from './section-title';
import { ArrowRight, CalendarClock, Lock, Trophy } from 'lucide-react';

function GiveawayCard({ giveaway }: { giveaway: UpcomingGiveaway }) {
    // Tier-coloured diagonal gradient + alpha border — same palette as the home tier cards.
    const visual = TIER_VISUALS[giveaway.tier_group];

    return (
        <article
            className='shadow-card-warm flex flex-col gap-3 rounded-2xl border p-4 sm:p-5'
            style={{ background: visual.badgeBg, borderColor: visual.badgeBorder }}>
            <div className='flex items-center justify-between gap-2'>
                <span className='flex items-center gap-1.5'>
                    <TierGroupBadge group={giveaway.tier_group} />
                    <DrawTypeBadge type={giveaway.draw_type} />
                </span>
                {giveaway.locked && (
                    <span className='text-slr-dim inline-flex items-center gap-1 text-xs font-semibold tracking-wide uppercase'>
                        <Lock className='size-3' /> Locked
                    </span>
                )}
            </div>

            <div className={cn('space-y-1', giveaway.locked && 'opacity-70')}>
                <h3 className='text-sm font-semibold text-white'>{giveaway.title}</h3>
                <p className='inline-flex items-center gap-1.5 text-sm font-semibold'>
                    <Trophy className='text-slr-gold-label size-4 shrink-0' />
                    <span className='text-gradient-gold'>{giveaway.prize_label}</span>
                </p>
            </div>

            <div className='mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-3'>
                <span className='text-slr-dim inline-flex items-center gap-1.5 text-xs'>
                    <CalendarClock className='size-3.5' />
                    {formatDrawDateTime(giveaway.draws_at)}
                </span>
                {giveaway.locked ? (
                    <Link
                        href='/member/membership'
                        className='text-slr-gold-label inline-flex items-center gap-1 text-xs font-semibold uppercase transition-opacity hover:opacity-80'>
                        Upgrade <ArrowRight className='size-3' />
                    </Link>
                ) : (
                    <Link
                        href='/member/giveaways'
                        className='inline-flex items-center gap-1 text-xs font-semibold text-white/80 uppercase transition-colors hover:text-white'>
                        View <ArrowRight className='size-3' />
                    </Link>
                )}
            </div>
        </article>
    );
}

export function UpcomingGiveaways({ giveaways }: { giveaways: UpcomingGiveaway[] }) {
    return (
        <section>
            <SectionTitle viewAllHref='/member/giveaways'>Active Giveaways</SectionTitle>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {giveaways.map((giveaway) => (
                    <GiveawayCard key={giveaway.id} giveaway={giveaway} />
                ))}
            </div>
        </section>
    );
}
