'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { goldButtonStyle } from '@/lib/styles';
import { cn } from '@/lib/utils';
import type { SubTierCode } from '@/types/member';

import { BENY_PRICE, SignUpFormData, TierKey, subTierPrice, subTierTokens, subTiersForGroup } from './types';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

type TierOption = {
    key: TierKey;
    name: string;
    price: string;
    note: string;
    tagline: string;
    perks: string[];
    badge?: string;
    isPaid: boolean;
    icon: string | null;
    borderGradient?: string;
    innerBg?: string;
    cardBg?: string;
};

const tiers: TierOption[] = [
    {
        key: 'visitor',
        name: 'Visitor',
        price: 'FREE',
        note: 'No card needed',
        tagline: 'Try SLR with the weekly Visitor draw.',
        perks: ['Weekly $50 Visitor draw', 'Browse partner discounts', 'Browse e-book listings'],
        isPaid: false,
        icon: null,
        cardBg: 'border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)]'
    },
    {
        key: 'red',
        name: 'SLR Red',
        price: 'From $10',
        note: '/ month',
        tagline: 'The everyday rewards plan.',
        perks: ['Up to 7 weekly draws', '4–7 entries per cycle', 'Unlock all discount codes', 'Read all e-books'],
        badge: 'Most popular',
        isPaid: true,
        icon: null,
        borderGradient:
            'bg-[linear-gradient(180deg,#FF6B7A_10%,#C8152E_25%,#8B0010_75.24%,#C8152E_87.62%,#FF6B7A_100%)]',
        innerBg: 'bg-[linear-gradient(180deg,#530710_0%,#37040D_30%,#220408_60%,#470818_87.62%)]'
    },
    {
        key: 'blue',
        name: 'SLR Blue',
        price: 'From $26',
        note: '/ month',
        tagline: 'Maximum draws, member-only deals.',
        perks: ['Everything in Red', '10+ entries per cycle', 'Premium prize pool', 'Member-only deals'],
        isPaid: true,
        icon: null,
        borderGradient:
            'bg-[linear-gradient(180deg,#6AACFF_10%,#1A62C0_25%,#0A2E80_75.24%,#1A62C0_87.62%,#6AACFF_100%)]',
        innerBg: 'bg-[linear-gradient(180deg,#0F2F7A_0%,#0B205D_30%,#081640_60%,#0D2662_87.62%)]'
    }
];

type StepTierProps = {
    data: SignUpFormData;
    onNext: (patch: Partial<SignUpFormData>) => void;
    onBack: () => void;
};

const backBtn =
    'h-11 min-w-max flex-1 rounded-xl border border-white/10 bg-white/5 px-6 font-semibold text-white hover:bg-white/10 hover:text-white sm:flex-none';
const nextBtn = 'h-11 min-w-max flex-1 rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90';

