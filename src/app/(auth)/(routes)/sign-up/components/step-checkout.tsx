'use client';

import { useState } from 'react';

import { SafeHoursNotice } from '@/components/common/safe-hours-notice';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useSafeHours } from '@/hooks/use-safe-hours';
import { createMembershipCheckout } from '@/lib/api/resources/stripe';
import { ApiError, apiErrorMessage } from '@/lib/api/types';
import { AU_PHONE_MESSAGE, isAuPhone, toAuE164 } from '@/lib/au-phone';
import { SAFE_HOURS_MESSAGE, isSafeHoursError } from '@/lib/safe-hours';
import { goldButtonStyle, inputClassName } from '@/lib/styles';
import { type TierPricing, dollarsOf } from '@/lib/tier-pricing';

import { BENY_PRICE, SignUpFormData, SpinPrize, subTierLabel } from './types';
import { isBenyEligibleSubTier } from '@/constant/tiers';
import { ArrowLeft, CreditCard, Loader2Icon, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

type StepCheckoutProps = {
    data: SignUpFormData;
    pricing: TierPricing;
    spinPrize: SpinPrize | null;

    token: string | null;
    onBack: () => void;
};

const StepCheckout = ({ data, pricing, spinPrize, token, onBack }: StepCheckoutProps) => {
    const [redirecting, setRedirecting] = useState(false);
    const [addBeny, setAddBeny] = useState(false);
    const [benyPhone, setBenyPhone] = useState(data.phone);
    const [benyPhoneError, setBenyPhoneError] = useState<string | null>(null);
    const safeHoursLocked = useSafeHours();

    const tier = data.tier;
    const subTier = data.sub_tier;
    if (!tier || !subTier) {
        return null;
    }

    const subtotal = dollarsOf(pricing, subTier);
    const discount = Math.min(spinPrize?.discountAmount ?? 0, subtotal);
    const canAddBeny = isBenyEligibleSubTier(subTier);
    const willAddBeny = canAddBeny && addBeny;
    // BENY is billed on its own Stripe subscription, so it never appears on the membership checkout.
    const total = subtotal - discount;

    const handleCheckout = async () => {
        if (!token) {
            toast.error('Your sign-up session expired. Please start again.');

            return;
        }
        if (willAddBeny && !isAuPhone(benyPhone)) {
            setBenyPhoneError(AU_PHONE_MESSAGE);

            return;
        }
        setBenyPhoneError(null);
        setRedirecting(true);
        try {
            if (willAddBeny) {
                const { subscribeBeny } = await import('@/lib/api/resources/beny');
                await subscribeBeny(token, {
                    name: data.name,
                    email: data.email,
                    phone: toAuE164(benyPhone)
                });
            }

            const { url } = await createMembershipCheckout(token, {
                sub_tier: subTier.toLowerCase(),
                beny: willAddBeny
            });
            if (process.env.NODE_ENV === 'development') {
                console.log('[SignUp Checkout Created]', {
                    endpoint: 'POST /api/v1/membership/checkout',
                    payload: { sub_tier: subTier.toLowerCase(), beny: willAddBeny },
                    url
                });
            }
            window.location.href = url;
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('[SignUp Checkout Error]', {
                    endpoint: 'POST /api/v1/membership/checkout',
                    payload: { sub_tier: subTier.toLowerCase() },
                    error:
                        err instanceof ApiError
                            ? { status: err.status, message: err.message, payload: err.payload }
                            : String(err)
                });
            }

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

                    {willAddBeny ? (
                        <>
                            <div className='h-px w-full bg-white/10' />
                            <SummaryRow
                                label='BENY Add-on'
                                sub='Partner savings platform — billed separately'
                                value={`$${BENY_PRICE.toFixed(2)}`}
                            />
                        </>
                    ) : null}

                    <div className='h-px w-full bg-white/10' />

                    <SummaryRow label='Subtotal' value={`$${subtotal.toFixed(2)}`} muted />
                    {discount > 0 && (
                        <SummaryRow
                            label='Spin Wheel discount'
                            sub={`${spinPrize?.label}, first billing cycle only`}
                            value={`−$${discount.toFixed(2)}`}
                            highlight
                        />
                    )}

                    <div className='h-px w-full bg-white/10' />

                    <div className='flex items-baseline justify-between'>
                        <div>
                            <p className='font-bebas-neue text-xl tracking-wider text-white uppercase'>Due today</p>
                            <p className='text-slr-muted text-xs'>
                                Then ${subtotal.toFixed(2)} every 4 weeks from your next billing date.
                            </p>
                        </div>
                        <p className='font-bebas-neue text-3xl font-extrabold text-[#FFDC75]'>${total.toFixed(2)}</p>
                    </div>

                    {willAddBeny ? (
                        <p className='rounded-lg border border-[#D4AF3759] bg-[#D4AF371A]/10 p-3 text-xs leading-relaxed font-bold text-[#FFDC75]'>
                            BENY is not on the Stripe page above. You&apos;ll be charged ${BENY_PRICE.toFixed(2)}/month
                            for BENY separately, once an SLR Admin activates it within 1 business day.
                        </p>
                    ) : null}
                </div>
            </div>

            {canAddBeny ? (
                <div className='flex items-start gap-3 rounded-xl border border-[#D4AF3759] bg-[#D4AF371A]/5 p-4 transition-all hover:bg-[#D4AF371A]/10'>
                    <Checkbox
                        id='beny'
                        checked={addBeny}
                        onCheckedChange={(checked) => setAddBeny(Boolean(checked))}
                        className='mt-1 border-[#FFD147] data-[state=checked]:bg-[#FFD147] data-[state=checked]:text-[#131619]'
                    />
                    <div className='grid gap-1.5 leading-none'>
                        <label
                            htmlFor='beny'
                            className='cursor-pointer text-sm font-bold tracking-wide text-white uppercase select-none'>
                            Add BENY Add-on — +${BENY_PRICE.toFixed(2)}/month
                        </label>
                        <p className='text-slr-muted text-xs leading-relaxed'>
                            Access premium brand discounts through the BENY app. Billed directly to your card on Stripe (+$
                            {BENY_PRICE.toFixed(2)}/mo). Access requires manual activation and confirmation by an SLR Admin
                            after registration.
                        </p>

                        {addBeny ? (
                            <div className='mt-2'>
                                <label htmlFor='beny-phone' className='text-slr-muted text-xs font-semibold'>
                                    Phone number for BENY activation
                                </label>
                                <Input
                                    id='beny-phone'
                                    type='tel'
                                    className={`${inputClassName} mt-1.5`}
                                    placeholder='0412 345 678'
                                    aria-invalid={benyPhoneError ? true : undefined}
                                    value={benyPhone}
                                    onChange={(e) => {
                                        setBenyPhone(e.target.value);
                                        if (benyPhoneError) setBenyPhoneError(null);
                                    }}
                                />
                                {benyPhoneError ? (
                                    <p className='mt-1 text-xs text-red-400'>{benyPhoneError}</p>
                                ) : (
                                    <p className='text-slr-dim mt-1 text-xs'>
                                        This is the number our admin uses to invite you on BENY. Change it if BENY should
                                        reach you on a different number.
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

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
