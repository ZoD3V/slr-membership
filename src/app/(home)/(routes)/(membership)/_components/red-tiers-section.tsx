import type { CSSProperties, FC, ReactNode } from 'react';

import Image from 'next/image';

import GoldCtaButton from '@/components/common/gold-cta-button';
import SectionEyebrow from '@/components/common/section-eyebrow';
import SectionHeading from '@/components/common/section-heading';
import type { TierDisplay } from '@/lib/api/resources/memberships';

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
};

const redCardStyle: CSSProperties = {
    background: 'linear-gradient(154.36deg, #1C0308 0.82%, #2A0810 49.73%, #1A0306 98.65%)',
    border: '1px solid #C8152E66'
};

const goldCardStyle: CSSProperties = {
    background: 'linear-gradient(154.36deg, #140E00 0.82%, #1E1600 49.73%, #140E00 98.65%)',
    border: '1px solid #D4AF3759',
    boxShadow: '0px 0px 13px 0px #776D6D26'
};

const blackCardStyle: CSSProperties = {
    background: 'linear-gradient(154.36deg, #0A0A0A 0.82%, #181818 49.73%, #0A0A0A 98.65%)',
    border: '1px solid #FFFFFF1A'
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
        tokenBoxStyle: { background: '#C8152E0D', border: '1px solid #C8152E66' },
        tokenClass: 'text-[#E88888]'
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
        tokenBoxStyle: { background: '#C8152E0D', border: '1px solid #C8152E66' },
        tokenClass: 'text-[#FFD147]'
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
        tokenBoxStyle: { background: '#FFFFFF08', border: '1px solid #FFFFFF1A' },
        tokenClass: 'text-white'
    }
];

// Gold badge per spec — dark gold fill, gold border, gold-label text.
const goldBadgeStyle: CSSProperties = { background: '#291F0A', border: '1px solid #D1A62E' };

const Badge: FC<{ children: ReactNode; icon?: ReactNode }> = ({ children, icon }) => (
    <span
        style={goldBadgeStyle}
        className='text-slr-gold-label inline-flex items-center gap-1 rounded-md px-2 py-1 text-[7px] font-semibold tracking-wide uppercase md:text-[10px]'>
        {icon}
        {children}
    </span>
);

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

                            return (
                                <div
                                    key={tier.name}
                                    style={tier.cardStyle}
                                    className='flex flex-1 items-center justify-between gap-3 rounded-2xl p-3 sm:p-4'>
                                    <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                                        <Image
                                            src={tier.icon}
                                            alt={tier.name}
                                            width={112}
                                            height={112}
                                            className='h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 xl:h-20 xl:w-20'
                                        />
                                        <div className='min-w-0'>
                                            <div className='flex flex-wrap items-center gap-2'>
                                                <span className='text-sm font-bold tracking-[0.18em] text-white uppercase'>
                                                    {l?.name ?? tier.name}
                                                </span>
                                                {spin && (
                                                    <Badge icon={<Disc3 className='h-3 w-3' />}>
                                                        Spin-Wheel {spin}
                                                    </Badge>
                                                )}
                                                {tier.beny && <Badge>BENY</Badge>}
                                            </div>
                                            <p className='mt-1 flex items-baseline gap-1.5'>
                                                <span className='text-gradient-gold font-bebas-neue text-3xl font-extrabold xl:text-4xl'>
                                                    {l?.price ?? tier.price}
                                                </span>
                                                <span className='text-xs text-white/70'>/month</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        style={tier.tokenBoxStyle}
                                        className='flex shrink-0 flex-col items-center justify-center rounded-xl px-3 py-2 text-center xl:px-4 xl:py-2.5'>
                                        <span
                                            className={`font-bebas-neue text-xl leading-none font-extrabold sm:text-2xl xl:text-3xl ${tier.tokenClass}`}>
                                            {l?.tokens ?? tier.tokens}
                                        </span>
                                        <span className='text-slr-dim mt-1 max-w-24 text-[10px] font-semibold tracking-widest uppercase sm:text-xs xl:max-w-26.5 xl:text-sm'>
                                            Member Entries
                                        </span>
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
