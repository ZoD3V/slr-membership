'use client';

import { useState } from 'react';

import Link from 'next/link';

import { TIER_VISUALS } from '@/constant/tiers';
import { formatShortDate, isGiveawayLocked, tierGroupOf, visibleGiveawayTabs } from '@/lib/member';
import { cn } from '@/lib/utils';
import type { Giveaway, SubTierCode, TierGroup } from '@/types/member';

import { GiveawayCard } from './giveaway-card';
import { Lock } from 'lucide-react';

function GiveawayGrid({ items }: { items: Giveaway[] }) {
    if (items.length === 0) {
        return <p className='text-slr-dim py-10 text-center text-sm'>No active giveaways here right now.</p>;
    }

    return (
        <div className='grid gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            {items.map((giveaway) => (
                <GiveawayCard key={giveaway.id} giveaway={giveaway} />
            ))}
        </div>
    );
}

export function GiveawaysBoard({
    giveaways,
    memberSubTier,
    nextRenewalIso
}: {
    giveaways: Giveaway[];
    memberSubTier: SubTierCode;
    nextRenewalIso?: string | null;
}) {
    const memberGroup = tierGroupOf(memberSubTier);
    const tabs = visibleGiveawayTabs(memberGroup);

    // Hooks must run unconditionally — default to the member's own tier tab.
    const [active, setActive] = useState<TierGroup>(tabs.includes(memberGroup) ? memberGroup : (tabs[0] ?? 'red'));

    // Visitor (PRD §4.3): no RED/BLUE segmented control — only the weekly draw.
    if (tabs.length === 0) {
        return (
            <div className='space-y-4'>
                <p className='text-slr-muted text-sm'>
                    Your weekly Visitor draw. Upgrade to RED or BLUE to unlock cash draws and more.
                </p>
                <GiveawayGrid items={giveaways.filter((g) => g.tier_group === 'visitor')} />
            </div>
        );
    }

    return (
        <div className='space-y-5'>
            {/* Tier segment control — RED / BLUE (PRD §4.3). */}
            <div
                className='border-slr-navy-border inline-flex gap-1 rounded-xl border p-1'
                role='tablist'
                aria-label='Giveaway tier'>
                {tabs.map((tab) => {
                    const visual = TIER_VISUALS[tab];
                    const on = active === tab;

                    return (
                        <button
                            key={tab}
                            type='button'
                            role='tab'
                            aria-selected={on}
                            onClick={() => setActive(tab)}
                            className={cn(
                                'rounded-lg border px-4 py-1.5 text-sm font-semibold tracking-wide uppercase transition-colors',
                                on ? visual.textClass : 'text-slr-dim border-transparent hover:text-white'
                            )}
                            style={on ? { background: visual.badgeBg, borderColor: visual.badgeBorder } : undefined}>
                            {visual.label}
                        </button>
                    );
                })}
            </div>

            {/* Locked-tab upsell — the active tab is above the member's tier (PRD: paid→paid
                upgrades apply at the next renewal, so the date comes from billing). */}
            {isGiveawayLocked(active, memberGroup) && (
                <div
                    className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 md:p-5'
                    style={{ background: TIER_VISUALS[active].badgeBg, borderColor: TIER_VISUALS[active].badgeBorder }}>
                    <div className='flex items-start gap-3'>
                        <Lock className={cn('mt-0.5 size-5 shrink-0', TIER_VISUALS[active].textClass)} />
                        <div>
                            <p className={cn('text-sm font-semibold md:text-base', TIER_VISUALS[active].textClass)}>
                                You&apos;re on {TIER_VISUALS[memberGroup].label} — these draws are{' '}
                                {TIER_VISUALS[active].label} only
                            </p>
                            <p className='text-slr-muted mt-0.5 text-xs md:text-sm'>
                                {nextRenewalIso
                                    ? `Upgrading takes effect at your next cycle on ${formatShortDate(nextRenewalIso)}.`
                                    : 'Upgrading takes effect at your next cycle.'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href='/member/membership'
                        className='inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10'>
                        Compare tiers
                    </Link>
                </div>
            )}

            <GiveawayGrid items={giveaways.filter((g) => g.tier_group === active)} />
        </div>
    );
}
