'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { BLUE_TIER_CARD, MONEY_ARTWORK, RED_TIER_CARD, type TierCardTheme } from '@/constant/tier-card-theme';
import { GOLD_GRADIENT, goldButtonStyle } from '@/lib/styles';
import { type TierPricing, dollarsOf, minPriceOf, spinDiscountOf } from '@/lib/tier-pricing';
import { cn } from '@/lib/utils';
import type { SubTierCode } from '@/types/member';

import { BENY_PRICE, SignUpFormData, TierKey, subTiersForGroup } from './types';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

type TierOption = TierCardTheme & {
    key: TierKey;
    tagline: string;
    perks: string[];
    badge?: string;
};

const tiers: TierOption[] = [
    {
        ...RED_TIER_CARD,
        key: 'red',
        tagline: 'The everyday rewards plan.',
        perks: ['Up to 7 weekly draws', '4–7 entries per cycle', 'Unlock all discount codes', 'Read all e-books'],
        badge: 'Most popular'
    },
    {
        ...BLUE_TIER_CARD,
        key: 'blue',
        tagline: 'Maximum draws, member-only deals.',
        perks: ['Everything in Red', '10+ entries per cycle', 'Premium prize pool', 'Member-only deals']
    }
];

type StepTierProps = {
    data: SignUpFormData;
    pricing: TierPricing;
    onNext: (patch: Partial<SignUpFormData>) => void;
    onBack: () => void;
};

const backBtn =
    'h-11 min-w-max flex-1 rounded-xl border border-white/10 bg-white/5 px-6 font-semibold text-white hover:bg-white/10 hover:text-white sm:flex-none';
const nextBtn = 'h-11 min-w-max flex-1 rounded-xl font-bold uppercase shadow-md transition-opacity hover:opacity-90';

const StepTier = ({ data, pricing, onNext, onBack }: StepTierProps) => {
    const [phase, setPhase] = useState<'group' | 'subtier'>('group');
    const [group, setGroup] = useState<TierKey | null>(data.tier);
    const [subCode, setSubCode] = useState<SubTierCode | null>(data.sub_tier);
    const [touched, setTouched] = useState(false);

    const handleGroupContinue = () => {
        if (!group) {
            setTouched(true);

            return;
        }
        const subs = subTiersForGroup(pricing, group);
        if (!subCode || !subs.some((s) => s.code === subCode)) {
            setSubCode(subs[0].code);
        }
        setPhase('subtier');
    };

    if (phase === 'subtier' && (group === 'red' || group === 'blue')) {
        const subs = subTiersForGroup(pricing, group);
        const groupName = group === 'red' ? 'SLR Red' : 'SLR Blue';

        return (
            <div className='flex flex-col gap-6'>
                <div>
                    <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                        Choose your {groupName} plan
                    </h2>
                    <p className='text-slr-muted mt-1 text-sm'>
                        More entries = better odds in every draw. Upgrade plans get a spin at checkout.
                    </p>
                </div>

                <div className='space-y-3'>
                    {subs.map((opt) => {
                        const on = subCode === opt.code;
                        const tokens = pricing[opt.code].tokens;
                        const spinDiscount = spinDiscountOf(pricing, opt.code);

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
                                                ${dollarsOf(pricing, opt.code)}
                                            </span>
                                            <span className='text-xs text-white/60'>/mo</span>
                                        </span>
                                    </div>
                                    <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-white/70'>
                                        <span className='text-sm'>
                                            {tokens} {tokens === 1 ? 'Entry' : 'Entries'} per draw
                                        </span>
                                        {spinDiscount > 0 && (
                                            <span
                                                className='inline-flex items-center gap-1 rounded-md border border-[#D4AF3759] px-1.5 py-0.5 text-xs font-semibold text-[#FFDC75]'
                                                style={{ background: '#291F0A' }}>
                                                <Sparkles className='size-3' /> Spin — win ${spinDiscount} off
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

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

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                    Choose your tier
                </h2>
                <p className='text-slr-muted mt-1 text-sm'>You can change or cancel any time from your account.</p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {tiers.map((tier) => {
                    const isSelected = group === tier.key;

                    return (
                        <button
                            key={tier.key}
                            type='button'
                            onClick={() => setGroup(tier.key)}
                            style={{ background: tier.borderGradient }}
                            className={cn(
                                'relative flex h-full flex-col rounded-2xl p-0.5 text-left transition-all',
                                isSelected
                                    ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#131619]'
                                    : 'opacity-90 hover:opacity-100'
                            )}>
                            {tier.badge && (
                                <span
                                    className='absolute -top-2.5 left-1/2 z-20 -translate-x-1/2 rounded-full px-3 py-0.5 text-[9px] font-bold tracking-widest whitespace-nowrap uppercase'
                                    style={{ color: '#0C1132', background: GOLD_GRADIENT }}>
                                    {tier.badge}
                                </span>
                            )}

                            <div
                                className='relative flex h-full flex-col overflow-hidden rounded-[14px] px-4 pt-6 pb-5'
                                style={{ background: tier.surface }}>
                                <div
                                    aria-hidden='true'
                                    className='absolute -top-2.5 left-0 z-0 h-35 w-full opacity-35'
                                    style={{
                                        background: `url('${MONEY_ARTWORK}') no-repeat center 20%`,
                                        backgroundSize: 'cover',
                                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                                        WebkitMaskImage:
                                            'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                                        filter: tier.moneyFilter
                                    }}
                                />

                                {isSelected && (
                                    <span className='absolute top-3 right-3 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37] text-[#0C1132]'>
                                        <Check className='h-3.5 w-3.5' />
                                    </span>
                                )}

                                <div className='relative z-10 flex flex-col items-center text-center'>
                                    <h3
                                        className='font-bebas-neue text-4xl font-bold tracking-wider uppercase sm:text-5xl'
                                        style={{ color: tier.accent, textShadow: `0px 0px 18px ${tier.accentGlow}` }}>
                                        {tier.name}
                                    </h3>
                                    <span
                                        className='mt-3 inline-block max-w-full rounded-full bg-black/50 px-5 py-2 text-sm font-bold tracking-wider whitespace-nowrap text-white uppercase sm:text-base'
                                        style={{ border: `1px solid ${tier.pillBorder}` }}>
                                        From{' '}
                                        <span className='text-gradient-gold'>
                                            ${minPriceOf(pricing, tier.key) / 100}
                                        </span>
                                        <span className='text-white/60'> / month</span>
                                    </span>
                                    <p className='text-slr-muted mt-3 text-xs leading-relaxed'>{tier.tagline}</p>
                                </div>

                                <div className='relative z-10 my-4 h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0)_100%)]' />

                                <ul
                                    className='relative z-10 space-y-1.5 rounded-xl p-3'
                                    style={{ backgroundColor: tier.prizeBox }}>
                                    {tier.perks.map((p) => (
                                        <li key={p} className='flex items-start gap-1.5 text-xs text-white/80'>
                                            <Check className='mt-0.5 h-3 w-3 shrink-0 text-[#FFDC75]' />
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>
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
