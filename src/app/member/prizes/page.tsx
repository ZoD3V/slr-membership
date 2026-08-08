import type { Metadata } from 'next';

import { getCurrentMember } from '@/data/member-dashboard';
import { getPrizePool } from '@/data/prizes';
import { tierGroupOf } from '@/lib/member';
import { activeStage, stageLabel } from '@/lib/prizes';

import { PrizeTierCard } from './_components/prize-tier-card';
import { StageTracker } from './_components/stage-tracker';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Prizes · SLR Member'
};

export default async function PrizesPage() {
    const [pool, member] = await Promise.all([getPrizePool(), getCurrentMember()]);
    const memberGroup = tierGroupOf(member.sub_tier);
    const stage = activeStage(pool.current_members);

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='space-y-1'>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>Prizes</h1>
                <p className='text-slr-muted text-sm md:text-base'>
                    The prize pool for the current membership stage and what each tier can win.
                </p>
            </header>

            {/* Prize pool hero */}
            <section className='slr-section-bg border-slr-navy-border relative overflow-hidden rounded-2xl border p-6 text-center md:p-10'>
                <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase md:text-sm'>
                    {stageLabel(stage)}
                </p>
                <p className='font-bebas-neue mt-2 leading-none'>
                    <span className='text-gradient-gold text-6xl md:text-8xl'>{pool.headline}</span>
                </p>
                <p className='text-slr-muted mt-1 text-sm md:text-base'>{pool.prizes_sublabel}</p>
                <div className='border-slr-gold-label/30 bg-gold-tint mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5'>
                    <Sparkles className='text-slr-gold-label size-4' />
                    <span className='text-sm font-semibold text-white'>{pool.odds_label}</span>
                </div>
            </section>

            <StageTracker pool={pool} />

            {/* Prize breakdown by tier — member's tier highlighted */}
            <section>
                <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                    <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase md:text-2xl'>
                        Prize Breakdown
                    </h2>
                    <span className='text-slr-dim text-xs'>Your tier is highlighted</span>
                </div>
                <div className='grid gap-4 md:grid-cols-3'>
                    {pool.tiers.map((tier) => (
                        <PrizeTierCard key={tier.tier_group} tier={tier} isYours={tier.tier_group === memberGroup} />
                    ))}
                </div>
            </section>

            <p className='text-slr-dim mx-auto max-w-2xl text-center text-xs leading-relaxed'>
                Prize pool figures are indicative and updated by SLR each membership stage. All prizes are drawn
                externally at randomdraws.com.au under TPAL certification.
            </p>
        </div>
    );
}
