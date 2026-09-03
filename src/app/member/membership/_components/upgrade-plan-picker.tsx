'use client';

import { useState, useTransition } from 'react';

import Image from 'next/image';

import { SafeHoursNotice } from '@/components/common/safe-hours-notice';
import { SUB_TIERS, TIER_VISUALS } from '@/constant/tiers';
import { useSafeHours } from '@/hooks/use-safe-hours';
import { formatAud } from '@/lib/member';
import { goldButtonStyle } from '@/lib/styles';
import { type TierPricing } from '@/lib/tier-pricing';
import type { SubTierCode, TierGroup } from '@/types/member';

import { startSubTierCheckout } from '../actions';
import { AlertCircle, ArrowRight, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

type PaidGroup = Exclude<TierGroup, 'visitor'>;

const GROUPS: { group: PaidGroup; blurb: string; codes: SubTierCode[] }[] = [
    {
        group: 'red',
        blurb: 'Partner discounts, RED draw pool and the full e-book library.',
        codes: ['R1', 'R4', 'R7']
    },
    {
        group: 'blue',
        blurb: 'Everything in RED, plus the higher-value BLUE draw pool.',
        codes: ['B1', 'B4', 'B7', 'B10']
    }
];

export function UpgradePlanPicker({ pricing }: { pricing: TierPricing }) {
    const [selected, setSelected] = useState<SubTierCode>('R4');
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const safeHoursLocked = useSafeHours();

    const selectedPrice = pricing[selected].priceCents;

    const checkout = () => {
        setError(null);
        startTransition(async () => {
            const res = await startSubTierCheckout(selected);
            if (res.ok) {
                window.open(res.url, '_blank', 'noopener,noreferrer');
            } else {
                setError(res.message);
                toast.error(res.message);
            }
        });
    };

    return (
        <div className='mt-4 space-y-5'>
            <p className='text-slr-muted text-sm'>
                Pick a plan to unlock member draws, partner discounts and e-books. You’ll be taken to Stripe’s secure
                checkout — no charge until you confirm.
            </p>

            {GROUPS.map(({ group, blurb, codes }) => {
                const visual = TIER_VISUALS[group];

                return (
                    <fieldset key={group} disabled={pending} className='disabled:opacity-60'>
                        <legend className='sr-only'>SLR {visual.label} plans</legend>
                        <div className='mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                            <span className={`text-xs font-semibold tracking-widest uppercase ${visual.textClass}`}>
                                SLR {visual.label}
                            </span>
                            <span className='text-slr-dim text-xs'>{blurb}</span>
                        </div>

                        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                            {codes.map((code) => {
                                const meta = SUB_TIERS[code];
                                const isActive = code === selected;

                                return (
                                    <button
                                        key={code}
                                        type='button'
                                        onClick={() => setSelected(code)}
                                        aria-pressed={isActive}
                                        className={`flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-colors ${
                                            isActive
                                                ? 'ring-1 ring-[#FFD147]'
                                                : 'border-slr-navy-border bg-white/2 hover:bg-white/5'
                                        }`}
                                        style={
                                            isActive
                                                ? { background: visual.badgeBg, borderColor: visual.badgeBorder }
                                                : undefined
                                        }>
                                        <span className='flex w-full items-center justify-between gap-2'>
                                            <span className='text-sm font-semibold text-white'>
                                                {meta.marketingName}
                                            </span>
                                            {meta.badgeIcon && (
                                                <Image
                                                    src={meta.badgeIcon}
                                                    alt=''
                                                    width={56}
                                                    height={56}
                                                    className='size-8 shrink-0 object-contain'
                                                />
                                            )}
                                        </span>
                                        <span className='font-bebas-neue text-2xl leading-none tracking-wide text-white'>
                                            {formatAud(pricing[code].priceCents)}
                                        </span>
                                        <span className='text-slr-dim text-[10px] tracking-widest uppercase'>
                                            {meta.tokens} {meta.tokens === 1 ? 'token' : 'tokens'} / cycle
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                );
            })}

            {safeHoursLocked ? <SafeHoursNotice /> : null}

            {error ? (
                <div
                    role='alert'
                    className='flex items-start gap-2 rounded-xl border border-[#C8152E66] bg-[#2A0810] p-3'>
                    <AlertCircle className='mt-0.5 size-4 shrink-0 text-[#E88888]' />
                    <div>
                        <p className='text-sm font-semibold text-white'>Checkout couldn’t start</p>
                        <p className='text-slr-muted mt-0.5 text-xs leading-relaxed'>{error}</p>
                    </div>
                </div>
            ) : null}

            <button
                type='button'
                onClick={checkout}
                disabled={pending || safeHoursLocked}
                style={goldButtonStyle}
                className='flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase transition-opacity hover:opacity-90 disabled:opacity-60'>
                {pending ? (
                    <>
                        <Loader2Icon className='size-4 animate-spin' /> Opening checkout…
                    </>
                ) : (
                    <>
                        {error ? 'Try again' : 'Continue'} — {formatAud(selectedPrice)} / 28 days
                        <ArrowRight className='size-4' />
                    </>
                )}
            </button>
        </div>
    );
}
