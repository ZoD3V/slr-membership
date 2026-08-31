import EmptyState from '@/components/common/empty-state';
import { TIER_VISUALS } from '@/constant/tiers';
import { type GiveawayWinner, tierGroupFromApi } from '@/lib/api/resources/giveaways';
import { formatShortDate } from '@/lib/member';

import { Trophy } from 'lucide-react';

const timeMs = (iso: string | null | undefined): number => {
    const parsed = Date.parse(iso ?? '');

    return Number.isNaN(parsed) ? 0 : parsed;
};

export function sortPastDraws(winners: GiveawayWinner[]): GiveawayWinner[] {
    return [...winners].sort(
        (a, b) => timeMs(b.recorded_at ?? b.giveaway?.draws_at) - timeMs(a.recorded_at ?? a.giveaway?.draws_at)
    );
}

function PastDrawCard({ winner }: { winner: GiveawayWinner }) {
    const group = tierGroupFromApi(winner.giveaway?.tier ?? '');
    const visual = TIER_VISUALS[group];
    const drawnAt = winner.recorded_at ?? winner.giveaway?.draws_at ?? '';

    return (
        <article className='border-slr-navy-border bg-card-dark-navy shadow-card-soft flex flex-col gap-3 rounded-2xl border p-4 md:p-5'>
            <div className='flex items-start justify-between gap-3'>
                <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${visual.textClass}`}
                    style={{ background: visual.badgeBg, borderColor: visual.badgeBorder }}>
                    {visual.label}
                </span>
                <span className='text-slr-dim text-[10px] tracking-widest uppercase'>
                    {drawnAt ? formatShortDate(drawnAt) : '-'}
                </span>
            </div>

            <div className='space-y-1'>
                <p className='text-gradient-gold text-lg font-bold md:text-xl'>{winner.prize?.trim() || '-'}</p>
                <p className='text-slr-dim line-clamp-1 text-xs'>{winner.giveaway?.name?.trim() || '-'}</p>
            </div>

            <div className='mt-auto border-t border-white/5 pt-3'>
                <p className='text-sm font-semibold text-white/90'>{winner.full_name?.trim() || '-'}</p>
                <p className='text-slr-dim text-xs'>{winner.state?.trim() || '-'}</p>
            </div>
        </article>
    );
}

export function PastDraws({ winners }: { winners: GiveawayWinner[] }) {
    const sorted = sortPastDraws(winners);

    return (
        <section className='space-y-4'>
            <header className='space-y-1'>
                <h2 className='font-bebas-neue text-2xl tracking-wide uppercase sm:text-3xl'>Past Draws</h2>
                <p className='text-slr-muted text-sm md:text-base'>
                    Winners already drawn and certified across every SLR pool.
                </p>
            </header>

            {sorted.length === 0 ? (
                <EmptyState
                    icon={Trophy}
                    title='No Past Draws Yet'
                    description='Winners appear here once a draw has been run and certified.'
                />
            ) : (
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                    {sorted.map((winner) => (
                        <PastDrawCard key={winner.winner_id} winner={winner} />
                    ))}
                </div>
            )}
        </section>
    );
}
