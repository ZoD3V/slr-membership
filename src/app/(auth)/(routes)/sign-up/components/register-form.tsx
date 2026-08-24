'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { register } from '@/lib/api/resources/auth';
import { ApiError, apiErrorCode, apiErrorMessage } from '@/lib/api/types';
import { cn } from '@/lib/utils';

import StepAccount from './step-account';
import StepCheckout from './step-checkout';
import StepOtp from './step-otp';
import StepSpinWheel from './step-spin-wheel';
import StepSuccess from './step-success';
import StepTier from './step-tier';
import Stepper from './stepper';
import { SignUpFormData, SpinPrize, isSpinEligible, spinDiscountFor } from './types';
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

export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
    const router = useRouter();
    const [data, setData] = useState<SignUpFormData>(initialData);
    const [spinPrize, setSpinPrize] = useState<SpinPrize | null>(null);
    const [step, setStep] = useState<Step>('account');
    // The created account: Visitor verifies its OTP next, paid goes to Stripe.
    const [userId, setUserId] = useState<string | null>(null);
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
    const [registering, setRegistering] = useState(false);
    // Session token returned by register on paid tiers — needed by Stripe Checkout.
    const [checkoutToken, setCheckoutToken] = useState<string | null>(null);

    const patchData = (patch: Partial<SignUpFormData>) => {
        setData((d) => ({ ...d, ...patch }));
    };

    // Create the account, then route by what the API says is still owed: Visitor
    // gets an OTP email, paid gets a session token and goes to Stripe (the
    // payment itself verifies them). Skip re-registering if we already created
    // this exact email (Back → forward must not 409 on a duplicate).
    const createAccount = async (patch: Partial<SignUpFormData>) => {
        const tier = patch.tier ?? data.tier;
        const subTier = patch.sub_tier ?? data.sub_tier;
        // Spin only for token-upgrade sub-tiers (R4/R7/B4/B7/B10), and only if
        // the API still offers it.
        const goPay = (spinAvailable: boolean) =>
            setStep(spinAvailable && isSpinEligible(subTier) ? 'spin' : 'checkout');

        if (userId && registeredEmail === data.email) {
            if (tier === 'visitor') setStep('otp');
            else goPay(true);

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
                tier: tier ?? 'visitor',
                sub_tier: tier === 'visitor' ? undefined : subTier?.toLowerCase()
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
            // Auto log in via NextAuth so the session is active before they go to Stripe
            try {
                await signIn('credentials', {
                    email: data.email,
                    password: data.password,
                    redirect: false
                });
            } catch (signInErr) {
                console.error('Auto sign-in failed:', signInErr);
            }
            setCheckoutToken(res.access_token ?? null);
            goPay(res.spin_available);
        } catch (err) {
            // Signed up before but never paid: the account is fine, so don't dead-end
            // them on a duplicate error — send them to sign in and finish paying.
            if (err instanceof ApiError && apiErrorCode(err) === 'ACCOUNT_PENDING_PAYMENT') {
                toast.info(apiErrorMessage(err));
                router.push(`/sign-in?email=${encodeURIComponent(data.email)}`);

                return;
            }
            toast.error(err instanceof ApiError ? apiErrorMessage(err) : 'Registration failed. Please try again.');
            // Send them back to the account step to fix the email/phone.
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
                return <StepTier data={data} onNext={goNextFromTier} onBack={() => setStep('account')} />;
            case 'spin':
                return (
                    <StepSpinWheel
                        winDiscount={spinDiscountFor(data.sub_tier)}
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
                        onNext={async () => {
                            try {
                                await signIn('credentials', {
                                    email: data.email,
                                    password: data.password,
                                    redirect: false
                                });
                            } catch (signInErr) {
                                console.error('Auto sign-in failed after OTP verification:', signInErr);
                            }
                            setStep('success');
                        }}
                        onBack={() => setStep('tier')}
                    />
                );
            case 'checkout':
                return (
                    <StepCheckout
                        data={data}
                        spinPrize={spinPrize}
                        token={checkoutToken}
                        onBack={() => setStep(isSpinEligible(data.sub_tier) ? 'spin' : 'tier')}
                    />
                );
            case 'success':
                return <StepSuccess data={data} spinPrize={spinPrize} />;
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
