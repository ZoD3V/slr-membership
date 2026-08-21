import type { CSSProperties, FC, ReactNode } from 'react';

import Image from 'next/image';

import GoldCtaButton from '@/components/common/gold-cta-button';
import SectionEyebrow from '@/components/common/section-eyebrow';
import SectionHeading from '@/components/common/section-heading';
import type { TierDisplay } from '@/lib/api/resources/memberships';
import { GOLD_BAR_GRADIENT } from '@/lib/styles';
import { cn } from '@/lib/utils';

import { Disc3 } from 'lucide-react';

const mainBenefits = [
    '9 Draws Weekly/Monthly',
    'Monthly bonus prize',
    'Community Discounts',
    'Access to E-books in Finance and Wellbeing',
    'Upgrade or cancel anytime'
];

type TierRow = {
    icon: string;
    name: string;
    /** Sub-tier code — used to map live prices from the API. */
    code: string;
    price: string;
    tokens: string;
    /** Spin-wheel discount label, e.g. "$5 Off" — null for the standard tier. */
    spin: string | null;
    beny: boolean;
    cardStyle: CSSProperties;
    tokenBoxStyle: CSSProperties;
    /** Token-count text colour class. */
    tokenClass: string;
    /** "Member Entries" label colour class. */
    labelClass: string;
};

const redCardStyle: CSSProperties = {
    background: 'linear-gradient(154.36deg, #4A050A 0%, #1A0003 49.73%, #0A0001 98.65%)',
    border: '2px solid #C8152E',
    boxShadow: '0px 0px 15px 0px rgba(200, 21, 46, 0.25)'
};

const goldCardStyle: CSSProperties = {
    background: GOLD_BAR_GRADIENT,
    border: '2px solid #8C660D',
    boxShadow: '0px 10px 18px rgba(0, 0, 0, 0.35), 0px 0px 36px rgba(255, 199, 51, 0.55)'
};

const blackCardStyle: CSSProperties = {
    background: 'linear-gradient(154.36deg, #0A0A0A 0.82%, #181818 49.73%, #0A0A0A 98.65%)',
    border: '2px solid #D4AF37',
    boxShadow: '0px 0px 20px 0px rgba(212, 175, 55, 0.25)'
};

const tiers: TierRow[] = [
    {
        icon: '/icons/ic-list-slr-red-reward-1.webp',
        name: 'Standard',
        code: 'R1',
        price: '$10',
        tokens: '1 Token',
        spin: null,
        beny: false,
        cardStyle: redCardStyle,
        tokenBoxStyle: { border: '1.5px solid #C8152E', background: 'transparent' },
        tokenClass: 'text-[#F23030]',
        labelClass: 'text-[#8EA3C4]'
    },
    {
        icon: '/icons/ic-list-slr-red-reward-2.webp',
        name: 'Plus',
        code: 'R4',
        price: '$20',
        tokens: '4 Tokens',
        spin: '$5 Off',
        beny: true,
        cardStyle: goldCardStyle,
        tokenBoxStyle: { border: '1.5px solid #000000', background: 'transparent' },
        tokenClass: 'text-black',
        labelClass: 'text-black'
    },
    {
        icon: '/icons/ic-list-slr-red-reward-3.webp',
        name: 'Premium',
        code: 'R7',
        price: '$30',
        tokens: '7 Tokens',
        spin: '$10 Off',
        beny: true,
        cardStyle: blackCardStyle,
        tokenBoxStyle: { border: '1.5px solid #D4AF37', background: 'transparent' },
        tokenClass: 'text-[#FFD147]',
        labelClass: 'text-white'
    }
];

const Badge: FC<{ children: ReactNode; icon?: ReactNode; darkTheme?: boolean }> = ({
    children,
    icon,
    darkTheme = true
}) => {
    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[8px] font-extrabold tracking-wider whitespace-nowrap uppercase sm:px-2.5 sm:py-1 sm:text-[9px] xl:px-3 xl:py-1 xl:text-[10px]',
                darkTheme
                    ? 'border border-[#FFD147] bg-[#FFD147]/5 text-[#FFDC75] shadow-[inset_0_1px_3px_rgba(255,220,117,0.1)]'
                    : 'border border-[#000000] bg-transparent text-black'
            )}>
            {icon}
            {children}
        </span>
    );
};

