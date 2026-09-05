import type { CSSProperties, FC, ReactNode } from 'react';

import Image from 'next/image';

import GoldCtaButton from '@/components/common/gold-cta-button';
import SectionEyebrow from '@/components/common/section-eyebrow';
import SectionHeading from '@/components/common/section-heading';
import { BENY_MONTHLY_PRICE } from '@/constant/tiers';
import type { TierDisplay } from '@/lib/api/resources/memberships';
import { GOLD_BAR_GRADIENT } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { Disc3 } from 'lucide-react';

const mainBenefits = [
    'Draws Weekly/Monthly with bigger prizes',
    'Monthly bonus prize',
    'Community Discounts',
    'Access to E-books in Finance and Wellbeing',
    'Upgrade or cancel anytime'
];

const extraSavings = [
    ['Petrol', 'Saving'],
    ['Retail Partner', 'Discounts'],
    ['Lifestyle', 'Offers'],
    ['Health and', 'Wellbeing']
];

type TierRow = {
    icon: string;
    name: string;

    code: string;
    price: string;
    tokens: string;

    spin: string | null;
    beny: boolean;
    cardStyle: CSSProperties;
    tokenBoxStyle: CSSProperties;

    tokenClass: string;

    nameClass: string;

    priceClass: string;

    labelClass: string;

    lightSurface?: boolean;
};

const blueCardStyle: CSSProperties = {
    background: 'linear-gradient(154.36deg, #0A2A6B 0%, #072050 49.73%, #0A2A6B 98.65%)',
    border: '2px solid #2878E8',
    boxShadow: '0px 0px 18px 0px rgba(40, 120, 232, 0.45)'
};

const silverCardStyle: CSSProperties = {
    background: 'linear-gradient(180deg, #F2F4F7 0%, #C7CDD6 45%, #E8EBF0 55%, #A8B0BC 100%)',
    border: '2px solid #6E7683',
    boxShadow: '0px 10px 18px rgba(0, 0, 0, 0.35), 0px 0px 30px rgba(200, 210, 225, 0.35)'
};

const goldCardStyle: CSSProperties = {
    background: GOLD_BAR_GRADIENT,
    border: '2px solid #8C660D',
    boxShadow: '0px 10px 18px rgba(0, 0, 0, 0.35), 0px 0px 36px rgba(255, 199, 51, 0.55)'
};

const blackCardStyle: CSSProperties = {
    background: 'linear-gradient(154.36deg, #0A0A0A 0.82%, #181818 49.73%, #0A0A0A 98.65%)',
    border: '2px solid #D4AF37',
    boxShadow: '0px 0px 20px 0px rgba(212, 175, 55, 0.3)'
};

const tiers: TierRow[] = [
    {
        icon: '/icons/ic-list-slr-blue-reward-1.webp',
        name: 'Standard',
        code: 'B1',
        price: '$12',
        tokens: '1 Entry',
        spin: null,
        beny: false,
        cardStyle: blueCardStyle,
        tokenBoxStyle: { background: 'transparent', border: '1.5px solid #3D8BF2' },
        tokenClass: 'text-[#6AB0F0]',
        nameClass: 'text-white',
        priceClass: 'text-gradient-gold',
        labelClass: 'text-[#8EA3C4]'
    },
    {
        icon: '/icons/ic-list-slr-blue-reward-2.webp',
        name: 'Plus',
        code: 'B4',
        price: '$19',
        tokens: '4 Entries',
        spin: '$3 Off',
        beny: true,
        cardStyle: silverCardStyle,
        tokenBoxStyle: { background: 'transparent', border: '1.5px solid #55606E' },
        tokenClass: 'text-[#0A0A0A]',
        nameClass: 'text-[#0A0A0A]',

        priceClass: 'text-[#8C660D]',
        labelClass: 'text-[#3D4654]',
        lightSurface: true
    },
    {
        icon: '/icons/ic-list-slr-blue-reward-3.webp',
        name: 'Premium',
        code: 'B7',
        price: '$27',
        tokens: '7 Entries',
        spin: '$6 Off',
        beny: true,
        cardStyle: goldCardStyle,
        tokenBoxStyle: { background: 'transparent', border: '1.5px solid #000000' },
        tokenClass: 'text-[#0A0A0A]',
        nameClass: 'text-[#0A0A0A]',
        priceClass: 'text-[#0A0A0A]',
        labelClass: 'text-[#3D3D3D]',
        lightSurface: true
    },
    {
        icon: '/icons/ic-list-slr-blue-reward-4.webp',
        name: 'Elite',
        code: 'B10',
        price: '$35',
        tokens: '10 Entries',
        spin: '$9 Off',
        beny: true,
        cardStyle: blackCardStyle,
        tokenBoxStyle: { background: 'transparent', border: '1.5px solid #D4AF37' },
        tokenClass: 'text-[#FFD147]',
        nameClass: 'text-white',
        priceClass: 'text-gradient-gold',
        labelClass: 'text-white/85'
    }
];

