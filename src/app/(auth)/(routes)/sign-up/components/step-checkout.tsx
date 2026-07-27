'use client';

import { useState } from 'react';

import { SafeHoursNotice } from '@/components/common/safe-hours-notice';
import { Button } from '@/components/ui/button';
import { AU_STATES } from '@/constant/au-states';
import { useSafeHours } from '@/hooks/use-safe-hours';
import { createMembershipCheckout } from '@/lib/api/resources/stripe';
import { ApiError, apiErrorMessage } from '@/lib/api/types';
import { SAFE_HOURS_MESSAGE, isSafeHoursError } from '@/lib/safe-hours';
import { goldButtonStyle } from '@/lib/styles';

import { BENY_PRICE, SignUpFormData, SpinPrize, subTierLabel, subTierPrice } from './types';
import { ArrowLeft, CreditCard, Loader2Icon, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

type StepCheckoutProps = {
    data: SignUpFormData;
    spinPrize: SpinPrize | null;
    /** Session token from register — paid tiers get one without an OTP. */
    token: string | null;
    onBack: () => void;
};

const StepCheckout = ({ data, spinPrize, token, onBack }: StepCheckoutProps) => {
    const [redirecting, setRedirecting] = useState(false);
    const safeHoursLocked = useSafeHours();

    const tier = data.tier;
    const subTier = data.sub_tier;
    if (!tier || tier === 'visitor' || !subTier) {
        return null;
    }

    // BENY is deliberately absent from this total: POST /membership/checkout takes
    // only a sub-tier, so a $4 line here would be shown but never charged.
    const subtotal = subTierPrice(subTier);
    const discount = Math.min(spinPrize?.discountAmount ?? 0, subtotal);
    const total = subtotal - discount;

    const stateLabel = AU_STATES.find((s) => s.code === data.state)?.label ?? data.state;

    // Hosted Stripe: we only redirect. The webhook activates the membership and
    // Stripe returns the member to /payment/success, so there is no local
    // "success" step on the paid path.
    const handleCheckout = async () => {
        if (!token) {
            toast.error('Your sign-up session expired. Please start again.');

            return;
        }
        setRedirecting(true);
        try {
            const { url } = await createMembershipCheckout(token, { sub_tier: subTier.toLowerCase() });
            window.location.href = url;
        } catch (err) {
            // The window can open between render and submit, so the server's 403 is
            // what actually decides — translate it instead of showing the raw message.
            if (isSafeHoursError(err)) toast.error(SAFE_HOURS_MESSAGE);
            else
                toast.error(
                    err instanceof ApiError ? apiErrorMessage(err) : 'Could not open checkout. Please try again.'
                );
            setRedirecting(false);
        }
    };

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                    Review your order
                </h2>
                <p className='text-slr-muted mt-1 text-sm'>
                    You&apos;ll be redirected to Stripe to enter your card details. No charge until you confirm there.
                </p>
            </div>

            <div className='rounded-2xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)] p-6 shadow-[0px_0px_20px_0px_#776D6D26] md:p-8'>
                <div className='space-y-4'>
                    <SummaryRow
                        label={subTierLabel(subTier)}
                        sub='Monthly subscription'
                        value={`$${subtotal.toFixed(2)}`}
                    />

                    <div className='h-px w-full bg-white/10' />

                    <SummaryRow label='Subtotal' value={`$${subtotal.toFixed(2)}`} muted />
                    {discount > 0 && (
                        <SummaryRow
                            label='Spin Wheel discount'
                            sub={`${spinPrize?.label}, first month only`}
                            value={`−$${discount.toFixed(2)}`}
                            highlight
                        />
                    )}

                    <div className='h-px w-full bg-white/10' />

                    <div className='flex items-baseline justify-between'>
                        <div>
                            <p className='font-bebas-neue text-xl tracking-wider text-white uppercase'>Due today</p>
                            <p className='text-slr-muted text-xs'>
                                Then ${subtotal.toFixed(2)}/month from your next billing date.
                            </p>
                        </div>
                        <p className='font-bebas-neue text-3xl font-extrabold text-[#FFDC75]'>${total.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className='rounded-xl border border-white/10 bg-white/2 p-4'>
                <p className='text-slr-dim text-[10px] font-semibold tracking-widest uppercase'>Draw pool assignment</p>
                <p className='mt-1 text-sm text-white'>
                    SLR {tier === 'red' ? 'Red' : 'Blue'} {data.state} — {stateLabel}
                </p>
                <p className='text-slr-muted mt-1 text-xs'>
                    Your entries will be allocated to this pool after your first successful payment.
                </p>
            </div>

            <div className='rounded-xl border border-white/10 bg-white/2 p-4'>
                <p className='text-slr-dim text-[10px] font-semibold tracking-widest uppercase'>Optional add-on</p>
                <p className='mt-1 text-sm text-white'>BENY — ${BENY_PRICE.toFixed(2)}/month</p>
                <p className='text-slr-muted mt-1 text-xs'>
                    Premium third-party discount platform. Add it any time from your dashboard once your membership is
                    active — it&apos;s billed separately, so it isn&apos;t part of today&apos;s payment.
                </p>
            </div>

            {safeHoursLocked ? <SafeHoursNotice /> : null}

            <div className='flex flex-wrap gap-3'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onBack}
                    disabled={redirecting}
                    className='h-11 min-w-max flex-1 rounded-xl border border-white/10 bg-white/5 px-6 font-semibold text-white hover:bg-white/10 hover:text-white sm:flex-none'>
                    <ArrowLeft className='h-4 w-4' />
                    Back
                </Button>
                <Button
                    type='button'
                    onClick={handleCheckout}
                    disabled={redirecting || safeHoursLocked}
                    style={goldButtonStyle}
                    className='h-11 min-w-max flex-1 rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90 disabled:opacity-70'>
                    {redirecting ? (
                        <>
                            <Loader2Icon className='animate-spin' /> Redirecting to Stripe…
                        </>
                    ) : (
                        <>
                            <CreditCard className='h-4 w-4' />
                            Continue to Stripe
                        </>
                    )}
                </Button>
            </div>

            <p className='text-slr-dim flex items-center justify-center gap-1.5 text-center text-xs'>
                <ShieldCheck className='h-3.5 w-3.5' />
                Payment processed securely by Stripe. We never store your card details.
            </p>
        </div>
    );
};

type SummaryRowProps = {
    label: string;
    sub?: string;
    value: string;
    muted?: boolean;
    highlight?: boolean;
};

const SummaryRow = ({ label, sub, value, muted, highlight }: SummaryRowProps) => (
    <div className='flex items-baseline justify-between gap-3'>
        <div>
            <p className={muted ? 'text-slr-muted text-sm' : 'text-sm font-medium text-white'}>{label}</p>
            {sub && <p className='text-slr-dim text-xs'>{sub}</p>}
        </div>
        <p
            className={
                highlight
                    ? 'text-sm font-bold text-[#FFDC75]'
                    : muted
                      ? 'text-slr-muted text-sm'
                      : 'text-sm font-semibold text-white'
            }>
            {value}
        </p>
    </div>
);

export default StepCheckout;
