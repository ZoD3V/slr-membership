import type { ReactNode } from 'react';

import Image from 'next/image';

import { TierBadge } from '@/components/common/tier-badge';
import { SUB_TIERS, TIER_VISUALS } from '@/constant/tiers';
import { formatAud, formatShortDate, formatTierName } from '@/lib/member';
import { cn } from '@/lib/utils';
import type { BillingStatus, MembershipSummary } from '@/types/member';

import { CalendarClock, CreditCard, Sparkles, Ticket } from 'lucide-react';

const BILLING: Record<BillingStatus, { label: string; dot: string; text: string }> = {
    active: { label: 'Active', dot: 'bg-emerald-400', text: 'text-emerald-400' },
    past_due: { label: 'Past due', dot: 'bg-amber-400', text: 'text-amber-400' },
    canceled: { label: 'Canceled', dot: 'bg-red-400', text: 'text-red-400' }
};

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
    return (
        <div className='flex items-center justify-between gap-3 py-2'>
            <span className='text-slr-muted inline-flex items-center gap-2 text-sm'>
                {icon}
                {label}
            </span>
            <span className='text-sm font-medium text-white'>{children}</span>
        </div>
    );
}

export function MembershipSummaryCard({
    summary,
    isVisitor = false,
    className
}: {
    summary: MembershipSummary;
    /** Visitor is free with no billing/renewal — hide the billing + next-payment rows. */
    isVisitor?: boolean;
    className?: string;
}) {
    const meta = SUB_TIERS[summary.sub_tier];
    const visual = TIER_VISUALS[meta.group];
    // Unknown ≠ active: when the membership read failed, say so rather than
    // painting a green dot the API never confirmed.
    const billing = summary.billing_status ? BILLING[summary.billing_status] : null;
    const isCancelled = summary.cancel_at_period_end ?? false;

    const tierName = meta.group === 'visitor' ? 'Visitor Pass' : formatTierName(summary.sub_tier);
    const price = meta.price_cents === 0 ? 'Free' : formatAud(meta.price_cents);

    return (
        <div className={cn('relative isolate rounded-2xl p-px', className)}>
            {/* Gold gradient border frame — same treatment as the home tier cards */}
            <div aria-hidden className='bg-frame-gold absolute inset-0 -z-10 rounded-2xl' />
            <div className='bg-card-gold shadow-card-warm relative isolate h-full overflow-hidden rounded-[calc(1rem-1px)] p-5 md:p-6'>
                <div
                    aria-hidden
                    className='bg-slr-gold-metal/10 pointer-events-none absolute -top-16 -right-16 -z-10 size-48 rounded-full blur-3xl'
                />
                <div className='flex items-start justify-between gap-2'>
                    <p className='text-slr-gold-label text-xs font-semibold tracking-widest uppercase'>Membership</p>
                    <TierBadge subTier={summary.sub_tier} size='sm' />
                </div>

                <div className='mt-3 flex items-center gap-3 sm:gap-4'>
                    {/* Member-card artwork — same asset as the public tier hero cards */}
                    {visual.cardArt && (
                        <Image
                            src={visual.cardArt}
                            alt=''
                            width={220}
                            height={180}
                            className='w-20 shrink-0 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)] md:w-24'
                        />
                    )}
                    <div>
                        <h3 className='font-bebas-neue text-2xl tracking-wide text-white uppercase md:text-3xl'>
                            {tierName}
                        </h3>
                        <p className='text-slr-muted mt-1 text-sm'>
                            <span className='text-gradient-gold font-bebas-neue text-[32px] leading-none'>{price}</span>
                            {meta.price_cents > 0 && <span className='ml-1.5'>/ 28-day cycle</span>}
                        </p>
                    </div>
                </div>
                <div aria-hidden className='mt-4 h-0.5 w-10 bg-[#997314]' />

                <div className='mt-2 divide-y divide-white/5'>
                    {!isVisitor && (
                        <>
                            <Row icon={<CreditCard className='size-4' />} label='Billing'>
                                {billing ? (
                                    <span className={cn('inline-flex items-center gap-1.5', billing.text)}>
                                        <span className={cn('size-1.5 rounded-full', billing.dot)} />
                                        {billing.label}
                                    </span>
                                ) : (
                                    <span className='text-slr-dim inline-flex items-center gap-1.5'>
                                        <span className='bg-slr-dim size-1.5 rounded-full' />
                                        Unavailable
                                    </span>
                                )}
                            </Row>
                            <Row
                                icon={<CalendarClock className='size-4' />}
                                label={isCancelled ? 'Access ends' : 'Next payment'}
                            >
                                {formatShortDate(summary.next_payment_date)}
                            </Row>
                        </>
                    )}
                    {/* Entries per draw = tokens (PRD: "token = entri/tiket per giveaway").
                    Per-draw, NOT token × draw_pass — that would leak the internal-only
                    draw_pass and mismatch the Current Draw card's entry count. */}
                    <Row icon={<Ticket className='size-4' />} label='Entries per draw'>
                        <span className='tabular-nums'>{meta.tokens}</span>
                    </Row>
                    {summary.beny_addon !== null && (
                        <Row icon={<Sparkles className='size-4' />} label='BENY add-on'>
                            {summary.beny_addon ? (
                                <span className='text-slr-gold-label'>Active</span>
                            ) : (
                                <span className='text-slr-dim'>Not added</span>
                            )}
                        </Row>
                    )}
                </div>
            </div>
        </div>
    );
}
