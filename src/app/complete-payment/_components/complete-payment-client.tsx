'use client';

import { useState } from 'react';

import Image from 'next/image';

import { SafeHoursNotice } from '@/components/common/safe-hours-notice';
import { Button } from '@/components/ui/button';
import { SUB_TIERS } from '@/constant/tiers';
import { useSafeHours } from '@/hooks/use-safe-hours';
import { goldButtonStyle } from '@/lib/styles';
import { type TierPricing } from '@/lib/tier-pricing';
import type { SubTierCode } from '@/types/member';

import { startMembershipCheckout } from '../actions';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

const PAID_CODES: SubTierCode[] = ['R1', 'R4', 'R7', 'B1', 'B4', 'B7', 'B10'];

const priceLabel = (pricing: TierPricing, code: SubTierCode) => `$${(pricing[code].priceCents / 100).toFixed(0)}`;

const planLabel = (code: SubTierCode) => {
    const meta = SUB_TIERS[code];

    return `SLR ${meta.group === 'red' ? 'RED' : 'BLUE'} · ${meta.marketingName}`;
};

type CompletePaymentClientProps = {
    subTier: SubTierCode;
    pricing: TierPricing;
    ctaLabel?: string;

    showChangePlan?: boolean;
};

const CompletePaymentClient = ({
    subTier,
    pricing,
    ctaLabel = 'Complete payment',
    showChangePlan = true
}: CompletePaymentClientProps) => {
    const [busy, setBusy] = useState<string | null>(null);
    const [picking, setPicking] = useState(false);

    const safeHoursLocked = useSafeHours();

    const go = async (code: SubTierCode) => {
        setBusy(code);
        const res = await startMembershipCheckout(code);
        if (!res.ok) {
            if (process.env.NODE_ENV === 'development') {
                console.error('[Complete Payment Checkout Error]', {
                    endpoint: 'POST /api/v1/membership/checkout',
                    payload: { sub_tier: code },
                    error: res
                });
            }
            toast.error(res.message);
            setBusy(null);

            return;
        }
        window.open(res.url, '_blank', 'noopener,noreferrer');
        setBusy(null);
    };

    if (picking) {
        return (
            <div className='flex flex-col gap-3'>
                {safeHoursLocked ? <SafeHoursNotice /> : null}
                <p className='text-slr-dim text-[10px] font-semibold tracking-widest uppercase'>Pick a plan</p>
                <div className='grid grid-cols-1 gap-2'>
                    {PAID_CODES.map((code) => {
                        const meta = SUB_TIERS[code];

                        return (
                            <button
                                key={code}
                                type='button'
                                disabled={busy !== null || safeHoursLocked}
                                onClick={() => go(code)}
                                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-60 ${
                                    code === subTier
                                        ? 'border-[#FFD147] bg-[#FFD1471A]'
                                        : 'border-slr-navy-border bg-white/2 hover:bg-white/5'
                                }`}>
                                <span className='flex items-center gap-3'>
                                    {meta.badgeIcon && (
                                        <Image
                                            src={meta.badgeIcon}
                                            alt=''
                                            width={56}
                                            height={56}
                                            className='size-8 shrink-0 object-contain'
                                        />
                                    )}
                                    <span className='text-sm font-medium text-white'>{planLabel(code)}</span>
                                </span>
                                <span className='text-sm font-semibold whitespace-nowrap text-[#FFDC75]'>
                                    {busy === code ? (
                                        <Loader2Icon className='h-4 w-4 animate-spin' />
                                    ) : (
                                        `${priceLabel(pricing, code)} / 28 days`
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <Button
                    type='button'
                    variant='outline'
                    disabled={busy !== null}
                    onClick={() => setPicking(false)}
                    className='h-11 rounded-xl border border-white/10 bg-white/5 font-semibold text-white hover:bg-white/10 hover:text-white'>
                    Back
                </Button>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-3'>
            {safeHoursLocked ? <SafeHoursNotice /> : null}

            <div className='flex flex-wrap gap-3'>
                <Button
                    type='button'
                    onClick={() => go(subTier)}
                    disabled={busy !== null || safeHoursLocked}
                    style={goldButtonStyle}
                    className='h-11 min-w-max flex-1 rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90 disabled:opacity-70'>
                    {busy ? (
                        <>
                            <Loader2Icon className='h-4 w-4 animate-spin' /> Opening checkout…
                        </>
                    ) : (
                        ctaLabel
                    )}
                </Button>
                {showChangePlan ? (
                    <Button
                        type='button'
                        variant='outline'
                        disabled={busy !== null}
                        onClick={() => setPicking(true)}
                        className='h-11 min-w-max flex-1 rounded-xl border border-white/10 bg-white/5 px-6 font-semibold text-white hover:bg-white/10 hover:text-white sm:flex-none'>
                        Change plan
                    </Button>
                ) : null}
            </div>
        </div>
    );
};

export default CompletePaymentClient;
