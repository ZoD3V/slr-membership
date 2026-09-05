import type { CSSProperties, FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import GoldPillButton from '@/components/common/gold-pill-button';
import SectionHeading from '@/components/common/section-heading';
import SpinWheelBadge from '@/components/common/spin-wheel-badge';
import { SUB_TIERS } from '@/constant/tiers';
import { type TierPricing, codesForGroup, getTierPricing } from '@/lib/tier-pricing';
import { cn } from '@/lib/utils';

type Tier = {
    label: string;
    price: string;
    token: string;
    spinDiscount: number;
};

const tiersForGroup = (pricing: TierPricing, group: 'red' | 'blue'): Tier[] =>
    codesForGroup(pricing, group).map((code) => ({
        label: SUB_TIERS[code].marketingName,
        price: `$${pricing[code].priceCents / 100}`,
        token: `${pricing[code].tokens} ${pricing[code].tokens === 1 ? 'Entry' : 'Entries'}`,
        spinDiscount: pricing[code].spinDiscountCents / 100
    }));

type TierTheme = {
    accent: string;

    borderGradient: string;

    fill: string;

    itemBorder: string;

    badge: CSSProperties;

    divider: string;
    columns: string;
};

const redTheme: TierTheme = {
    accent: '#F1343F',
    borderGradient: 'linear-gradient(180deg, #FF6B7A 10%, #C8152E 25%, #8B0010 75.24%, #C8152E 87.62%, #FF6B7A 100%)',
    fill: 'linear-gradient(180deg, rgba(83, 7, 16, 0.1) 0%, rgba(55, 4, 13, 0.1) 30%, rgba(34, 4, 8, 0.1) 60%, rgba(71, 8, 24, 0.1) 87.62%)',
    itemBorder: '#801A1A',
    badge: { background: '#240505', border: '1px solid #F02121', color: '#F02121' },
    divider: '#C8152E66',
    columns: 'grid-cols-3'
};

const blueTheme: TierTheme = {
    accent: '#2878E8',
    borderGradient: 'linear-gradient(180deg, #6AACFF 0%, #1A62C0 25%, #0A2E80 50%, #1A62C0 75%, #6AACFF 100%)',
    fill: 'linear-gradient(180deg, rgba(15, 47, 122, 0.1) 0%, rgba(11, 32, 93, 0.1) 30%, rgba(8, 22, 64, 0.1) 60%, rgba(13, 38, 98, 0.1) 87.62%)',
    itemBorder: '#1A338C',
    badge: { background: '#081125', border: '1px solid #3873F7', color: '#3873F7' },
    divider: '#2878E84D',
    columns: 'grid-cols-2 sm:grid-cols-4'
};

const TierColumn: FC<{ tier: Tier; theme: TierTheme }> = ({ tier, theme }) => (
    <div
        className='flex h-full flex-col items-center rounded-xl px-1 pt-4 pb-8 text-center sm:px-2'
        style={{ border: `1px solid ${theme.itemBorder}` }}>
        <p className='text-[10px] font-semibold tracking-widest text-white uppercase sm:text-xs'>{tier.label}</p>
        <p
            className='font-bebas-neue mt-1 text-3xl leading-none font-extrabold sm:text-4xl lg:text-5xl'
            style={{ color: theme.accent }}>
            {tier.price}
        </p>
        <p className='mt-1 text-[10px] font-medium tracking-wider text-white uppercase'>/4 Weeks</p>

        <div className='my-3 h-px w-8' style={{ background: theme.divider }} />

        <span
            className='rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider uppercase sm:text-sm'
            style={theme.badge}>
            {tier.token}
        </span>

        <div className='mt-4 flex min-h-27.5 flex-1 flex-col items-center justify-center gap-2'>
            {tier.spinDiscount > 0 ? (
                <>
                    <SpinWheelBadge amount={tier.spinDiscount} />
                    <p className='text-[10px] leading-tight font-semibold tracking-wider text-white uppercase'>
                        Monthly
                        <br />
                        Spinwheel
                    </p>
                </>
            ) : (
                <p className='text-sm font-medium tracking-wider text-white uppercase'>No Spin</p>
            )}
        </div>
    </div>
);

const TierCard: FC<{ name: string; tiers: Tier[]; theme: TierTheme }> = ({ name, tiers, theme }) => (
    <div className='rounded-2xl p-0.5' style={{ background: theme.borderGradient }}>
        <div className='rounded-[14px] p-4' style={{ background: `${theme.fill}, #040404` }}>
            <div className='flex items-center justify-center gap-3'>
                <span className='h-px w-12 sm:w-16' style={{ background: theme.itemBorder }} />
                <span
                    className='font-bebas-neue text-3xl tracking-wider uppercase md:text-4xl'
                    style={{ color: theme.accent }}>
                    {name} Tier
                </span>
                <span className='h-px w-12 sm:w-16' style={{ background: theme.itemBorder }} />
            </div>
            <p className='mt-2 text-center text-[10px] font-medium tracking-wider text-white uppercase sm:text-xs'>
                Membership tier determines your number of entries
            </p>

            <div className={cn('mt-4 grid gap-2 sm:gap-3', theme.columns)}>
                {tiers.map((tier) => (
                    <TierColumn key={tier.label} tier={tier} theme={theme} />
                ))}
            </div>
        </div>
    </div>
);

const SlrRedBlueTiersSpinWheelSection = async () => {
    const pricing = await getTierPricing();
    const redTiers = tiersForGroup(pricing, 'red');
    const blueTiers = tiersForGroup(pricing, 'blue');

    return (
        <section id='tiers' className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <SectionHeading>
                    <span className='text-gradient-silver'>SLR Red - Blue Tiers &amp; Spin Wheel</span>
                </SectionHeading>

                <p className='text-gradient-gold mt-3 text-center text-xs font-semibold tracking-[0.2em] uppercase sm:text-sm'>
                    More way to win. More value for members.
                </p>

                <div className='mt-12 grid grid-cols-1 gap-4 lg:grid-cols-7'>
                    <div className='lg:col-span-3'>
                        <TierCard name='Red' tiers={redTiers} theme={redTheme} />
                    </div>
                    <div className='lg:col-span-4'>
                        <TierCard name='Blue' tiers={blueTiers} theme={blueTheme} />
                    </div>
                </div>

                <div className='mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-end sm:justify-between'>
                    <div className='flex items-center gap-3'>
                        <Image src='/icons/ic-trophy.png' alt='' width={40} height={40} className='h-9 w-9 shrink-0' />
                        <p className='text-slr-gold-label max-w-xl text-xs font-semibold tracking-wider uppercase sm:text-base'>
                            Entries are used for member draws &amp; promotions only. Spins provide bonus savings
                            discounts.
                        </p>
                    </div>
                    <p className='text-[10px] tracking-wider text-[#B2B2B8] uppercase sm:text-xs'>
                        Terms &amp; conditions apply. See website for full details.
                    </p>
                </div>

                <div className='mt-10 flex w-full flex-wrap justify-center gap-4'>
                    <GoldPillButton href='/sign-up' className='min-w-max flex-1 sm:flex-none'>
                        Join Now
                    </GoldPillButton>
                    <Link
                        href='/membership'
                        className='flex min-w-max flex-1 items-center justify-center rounded-xl px-8 py-2.5 transition-opacity hover:opacity-90 sm:flex-none sm:rounded-2xl lg:px-12 lg:py-3'
                        style={{ background: '#212429', border: '1.5px solid #D1A62E' }}>
                        <span className='text-slr-gold-label text-base font-bold tracking-[2px] uppercase sm:tracking-[2.5px] lg:text-xl lg:tracking-[3px]'>
                            Learn More
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SlrRedBlueTiersSpinWheelSection;