const Badge: FC<{ children: ReactNode; icon?: ReactNode; lightSurface?: boolean }> = ({
    children,
    icon,
    lightSurface = false
}) => (
    <span
        className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[7px] font-extrabold tracking-wide whitespace-nowrap uppercase sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px] xl:px-3 xl:py-1 xl:text-[10px]',
            lightSurface
                ? 'border border-[#0A0A0A] bg-transparent text-[#0A0A0A]'
                : 'border border-[#FFD147] bg-[#FFD147]/5 text-[#FFDC75] shadow-[inset_0_1px_3px_rgba(255,220,117,0.1)]'
        )}>
        {icon}
        {children}
    </span>
);

const BlueTiersSection = ({ live, startFrom }: { live?: Record<string, TierDisplay>; startFrom?: string }) => {
    return (
        <section className='bg-slr-ink relative isolate overflow-hidden py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='text-center'>
                    <SectionEyebrow label='Premium Member Tiers' color='#4D62E5' className='mt-4' />

                    <SectionHeading className='mt-2'>
                        SLR <span className='text-[#4D62E5]'>BLUE</span> Reward Tiers
                    </SectionHeading>

                    <p className='text-slr-muted mt-2 text-center text-sm leading-relaxed xl:text-base'>
                        Higher tiers — more chances to win every month.
                    </p>
                </div>

                <div className='mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-2'>
                    <div className='shadow-card-warm-lg relative isolate h-full rounded-2xl p-1.25'>
                        <div
                            className='absolute inset-0 -z-10 rounded-2xl bg-[linear-gradient(180deg,#6AACFF_10%,#1A62C0_25%,#0A2E80_75.24%,#1A62C0_87.62%,#6AACFF_100%)] mask-exclude p-1.25 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]'
                            aria-hidden='true'
                        />
                        <div className='relative flex h-full flex-col overflow-hidden rounded-[calc(1rem-5px)] bg-[linear-gradient(180deg,#0F2F7A_0%,#0B205D_30%,#081640_60%,#0D2662_87.62%)] p-4 sm:p-6'>
                            <div className='flex items-center gap-3'>
                                <Image
                                    src='/icons/ic-slr-blue-reward.webp'
                                    alt='SLR Blue'
                                    width={120}
                                    height={120}
                                    className='h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24'
                                />
                                <div className='min-w-0'>
                                    <div className='flex flex-wrap items-baseline gap-x-2'>
                                        <span className='font-bebas-neue text-2xl font-extrabold text-white sm:text-3xl'>
                                            SLR BLUE
                                        </span>
                                        <span className='text-slr-muted text-[10px] leading-tight sm:text-xs'>
                                            Start From
                                        </span>
                                        <span className='text-gradient-gold font-bebas-neue text-3xl font-extrabold xl:text-4xl'>
                                            {startFrom ?? '$3'}
                                        </span>
                                        <span className='text-xs text-white/60'>/week</span>
                                    </div>
                                    <p className='text-slr-muted mt-1 text-xs'>
                                        1 entry = 1 weekly draw entry · Full platform access
                                    </p>
                                </div>
                            </div>

                            <div className='my-4 h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0)_100%)]' />

                            <div className='flex items-center justify-between gap-3'>
                                <p className='text-xs font-semibold tracking-widest text-white uppercase sm:text-sm'>
                                    Main Benefits
                                </p>

                                <div className='flex w-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(119.74deg,#FFE8A3_16.57%,#F1C94F_94.27%)] font-bold tracking-wider text-[#0C1132] uppercase sm:w-20 sm:rounded-2xl'>
                                    <div
                                        className='w-full border-b border-[#F1E9B1] py-1 text-center text-[9px] font-bold text-[#392D0B] sm:text-[10px]'
                                        style={{
                                            background: 'linear-gradient(89.12deg, #F4D580 60.5%, #EDB038 98.79%)'
                                        }}>
                                        ADD-ONS
                                    </div>
                                    <div className='flex flex-col items-center justify-center pt-0.75 pb-1.5'>
                                        <span className='text-[10px] leading-tight font-black text-[#363A3D] sm:text-xs md:text-sm'>
                                            BENY {`$${BENY_MONTHLY_PRICE}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <ul className='space-y-2.5'>
                                {mainBenefits.map((item) => (
                                    <li key={item} className='flex items-start gap-2 text-white/90'>
                                        <Image
                                            src='/icons/ic-check-circle.png'
                                            alt=''
                                            width={20}
                                            height={20}
                                            className='mt-0.5 h-4 w-4 shrink-0 object-contain sm:h-5 sm:w-5'
                                        />
                                        <span className='text-xs leading-relaxed sm:text-sm'>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className='mt-6'>
                                <p className='text-center text-xs font-bold tracking-widest text-white uppercase sm:text-sm'>
                                    Extra Saving with Beny
                                </p>
                                <div className='mt-4 flex divide-x divide-white/15'>
                                    {extraSavings.map(([line1, line2]) => (
                                        <p
                                            key={line1}
                                            className='text-slr-muted flex-1 px-2 text-center text-[13px] leading-snug sm:text-sm'>
                                            {line1}
                                            <br />
                                            {line2}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <GoldCtaButton href='/sign-up' className='mt-auto pt-6'>
                                Join Now
                            </GoldCtaButton>
                        </div>
                    </div>

                    <div className='flex h-full flex-col gap-4'>
                        {tiers.map((tier) => {
                            const l = live?.[tier.code];
                            const spin = l?.spin ?? tier.spin;

                            return (
                                <div
                                    key={tier.name}
                                    style={tier.cardStyle}
                                    className='flex flex-1 items-center justify-between gap-3 rounded-2xl p-3 max-[374px]:flex-col max-[374px]:items-stretch sm:p-4'>
                                    <div className='flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3'>
                                        <Image
                                            src={tier.icon}
                                            alt={tier.name}
                                            width={112}
                                            height={112}
                                            className='h-10 w-10 shrink-0 object-contain sm:h-14 sm:w-14 xl:h-16 xl:w-16'
                                        />
                                        <div className='min-w-0'>
                                            <div className='flex flex-wrap items-center gap-x-1.5 gap-y-1 lg:gap-2'>
                                                <span
                                                    className={cn(
                                                        'font-bebas-neue text-lg font-extrabold tracking-[0.18em] uppercase max-lg:basis-full max-lg:leading-none sm:text-xl xl:text-[22px] xl:leading-tight',
                                                        tier.nameClass
                                                    )}>
                                                    {l?.name ?? tier.name}
                                                </span>
                                                {spin && (
                                                    <Badge
                                                        icon={<Disc3 className='h-2.5 w-2.5 xl:h-4 xl:w-4' />}
                                                        lightSurface={tier.lightSurface}>
                                                        Spin-Wheel {spin}
                                                    </Badge>
                                                )}
                                                {tier.beny && <Badge lightSurface={tier.lightSurface}>BENY</Badge>}
                                            </div>
                                            <p className='mt-1 flex items-baseline gap-1.5'>
                                                <span
                                                    className={cn(
                                                        'font-bebas-neue text-4xl font-extrabold xl:text-[38px] xl:leading-none',
                                                        tier.priceClass
                                                    )}>
                                                    {l?.price ?? tier.price}
                                                </span>
                                                <span className={cn('text-xs font-medium xl:text-lg', tier.labelClass)}>
                                                    /4 weeks
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        style={tier.tokenBoxStyle}
                                        className='flex w-24 shrink-0 flex-col items-center justify-center rounded-xl px-2 py-3 text-center max-[374px]:w-full sm:w-36 sm:px-4 sm:py-4 xl:w-40'>
                                        <span
                                            className={cn(
                                                'font-bebas-neue text-xl leading-none font-black whitespace-nowrap sm:text-2xl xl:text-[28px]',
                                                tier.tokenClass
                                            )}>
                                            {l?.tokens ?? tier.tokens}
                                        </span>
                                        <span
                                            className={cn(
                                                'mt-1.5 text-[9px] font-semibold tracking-widest whitespace-nowrap uppercase sm:text-[14px] xl:text-sm',
                                                tier.labelClass
                                            )}>
                                            Each Draw
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className='text-slr-dim mt-12 w-full rounded-xl border border-[#1A62C033] bg-[#1A62C014] p-4 text-center text-sm md:text-base'>
                    Each entry gives you <span className='font-bold text-[#6AB0F0]'>one entry</span> into the weekly
                    member prize draws. Higher tiers = more chances to win every week.
                </div>
            </div>
        </section>
    );
};

export default BlueTiersSection;
