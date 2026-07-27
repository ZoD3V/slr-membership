'use client';

import { useState } from 'react';

import { SafeHoursNotice } from '@/components/common/safe-hours-notice';
import { Button } from '@/components/ui/button';
import { SUB_TIERS } from '@/constant/tiers';
import { useSafeHours } from '@/hooks/use-safe-hours';
import { goldButtonStyle } from '@/lib/styles';
import type { SubTierCode } from '@/types/member';

import { startMembershipCheckout } from '../actions';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

/** Paid sub-tiers only — Visitor is free and never reaches checkout. */
const PAID_CODES: SubTierCode[] = ['R1', 'R4', 'R7', 'B1', 'B4', 'B7', 'B10'];

const priceLabel = (code: SubTierCode) => `$${(SUB_TIERS[code].price_cents / 100).toFixed(0)}`;

const planLabel = (code: SubTierCode) => {
    const meta = SUB_TIERS[code];

    return `SLR ${meta.group === 'red' ? 'RED' : 'BLUE'} · ${meta.marketingName}`;
};

type CompletePaymentClientProps = {
    /** Live sub-tier from memberships/me — the session copy goes stale after a change. */
    subTier: SubTierCode;
    ctaLabel?: string;
    /** Off on the expired-link screen, which only offers a fresh checkout. */
    showChangePlan?: boolean;
};

const CompletePaymentClient = ({
    subTier,
    ctaLabel = 'Complete payment',
    showChangePlan = true
}: CompletePaymentClientProps) => {
    const [busy, setBusy] = useState<string | null>(null);
    const [picking, setPicking] = useState(false);
    // Finishing a pending payment is a sign-up action, so it sits behind the same
    // Friday lockout as a fresh checkout.
    const safeHoursLocked = useSafeHours();

    const go = async (code: SubTierCode) => {
        setBusy(code);
        const res = await startMembershipCheckout(code);
        if (!res.ok) {
            toast.error(res.message);
            setBusy(null);

            return;
        }
        window.location.href = res.url;
    };

    if (picking) {
        return (
            <div className='flex flex-col gap-3'>
                {safeHoursLocked ? <SafeHoursNotice /> : null}
                <p className='text-slr-dim text-[10px] font-semibold tracking-widest uppercase'>Pick a plan</p>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    {PAID_CODES.map((code) => (
                        <button
                            key={code}
                            type='button'
                            disabled={busy !== null || safeHoursLocked}
                            onClick={() => go(code)}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-60 ${
                                code === subTier
                                    ? 'border-[#FFD147] bg-[#FFD1471A]'
                                    : 'border-slr-navy-border bg-white/2 hover:bg-white/5'
                            }`}>
                            <span className='text-sm font-medium text-white'>{planLabel(code)}</span>
                            <span className='text-sm font-semibold text-[#FFDC75]'>
                                {busy === code ? (
                                    <Loader2Icon className='h-4 w-4 animate-spin' />
                                ) : (
                                    `${priceLabel(code)} / 28 days`
                                )}
                            </span>
                        </button>
                    ))}
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
