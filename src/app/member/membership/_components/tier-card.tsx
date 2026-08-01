import type { ReactNode } from 'react';

import Image from 'next/image';

import { TierBadge } from '@/components/common/tier-badge';
import { SUB_TIERS, TIER_VISUALS } from '@/constant/tiers';
import { formatAud, formatShortDate, formatTierName } from '@/lib/member';
import type { BillingStatus, SubTierCode } from '@/types/member';

const BILLING_TEXT: Record<string, string> = {
    active: 'text-emerald-400',
    grace: 'text-amber-400',
    past_due: 'text-amber-400',
    inactive: 'text-red-400',
    canceled: 'text-red-400'
};

// Static benefits shown for paid tiers (PRD §2.2 "Benefit Umum RED & BLUE").
const BENEFITS = [
    '9 Draws Weekly/Monthly',
    'Monthly bonus prize',
    'Community discounts',
    'Access to E-books (Finance & Wellbeing)',
    'Upgrade or cancel anytime'
];

interface TierCardProps {
    subTier: SubTierCode;
    priceCents: number;
    /** `null` when neither billing nor membership could be read — say so instead of implying "active". */
    billingStatus: BillingStatus | string | null;
    nextRenewal?: string | null;
    /** Manage actions rendered as the card footer (change plan / cancel / upgrade picker). */
    children?: ReactNode;
}

export function TierCard({ subTier, priceCents, billingStatus, nextRenewal, children }: TierCardProps) {
    const meta = SUB_TIERS[subTier];
    const visual = TIER_VISUALS[meta.group];

    return (
        <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='flex items-start gap-3'>
                    {/* Member-card artwork — same asset as the public tier hero cards */}
                    {visual.cardArt && (
                        <Image
                            src={visual.cardArt}
                            alt=''
                            width={220}
                            height={180}
                            className='w-24 shrink-0 self-center object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)] md:w-28'
                        />
                    )}
                    <div>
                        <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>
                            Current plan
                        </p>
                        <h2 className='font-bebas-neue mt-1 text-2xl tracking-wide text-white uppercase md:text-3xl'>
                            {formatTierName(subTier)}
                        </h2>
                        <p className='text-slr-muted mt-1 text-sm'>
                            <span className='text-gradient-gold font-semibold'>{formatAud(priceCents)}</span> / 28-day
                            cycle ·{' '}
                            {billingStatus ? (
                                // memberships/me returns it UPPERCASE, billing/status lowercase.
                                <span className={BILLING_TEXT[String(billingStatus).toLowerCase()] ?? 'text-slr-muted'}>
                                    {String(billingStatus).toLowerCase().replace('_', ' ')}
                                </span>
                            ) : (
                                <span className='text-slr-dim'>status unavailable</span>
                            )}
                        </p>
                        {nextRenewal ? (
                            <p className='text-slr-dim mt-1 text-xs'>Next renewal {formatShortDate(nextRenewal)}</p>
                        ) : null}
                    </div>
                </div>
                <TierBadge subTier={subTier} />
            </div>

            <ul className='mt-4 grid gap-2 border-t border-white/5 pt-4 text-sm text-white/90 sm:grid-cols-2'>
                {BENEFITS.map((b) => (
                    <li key={b} className='flex items-center gap-2'>
                        <span className='text-slr-gold-label'>✓</span> {b}
                    </li>
                ))}
            </ul>

            {children ? <div className='mt-4 border-t border-white/5'>{children}</div> : null}
        </section>
    );
}
