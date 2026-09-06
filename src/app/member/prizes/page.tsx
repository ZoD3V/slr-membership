import type { Metadata } from 'next';

import { DrawRulesBody } from '@/components/common/draw-rules-body';
import EmptyState from '@/components/common/empty-state';
import { TIER_VISUALS } from '@/constant/tiers';
import { getCurrentMember } from '@/data/member-dashboard';
import { handleApiAuthError } from '@/lib/api/guard';
import { getDrawRules } from '@/lib/api/resources/announcements';
import { GIVEAWAY_RULES } from '@/lib/api/resources/giveaways';
import { getPrizePool } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import { formatShortDate, tierGroupOf } from '@/lib/member';
import { type TierPricing, getTierPricing, minPriceOf } from '@/lib/tier-pricing';
import type { PrizeContent, PrizeTierBreakdown, TierGroup } from '@/types/member';

import { PrizeTierCard } from './_components/prize-tier-card';
import { CircleAlert, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Prizes · SLR Member'
};

const TIER_ORDER: TierGroup[] = ['visitor', 'red', 'blue'];

function priceLabel(pricing: TierPricing, group: TierGroup): string {
    if (group === 'visitor') return 'Free to join';

    return `from $${minPriceOf(pricing, group) / 100}/4 weeks`;
}

function toTierBreakdown(content: PrizeContent, pricing: TierPricing): PrizeTierBreakdown[] {
    return TIER_ORDER.map((group) => ({
        tier_group: group,
        tier_label: group === 'visitor' ? 'Visitor' : `SLR ${TIER_VISUALS[group].label}`,
        price_label: priceLabel(pricing, group),
        weekly:
            group === 'visitor' ? content.visitor_prize : group === 'red' ? content.red_weekly : content.blue_weekly,
        monthly: group === 'visitor' ? null : group === 'red' ? content.red_monthly : content.blue_monthly
    }));
}

export default async function PrizesPage() {
    const [token, member, drawRules] = await Promise.all([getAccessToken(), getCurrentMember(), getDrawRules()]);
    const memberGroup = tierGroupOf(member.sub_tier);

    let content: PrizeContent | null = null;
    let failed = !token;
    const pricing = await getTierPricing();

    if (token) {
        try {
            content = await getPrizePool(token);
        } catch (error) {
            handleApiAuthError(error);
            failed = true;
        }
    }

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='space-y-1'>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>Prizes</h1>
                <p className='text-slr-muted text-sm md:text-base'>
                    The prize pool for the current membership stage and what each tier can win.
                </p>
            </header>

            {failed || !content ? (
                <EmptyState
                    icon={CircleAlert}
                    title='Prizes Unavailable'
                    description='We couldn’t load the current prize pool right now. Please try again shortly.'
                />
            ) : (
                <>
                    <section className='slr-section-bg border-slr-navy-border relative overflow-hidden rounded-2xl border p-6 text-center md:p-10'>
                        <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase md:text-sm'>
                            {content.stage_label}
                        </p>
                        <p className='font-bebas-neue mt-2 leading-none'>
                            <span className='text-gradient-gold text-6xl md:text-8xl'>
                                {content.prize_pool_headline}
                            </span>
                        </p>
                        <p className='text-slr-muted mt-1 text-sm md:text-base'>{content.prize_count}</p>
                        <div className='border-slr-gold-label/30 bg-gold-tint mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5'>
                            <Sparkles className='text-slr-gold-label size-4' />
                            <span className='text-sm font-semibold text-white'>{content.odds}</span>
                        </div>
                    </section>

                    <section>
                        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                            <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase md:text-2xl'>
                                Prize Breakdown
                            </h2>
                            <span className='text-slr-dim text-xs'>Your tier is highlighted</span>
                        </div>
                        <div className='grid gap-4 md:grid-cols-3'>
                            {toTierBreakdown(content, pricing).map((tier) => (
                                <PrizeTierCard
                                    key={tier.tier_group}
                                    tier={tier}
                                    isYours={tier.tier_group === memberGroup}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                            <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase md:text-2xl'>
                                Draw Rules
                            </h2>
                            {drawRules?.updated_at ? (
                                <span className='text-slr-dim text-xs'>
                                    Updated {formatShortDate(drawRules.updated_at)}
                                </span>
                            ) : null}
                        </div>
                        <div className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
                            <DrawRulesBody html={drawRules?.content} fallback={GIVEAWAY_RULES} />
                        </div>
                    </section>

                    <p className='text-slr-dim mx-auto max-w-2xl text-center text-xs leading-relaxed'>
                        Prize pool figures are indicative and updated by SLR each membership stage. Draws are run on the
                        TPAL digital draw system or SLR&rsquo;s own provably fair draw engine, audited with SHA-256
                        verification.
                    </p>
                </>
            )}
        </div>
    );
}
