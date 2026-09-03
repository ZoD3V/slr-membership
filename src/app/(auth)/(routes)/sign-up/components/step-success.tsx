'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { AU_STATES } from '@/constant/au-states';
import { goldButtonStyle } from '@/lib/styles';
import { type TierPricing, dollarsOf } from '@/lib/tier-pricing';

import { SignUpFormData, SpinPrize, subTierLabel } from './types';
import { Check, Mail, PartyPopper } from 'lucide-react';

type StepSuccessProps = {
    data: SignUpFormData;
    pricing: TierPricing;
    spinPrize: SpinPrize | null;
};

const StepSuccess = ({ data, pricing, spinPrize }: StepSuccessProps) => {
    const tier = data.tier;
    const stateLabel = AU_STATES.find((s) => s.code === data.state)?.label ?? data.state;
    const planLabel = data.sub_tier ? subTierLabel(data.sub_tier) : '-';
    const planPrice = data.sub_tier ? dollarsOf(pricing, data.sub_tier) : 0;

    const benefits = [
        `Welcome email sent to ${data.email}`,
        `Payment confirmation + invoice on the way`,
        `Entries allocated to SLR ${tier === 'blue' ? 'Blue' : 'Red'} ${data.state}`,
        spinPrize && spinPrize.discountAmount > 0 ? `${spinPrize.label} applied to your first month` : null
    ].filter(Boolean);

    return (
        <div className='flex flex-col items-center gap-6 text-center'>
            <div
                className='inline-flex h-16 w-16 items-center justify-center rounded-full'
                style={{
                    background:
                        'linear-gradient(89.12deg, #F5D78E 3.07%, #D4AF37 41.36%, #FFE066 60.5%, #A07018 98.79%)'
                }}>
                <PartyPopper className='h-8 w-8 text-[#0C1132]' />
            </div>

            <div>
                <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                    You&apos;re in.
                </h2>
                <p className='text-slr-muted mt-2 text-sm md:text-base'>
                    Your {planLabel} membership is active. Your first cycle starts now.
                </p>
            </div>

            <div className='w-full rounded-2xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)] p-6 text-left shadow-[0px_0px_20px_0px_#776D6D26] md:p-8'>
                <div className='flex items-center gap-3 border-b border-white/10 pb-4'>
                    <Mail className='h-4 w-4 text-[#FFDC75]' />
                    <p className='text-xs font-semibold tracking-widest text-[#FFDC75] uppercase'>What happens next</p>
                </div>
                <ul className='mt-4 space-y-3'>
                    {benefits.map((b) => (
                        <li key={b} className='flex items-start gap-2.5'>
                            <span className='mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#FFDC75]'>
                                <Check className='h-3 w-3' />
                            </span>
                            <span className='text-sm text-white/90'>{b}</span>
                        </li>
                    ))}
                </ul>

                <div className='mt-6 rounded-xl border border-white/10 bg-white/2 p-4'>
                    <p className='text-slr-dim text-[10px] font-semibold tracking-widest uppercase'>Your details</p>
                    <dl className='mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2'>
                        <Detail label='Name' value={data.name} />
                        <Detail label='Email' value={data.email} />
                        <Detail label='State' value={`${data.state} · ${stateLabel}`} />
                        <Detail label='Plan' value={`${planLabel} · $${planPrice}/mo`} />
                    </dl>
                </div>
            </div>

            <Link href='/sign-in' className='w-full'>
                <Button
                    type='button'
                    style={goldButtonStyle}
                    className='h-12 w-full rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90'>
                    Sign in to your account
                </Button>
            </Link>
        </div>
    );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
    <div>
        <dt className='text-slr-dim text-[10px] tracking-widest uppercase'>{label}</dt>
        <dd className='mt-0.5 text-sm text-white'>{value}</dd>
    </div>
);

export default StepSuccess;