const StepTier = ({ data, onNext, onBack }: StepTierProps) => {
    const [phase, setPhase] = useState<'group' | 'subtier'>('group');
    const [group, setGroup] = useState<TierKey | null>(data.tier);
    const [subCode, setSubCode] = useState<SubTierCode | null>(data.sub_tier);
    const [touched, setTouched] = useState(false);

    const handleGroupContinue = () => {
        if (!group) {
            setTouched(true);

            return;
        }
        if (group === 'visitor') {
            onNext({ tier: 'visitor', sub_tier: 'VISITOR' });

            return;
        }
        // Paid → sub-tier step. Default to Standard if none valid for this group.
        const subs = subTiersForGroup(group);
        if (!subCode || !subs.some((s) => s.code === subCode)) {
            setSubCode(subs[0].code);
        }
        setPhase('subtier');
    };

    // ── Sub-tier phase (RED / BLUE) ──────────────────────────────────────────
    if (phase === 'subtier' && (group === 'red' || group === 'blue')) {
        const subs = subTiersForGroup(group);
        const groupName = group === 'red' ? 'SLR Red' : 'SLR Blue';

        return (
            <div className='flex flex-col gap-6'>
                <div>
                    <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                        Choose your {groupName} plan
                    </h2>
                    <p className='text-slr-muted mt-1 text-sm'>
                        More tokens = more entries per draw. Token-upgrade plans get a spin at checkout.
                    </p>
                </div>

                <div className='space-y-3'>
                    {subs.map((opt) => {
                        const on = subCode === opt.code;
                        const tokens = subTierTokens(opt.code);

                        return (
                            <button
                                key={opt.code}
                                type='button'
                                onClick={() => setSubCode(opt.code)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                                    on
                                        ? 'border-[#D4AF37] bg-[#D4AF370D] ring-1 ring-[#D4AF37]'
                                        : 'border-white/10 bg-white/2 hover:border-white/20'
                                )}>
                                <span
                                    className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded-full border',
                                        on ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/30'
                                    )}>
                                    {on && <Check className='size-3 text-[#0C1132]' />}
                                </span>
                                <div className='min-w-0 flex-1'>
                                    <div className='flex items-baseline justify-between gap-2'>
                                        <span className='font-bebas-neue text-lg tracking-wider text-white uppercase'>
                                            {opt.level}
                                        </span>
                                        <span className='shrink-0'>
                                            <span className='text-gradient-gold font-bebas-neue text-2xl'>
                                                ${subTierPrice(opt.code)}
                                            </span>
                                            <span className='text-xs text-white/60'>/mo</span>
                                        </span>
                                    </div>
                                    <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-white/70'>
                                        <span className='text-sm'>
                                            {tokens} token{tokens === 1 ? '' : 's'} · entries per draw
                                        </span>
                                        {opt.spinDiscount > 0 && (
                                            <span
                                                className='inline-flex items-center gap-1 rounded-md border border-[#D4AF3759] px-1.5 py-0.5 text-xs font-semibold text-[#FFDC75]'
                                                style={{ background: '#291F0A' }}>
                                                <Sparkles className='size-3' /> Spin — win ${opt.spinDiscount} off
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* BENY add-on used to be a checkbox here. POST /membership/checkout
                    accepts only a sub-tier, so ticking it charged nothing while the
                    review screen still added $4 to "Due today". It is sold from the
                    member dashboard instead (PRD: "checkout awal ATAU halaman BENY
                    terpisah") until checkout can carry the line item. */}
                <div className='rounded-xl border border-white/10 bg-white/2 p-4'>
                    <div className='flex flex-wrap items-baseline gap-2'>
                        <span className='font-bebas-neue text-lg tracking-wider text-white uppercase'>BENY add-on</span>
                        <span className='text-sm font-semibold text-[#FFDC75]'>${BENY_PRICE}/month</span>
                    </div>
                    <p className='text-slr-muted mt-0.5 text-xs'>
                        Premium third-party discount platform. Optional, billed separately — add it from your dashboard
                        once your membership is active.
                    </p>
                </div>

                <div className='flex flex-wrap gap-3'>
                    <Button type='button' variant='outline' onClick={() => setPhase('group')} className={backBtn}>
                        <ArrowLeft className='h-4 w-4' />
                        Back
                    </Button>
                    <Button
                        type='button'
                        onClick={() => group && subCode && onNext({ tier: group, sub_tier: subCode })}
                        style={goldButtonStyle}
                        className={nextBtn}>
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    // ── Group phase (Visitor / RED / BLUE) ───────────────────────────────────
    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                    Choose your tier
                </h2>
                <p className='text-slr-muted mt-1 text-sm'>You can change or cancel any time from your account.</p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {tiers.map((tier) => {
                    const isSelected = group === tier.key;

                    return (
                        <button
                            key={tier.key}
                            type='button'
                            onClick={() => setGroup(tier.key)}
                            className={cn(
                                'relative flex h-full flex-col rounded-2xl text-left transition-all',
                                isSelected
                                    ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#131619]'
                                    : 'hover:ring-1 hover:ring-white/20'
                            )}>
                            <div
                                className={cn(
                                    'relative isolate flex flex-1 flex-col rounded-2xl',
                                    tier.isPaid ? 'p-[1.25px]' : ''
                                )}>
                                {tier.isPaid && tier.borderGradient && (
                                    <div
                                        className={`absolute inset-0 -z-10 rounded-2xl ${tier.borderGradient} mask-exclude [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]`}
                                        aria-hidden='true'
                                    />
                                )}

                                <div
                                    className={cn(
                                        'flex flex-1 flex-col rounded-2xl p-5',
                                        tier.isPaid ? tier.innerBg : tier.cardBg,
                                        tier.isPaid && 'rounded-[calc(1rem-1.25px)]'
                                    )}>
                                    {tier.badge && (
                                        <div
                                            className='absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[9px] font-bold tracking-widest uppercase'
                                            style={{
                                                color: '#0C1132',
                                                background:
                                                    'linear-gradient(89.12deg, #F5D78E 3.07%, #D4AF37 41.36%, #FFE066 60.5%, #A07018 98.79%)'
                                            }}>
                                            {tier.badge}
                                        </div>
                                    )}

                                    <div className='flex items-center gap-3'>
                                        {tier.icon && (
                                            <Image
                                                src={tier.icon}
                                                alt={tier.name}
                                                width={80}
                                                height={80}
                                                className='h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16'
                                            />
                                        )}
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-baseline justify-between'>
                                                <p className='font-bebas-neue text-xl tracking-wider text-white uppercase'>
                                                    {tier.name}
                                                </p>
                                                {isSelected && (
                                                    <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[#0C1132]'>
                                                        <Check className='h-3.5 w-3.5' />
                                                    </span>
                                                )}
                                            </div>
                                            <div className='mt-1 flex items-baseline gap-1'>
                                                <span className='text-gradient-gold font-bebas-neue text-3xl font-extrabold'>
                                                    {tier.price}
                                                </span>
                                                <span className='text-xs text-white/60'>{tier.note}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className='text-slr-muted mt-3 text-xs leading-relaxed'>{tier.tagline}</p>

                                    <div className='my-3 h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0)_100%)]' />

                                    <ul className='space-y-1.5'>
                                        {tier.perks.map((p) => (
                                            <li key={p} className='flex items-start gap-1.5 text-xs text-white/80'>
                                                <Check className='mt-0.5 h-3 w-3 shrink-0 text-[#FFDC75]' />
                                                <span>{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {touched && !group && <p className='text-xs text-red-400'>Choose a tier to continue.</p>}

            <div className='flex flex-wrap gap-3'>
                <Button type='button' variant='outline' onClick={onBack} className={backBtn}>
                    <ArrowLeft className='h-4 w-4' />
                    Back
                </Button>
                <Button type='button' onClick={handleGroupContinue} style={goldButtonStyle} className={nextBtn}>
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default StepTier;
