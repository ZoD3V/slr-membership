'use client';

import { useCallback, useEffect, useState } from 'react';

import { type SpinOutcome, SpinWheel } from '@/components/common/spin-wheel';
import { Button } from '@/components/ui/button';
import { executeSpin, getSpinStatus } from '@/lib/api/resources/spin';
import { ApiError, apiErrorMessage } from '@/lib/api/types';
import { goldButtonStyle } from '@/lib/styles';

import { SpinPrize } from './types';
import { ArrowLeft, Loader2Icon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type StepSpinWheelProps = {
    winDiscount: number;

    token: string | null;
    onNext: (prize: SpinPrize) => void;
    onBack: () => void;
};

const StepSpinWheel = ({ winDiscount, token, onNext, onBack }: StepSpinWheelProps) => {
    const [offer, setOffer] = useState(winDiscount);
    const [result, setResult] = useState<SpinOutcome | null>(null);
    const [loadingCheck, setLoadingCheck] = useState(true);

    const skip = useCallback(() => onNext({ label: 'No prize', discountAmount: 0 }), [onNext]);

    useEffect(() => {
        if (!token) {
            setLoadingCheck(false);

            return;
        }
        let cancelled = false;

        const check = async () => {
            try {
                const status = await getSpinStatus(token);
                if (cancelled) return;
                if (!status.available) {
                    skip();

                    return;
                }
                if (status.discount_cents > 0) setOffer(status.discount_cents / 100);
            } catch {
                if (!cancelled) skip();
            } finally {
                if (!cancelled) {
                    setLoadingCheck(false);
                }
            }
        };
        void check();

        return () => {
            cancelled = true;
        };
    }, [token, skip]);

    if (loadingCheck) {
        return (
            <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
                <Loader2Icon className='h-8 w-8 animate-spin text-[#FFDC75]' />
                <p className='text-slr-muted text-sm'>Checking spin eligibility...</p>
            </div>
        );
    }

    const runSpin = async (): Promise<SpinOutcome | null> => {
        if (!token) return null;
        try {
            const spin = await executeSpin(token);
            const won = spin.result === 'win';
            const discount = won && spin.discount_cents > 0 ? spin.discount_cents / 100 : offer;

            return { won, discount: won ? discount : 0 };
        } catch (err) {
            toast.error(err instanceof ApiError ? apiErrorMessage(err) : 'Spin failed. Please try again.');

            return null;
        }
    };

    const settle = (outcome: SpinOutcome) => {
        if (outcome.won && outcome.discount > 0) setOffer(outcome.discount);
        setResult(outcome);
    };

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                    One free spin
                </h2>
                <p className='text-slr-muted mt-1 text-sm'>
                    Win up to ${winDiscount} off your first invoice. One spin per new paid member.
                </p>
            </div>

            <div className='flex flex-col items-center gap-8 rounded-2xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)] p-6 shadow-[0px_0px_20px_0px_#776D6D26] md:p-10'>
                <SpinWheel winDiscount={offer} onSpin={runSpin} onSettled={settle} disabled={!token} />

                {result ? (
                    <div
                        className={
                            result.won
                                ? 'rounded-xl border border-[#D4AF3759] bg-[#D4AF370D] px-6 py-4 text-center'
                                : 'rounded-xl border border-white/10 bg-white/2 px-6 py-4 text-center'
                        }>
                        {result.won ? (
                            <>
                                <Sparkles className='mx-auto h-6 w-6 text-[#FFDC75]' />
                                <p className='font-bebas-neue mt-2 text-2xl tracking-wider text-white uppercase'>
                                    You won ${result.discount} off!
                                </p>
                                <p className='text-slr-muted mt-1 text-xs'>
                                    Your discount will be applied at checkout.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className='font-bebas-neue text-xl tracking-wider text-white uppercase'>
                                    Better luck next cycle
                                </p>
                                <p className='text-slr-muted mt-1 text-xs'>
                                    You can spin again 24 hours before your next renewal.
                                </p>
                            </>
                        )}
                    </div>
                ) : null}
            </div>

            <div className='flex flex-wrap gap-3'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onBack}
                    className='h-11 min-w-max flex-1 rounded-xl border border-white/10 bg-white/5 px-6 font-semibold text-white hover:bg-white/10 hover:text-white sm:flex-none'>
                    <ArrowLeft className='h-4 w-4' />
                    Back
                </Button>
                <Button
                    type='button'
                    onClick={() =>
                        result &&
                        onNext({
                            label: result.won ? `$${result.discount} off` : 'No prize',
                            discountAmount: result.won ? result.discount : 0
                        })
                    }
                    disabled={!result}
                    style={goldButtonStyle}
                    className='h-11 min-w-max flex-1 rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90 disabled:opacity-70'>
                    Continue to checkout
                </Button>
            </div>
        </div>
    );
};

export default StepSpinWheel;