const RedTiersSection = ({ live, startFrom }: { live?: Record<string, TierDisplay>; startFrom?: string }) => {
    return (
        <section className='bg-slr-ink relative isolate overflow-hidden py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='text-center'>
                    <SectionEyebrow label='Member Prize Tiers' color='#DC2626' lineColor='#D0302F' className='mt-4' />

                    <SectionHeading className='mt-2'>
                        SLR <span className='text-red-600'>RED</span> Reward Tiers
                    </SectionHeading>

                    <p className='text-slr-muted mt-2 text-center text-sm leading-relaxed xl:text-base'>
                        Member prize tokens are based on your tier level.
                    </p>
                </div>

                <div className='mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-2'>
                    {/* LEFT — SLR RED hero card (gradient border via masked overlay) */}
                    <div className='shadow-card-warm-lg relative isolate h-full rounded-2xl p-1.25'>
                        <div
                            className='absolute inset-0 -z-10 rounded-2xl bg-[linear-gradient(180deg,#FF6B7A_10%,#C8152E_25%,#8B0010_75.24%,#C8152E_87.62%,#FF6B7A_100%)] mask-exclude p-1.25 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]'
                            aria-hidden='true'
                        />
                        <div className='relative flex h-full flex-col overflow-hidden rounded-[calc(1rem-5px)] bg-[linear-gradient(180deg,#530710_0%,#37040D_30%,#220408_60%,#470818_87.62%)] p-4 sm:p-6'>
                            {/* Header */}
                            <div className='flex items-center gap-3'>
                                <Image
                                    src='/icons/ic-slr-red-reward.webp'
                                    alt='SLR Red'
                                    width={120}
                                    height={120}
                                    className='h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24'
                                />
                                <div className='min-w-0'>
                                    <div className='flex flex-wrap items-baseline gap-x-2'>
                                        <span className='font-bebas-neue text-2xl font-extrabold text-white sm:text-3xl'>
                                            SLR RED
                                        </span>
                                        <span className='text-slr-muted text-[10px] leading-tight sm:text-xs'>
                                            Start From
                                        </span>
                                        <span className='text-gradient-gold font-bebas-neue text-3xl font-extrabold xl:text-4xl'>
                                            {startFrom ?? '$10'}
                                        </span>
                                        <span className='text-xs text-white/60'>/mo</span>
                                    </div>
                                    <p className='text-slr-muted mt-1 text-xs'>1 to 7 draw token/entry</p>
                                </div>
                            </div>

                            <div className='my-4 h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0)_100%)]' />

                            {/* Benefits header row + add-on badge */}
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
                                            BENY $4
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits list */}
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

                            <GoldCtaButton href='/sign-up' className='mt-auto pt-6'>
                                Join Now
                            </GoldCtaButton>
                        </div>
                    </div>

                    {/* RIGHT — tier rows */}
                    <div className='flex h-full flex-col gap-4'>
                        {tiers.map((tier) => {
                            const l = live?.[tier.code];
                            const spin = l?.spin ?? tier.spin;
                            const isPlus = tier.code === 'R4';

                            return (
                                <div
                                    key={tier.name}
                                    style={tier.cardStyle}
                                    className='flex flex-1 items-center justify-between gap-3 rounded-2xl p-3 max-[374px]:flex-col max-[374px]:items-stretch sm:p-4'>
                                    <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                                        <Image
                                            src={tier.icon}
                                            alt={tier.name}
                                            width={112}
                                            height={112}
                                            className='h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 xl:h-16 xl:w-16'
                                        />
                                        <div className='min-w-0'>
                                            <div className='flex flex-wrap items-center gap-2'>
                                                <span
                                                    className={cn(
                                                        'font-bebas-neue text-lg font-extrabold tracking-[0.18em] uppercase sm:text-xl xl:text-[22px] xl:leading-tight',
                                                        isPlus ? 'text-black' : 'text-white'
                                                    )}>
                                                    {l?.name ?? tier.name}
                                                </span>
                                                {spin && (
                                                    <Badge
                                                        icon={
                                                            <Disc3
                                                                className={cn(
                                                                    'h-3 w-3 xl:h-4 xl:w-4',
                                                                    isPlus ? 'text-black' : 'text-[#FFDC75]'
                                                                )}
                                                            />
                                                        }
                                                        darkTheme={!isPlus}>
                                                        Spin-Wheel {spin}
                                                    </Badge>
                                                )}
                                                {tier.beny && <Badge darkTheme={!isPlus}>BENY</Badge>}
                                            </div>
                                            <p className='mt-1 flex items-baseline gap-1.5'>
                                                <span
                                                    className={cn(
                                                        'font-bebas-neue text-4xl font-extrabold xl:text-[40px] xl:leading-none',
                                                        isPlus ? 'text-black' : 'text-gradient-gold'
                                                    )}>
                                                    {l?.price ?? tier.price}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium xl:text-lg',
                                                        isPlus ? 'text-black/85' : 'text-white/70'
                                                    )}>
                                                    /month
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        style={tier.tokenBoxStyle}
                                        className='flex w-24 shrink-0 flex-col items-center justify-center rounded-xl px-2.5 py-3 text-center max-[374px]:w-full sm:w-32 sm:px-4 sm:py-4 xl:w-40'>
                                        <span
                                            className={cn(
                                                'font-bebas-neue text-xl leading-none font-black whitespace-nowrap sm:text-2xl xl:text-[26px]',
                                                tier.tokenClass
                                            )}>
                                            {l?.tokens ?? tier.tokens}
                                        </span>
                                        <div
                                            className={cn(
                                                'mt-1.5 flex flex-col items-center text-[9px] leading-snug font-semibold tracking-[0.2em] uppercase sm:text-[11px] xl:text-xs',
                                                tier.labelClass
                                            )}>
                                            <span>Member</span>
                                            <span>Entries</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RedTiersSection;
