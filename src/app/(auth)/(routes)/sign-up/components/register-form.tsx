'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { register } from '@/lib/api/resources/auth';
import { ApiError, apiErrorCode, apiErrorMessage } from '@/lib/api/types';
import { type TierPricing, isSpinEligible, spinDiscountOf } from '@/lib/tier-pricing';
import { cn } from '@/lib/utils';

import StepAccount from './step-account';
import StepCheckout from './step-checkout';
import StepOtp from './step-otp';
import StepSpinWheel from './step-spin-wheel';
import StepSuccess from './step-success';
import StepTier from './step-tier';
import Stepper from './stepper';
import { SignUpFormData, SpinPrize } from './types';
import { Loader2Icon } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

const glassStyle: React.CSSProperties = {
    background: 'linear-gradient(117.58deg, rgba(215, 237, 237, 0.16) -47.79%, rgba(204, 235, 235, 0) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(50px)',
    WebkitBackdropFilter: 'blur(50px)'
};

const initialData: SignUpFormData = {
    name: '',
    email: '',
    password: '',
    state: 'VIC',
    phone: '',
    dob: '',
    agreedToTerms: false,
    tier: null,
    sub_tier: null
};

type Step = 'account' | 'tier' | 'spin' | 'otp' | 'checkout' | 'success';

const STEP_LABELS = ['Account', 'Tier', 'Confirm', 'Done'];

const stepIndexForLabel = (step: Step): number => {
    switch (step) {
        case 'account':
            return 0;
        case 'tier':
            return 1;
        case 'spin':
        case 'otp':
        case 'checkout':
            return 2;
        case 'success':
            return 3;
    }
};

type RegisterFormProps = React.ComponentProps<'div'> & { pricing: TierPricing };

export function RegisterForm({ pricing, className, ...props }: RegisterFormProps) {
    const router = useRouter();
    const [data, setData] = useState<SignUpFormData>(initialData);
    const [spinPrize, setSpinPrize] = useState<SpinPrize | null>(null);
    const [step, setStep] = useState<Step>('account');

    const [userId, setUserId] = useState<string | null>(null);
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
    const [registering, setRegistering] = useState(false);

    const [checkoutToken, setCheckoutToken] = useState<string | null>(null);

    const patchData = (patch: Partial<SignUpFormData>) => {
        setData((d) => ({ ...d, ...patch }));
    };

    const createAccount = async (patch: Partial<SignUpFormData>) => {
        const tier = patch.tier ?? data.tier;
        const subTier = patch.sub_tier ?? data.sub_tier;

        const goPay = (spinAvailable: boolean) =>
            setStep(spinAvailable && isSpinEligible(pricing, subTier) ? 'spin' : 'checkout');

        if (!tier || !subTier) {
            setStep('tier');

            return;
        }

        if (userId && registeredEmail === data.email) {
            goPay(true);

            return;
        }
        setRegistering(true);
        try {
            const res = await register({
                full_name: data.name,
                email: data.email,
                password: data.password,
                state: data.state as Exclude<SignUpFormData['state'], ''>,
                phone: data.phone,
                dob: data.dob,
                tier,
                sub_tier: subTier.toLowerCase()
            });
            setUserId(res.user_id);
            setRegisteredEmail(data.email);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('slr_registered_email', data.email);
            }
            if (res.requires_otp) {
                setStep('otp');

                return;
            }
            setCheckoutToken(res.access_token ?? null);
            goPay(res.spin_available);
        } catch (err) {
            if (err instanceof ApiError && apiErrorCode(err) === 'ACCOUNT_PENDING_PAYMENT') {
                toast.info(apiErrorMessage(err));
                router.push(`/sign-in?email=${encodeURIComponent(data.email)}`);

                return;
            }
            toast.error(err instanceof ApiError ? apiErrorMessage(err) : 'Registration failed. Please try again.');

            setStep('account');
        } finally {
            setRegistering(false);
        }
    };

    const goNextFromTier = (patch: Partial<SignUpFormData>) => {
        patchData(patch);
        createAccount(patch);
    };

    const goSpinDone = (prize: SpinPrize) => {
        setSpinPrize(prize);
        setStep('checkout');
    };

    const renderStep = () => {
        if (registering) {
            return (
                <div className='flex flex-col items-center gap-4 py-16 text-center'>
                    <Loader2Icon className='h-8 w-8 animate-spin text-[#FFDC75]' />
                    <p className='text-slr-muted text-sm'>Creating your account…</p>
                </div>
            );
        }
        switch (step) {
            case 'account':
                return (
                    <StepAccount
                        data={data}
                        onNext={(patch) => {
                            patchData(patch);
                            setStep('tier');
                        }}
                    />
                );
            case 'tier':
                return (
                    <StepTier data={data} pricing={pricing} onNext={goNextFromTier} onBack={() => setStep('account')} />
                );
            case 'spin':
                return (
                    <StepSpinWheel
                        winDiscount={data.sub_tier ? spinDiscountOf(pricing, data.sub_tier) : 0}
                        token={checkoutToken}
                        onNext={goSpinDone}
                        onBack={() => setStep('tier')}
                    />
                );
            case 'otp':
                return (
                    <StepOtp
                        email={data.email}
                        userId={userId ?? ''}
                        onNext={() => setStep('success')}
                        onBack={() => setStep('tier')}
                    />
                );
            case 'checkout':
                return (
                    <StepCheckout
                        data={data}
                        pricing={pricing}
                        spinPrize={spinPrize}
                        token={checkoutToken}
                        onBack={() => setStep(isSpinEligible(pricing, data.sub_tier) ? 'spin' : 'tier')}
                    />
                );
            case 'success':
                return <StepSuccess data={data} pricing={pricing} spinPrize={spinPrize} />;
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <div style={glassStyle} className='rounded-2xl p-6 text-white shadow-2xl md:p-8'>
                <div className='mb-6'>
                    <Stepper steps={STEP_LABELS} current={stepIndexForLabel(step)} />
                </div>
                {renderStep()}
            </div>
        </div>
    );
}
