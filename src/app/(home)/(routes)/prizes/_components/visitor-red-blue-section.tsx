import type { CSSProperties, FC } from 'react';

import Image from 'next/image';

import GoldPillButton from '@/components/common/gold-pill-button';

type Reward = {
    icon: string;
    period?: string;
    amount: string;
    caption: string;
};

type Tier = {
    name: string;
    price: string;
    meta: string;
    rewards: Reward[];
    footer: [string, string];
    cardBg: string;
    borderGradient: string;
    accent: string;
    footerBg: string;
};

const redTier: Tier = {
    name: 'SLR Red',
    price: '$10 Month',
    meta: 'For 100 Members · Stage 1',
    rewards: [
        { icon: '/icons/ic-red-cole.webp', period: 'Weekly', amount: '$25', caption: 'Coles Credits' },
        { icon: '/icons/ic-red-coin.webp', amount: '$50', caption: 'Cash' },
        { icon: '/icons/ic-red-gift.webp', period: 'Monthly', amount: '$300', caption: 'Bonus Monthly Credit' }
    ],
    footer: ['Low Cost.', 'Strong Weekly Rewards.'],
    cardBg: 'linear-gradient(180deg, #530710 0%, #000000 19.27%, #220408 71.42%, #470818 87.62%)',
    borderGradient: 'linear-gradient(180deg, #FF6B7A 10%, #C8152E 25%, #8B0010 75.24%, #C8152E 87.62%, #FF6B7A 100%)',
    accent: '#F24040',
    footerBg: 'linear-gradient(180deg, #F22E2E 0%, #A61212 100%)'
};

const blueTier: Tier = {
    name: 'SLR Blue',
    price: '$26 Month',
    meta: 'For 100 Members · Stage 1',
    rewards: [
        { icon: '/icons/ic-blue-cole.webp', period: 'Weekly', amount: '$25', caption: 'Coles Credits' },
        { icon: '/icons/ic-blue-coin.webp', amount: '$150', caption: 'Cash' },
        { icon: '/icons/ic-blue-gift.webp', period: 'Monthly', amount: '$700', caption: 'Bonus Monthly Credit' }
    ],
    footer: ['Higher Tier.', 'Bigger Rewards.'],
    cardBg: 'linear-gradient(180deg, #0F2F7A 0%, #000207 10.41%, #000D35 63.57%, #0D2662 87.62%)',
    borderGradient: 'linear-gradient(180deg, #6AACFF 0%, #1A62C0 25%, #0A2E80 50%, #1A62C0 75%, #6AACFF 100%)',
    accent: '#6699FF',
    footerBg: 'linear-gradient(180deg, #4080FF 0%, #143399 100%)'
};

type StatLine = { text: string; kind?: 'accent' | 'big' };
type Stat = { icon: string; iconClass: string; lines: StatLine[] };

const stats: Stat[] = [
    {
        icon: '/icons/ic-people3d-gold.webp',
        iconClass: 'h-14 w-14',
        lines: [{ text: 'For 100 Members' }, { text: '— Stage 1 —', kind: 'accent' }]
    },
    {
        icon: '/icons/ic-target3d-gold.webp',
        iconClass: 'h-14 w-14',
        lines: [{ text: 'Focus on Members Level' }, { text: 'Value, Rewards &' }, { text: 'Cost of Living Support' }]
    },
    {
        icon: '/icons/ic-pricetag3d-gold.webp',
        iconClass: 'h-14 w-14',
        lines: [{ text: 'Membership' }, { text: '— Discounts —', kind: 'accent' }, { text: 'Rewards' }]
    },
    {
        icon: '/icons/ic-r-b.png',
        iconClass: 'h-11 w-auto',
        lines: [{ text: 'Odds Vary' }, { text: 'Based on Membership' }, { text: 'Levels & Total Members' }]
    },
    {
        icon: '/icons/ic-trophy3d-gold.webp',
        iconClass: 'h-14 w-14',
        lines: [{ text: '90.7%', kind: 'big' }, { text: '— 9 in 10 —', kind: 'accent' }, { text: 'Wins Yearly' }]
    }
];

const statBarStyle: CSSProperties = {
    background: 'linear-gradient(180deg, #FFE073 0%, #C7992E 50%, #FFE073 100%)',
    boxShadow: '0px 0px 30px 0px #FFB23340, 0px 10px 20px 0px #00000080'
};

const TierCard: FC<{ tier: Tier }> = ({ tier }) => {
    const titleStyle: CSSProperties = { color: tier.accent, textShadow: `0px 0px 18px ${tier.accent}80` };

    return (
        <div className='rounded-2xl p-0.5' style={{ background: tier.borderGradient }}>
            <div
                className='flex h-full flex-col overflow-hidden rounded-[calc(1rem-2px)]'
                style={{ background: tier.cardBg }}>
                <div className='flex flex-col items-center px-6 pt-8 text-center'>
                    <h3
                        style={titleStyle}
                        className='font-bebas-neue text-4xl font-bold tracking-wider uppercase sm:text-5xl'>
                        {tier.name}
                    </h3>
                    <span
                        style={{ border: `1px solid ${tier.accent}` }}
                        className='mt-3 rounded-full bg-black/30 px-4 py-1 text-sm font-bold tracking-wider text-white uppercase'>
                        {tier.price}
                    </span>
                    <p className='mt-3 text-xs font-semibold tracking-widest text-white/60 uppercase'>
                        {tier.meta}
                    </p>
                </div>

                <div className='flex flex-col gap-6 px-6 py-8'>
                    {tier.rewards.map((reward) => (
                        <div key={reward.caption} className='flex items-center gap-4'>
                            <Image
                                src={reward.icon}
                                alt=''
                                width={80}
                                height={80}
                                className='h-16 w-16 shrink-0 object-contain'
                            />
                            <div className='min-w-0 text-left'>
                                {reward.period && (
                                    <p
                                        style={{ color: tier.accent }}
                                        className='text-sm font-bold tracking-[0.2em] uppercase'>
                                        {reward.period}
                                    </p>
                                )}
                                <p className='text-4xl leading-none font-extrabold text-white'>{reward.amount}</p>
                                <p className='mt-1.5 text-xs font-bold tracking-[0.15em] text-white/90 uppercase'>
                                    {reward.caption}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ background: tier.footerBg }} className='mt-auto px-6 py-5 text-center leading-tight'>
                    <p className='text-sm font-bold tracking-wide text-white uppercase'>
                        {tier.footer[0]}
                        <br />
                        {tier.footer[1]}
                    </p>
                </div>
            </div>
        </div>
    );
};

const VisitorCard = () => (
    <div className='flex h-full flex-col items-center rounded-2xl bg-[#F1FBFE] px-6 py-8 text-center'>
        <h3 className='font-bebas-neue text-4xl font-bold tracking-wider text-[#0A0A0A] uppercase sm:text-5xl'>
            Visitor
        </h3>
        <span className='mt-3 rounded-full border border-[#0A0A0A]/40 px-4 py-1 text-sm font-bold tracking-wider text-[#0A0A0A] uppercase'>
            Free To Join
        </span>

        <Image
            src='/icons/ic-visitor-cole.webp'
            alt='Coles gift card'
            width={320}
            height={220}
            className='mt-8 h-auto w-40 object-contain sm:w-48'
        />

        <p className='mt-8 text-sm font-bold tracking-[0.2em] text-[#0A0A0A] uppercase'>Weekly</p>
        <p className='text-7xl leading-none font-extrabold text-[#0A0A0A] sm:text-8xl'>$25</p>
        <p className='mt-2 text-xs font-bold tracking-[0.15em] text-[#0A0A0A]/80 uppercase'>Coles Digital Credit</p>

        <div className='my-6 h-px w-24 bg-[#D1A62E]' />

        <div className='mt-auto flex items-center gap-2'>
            <Image
                src='/icons/ic-check-circle.png'
                alt=''
                width={20}
                height={20}
                className='h-5 w-5 shrink-0 object-contain'
            />
            <span className='text-xs font-bold tracking-[0.12em] text-[#0A0A0A] uppercase'>
                Access to Discounts &amp; Partner Offers
            </span>
        </div>
    </div>
);

const VisitorRedBlueSection = () => {
    return (
        <section className='bg-transparent relative isolate overflow-hidden py-16 md:py-24 -mt-8 md:-mt-12'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='grid grid-cols-1 items-stretch gap-5 md:grid-cols-3'>
                    <TierCard tier={redTier} />
                    <VisitorCard />
                    <TierCard tier={blueTier} />
                </div>

                {/* Stats bar */}
                <div className='mt-10 rounded-2xl p-0.5' style={statBarStyle}>
                    <div className='rounded-[calc(1rem-2px)] bg-[#F7F7F5] px-4 py-5'>
                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:divide-x lg:divide-black/10'>
                            {stats.map((stat) => (
                                <div key={stat.lines[0].text} className='flex items-center gap-3 lg:px-5'>
                                    <Image
                                        src={stat.icon}
                                        alt=''
                                        width={64}
                                        height={64}
                                        className={`shrink-0 object-contain ${stat.iconClass}`}
                                    />
                                    <div className='min-w-0 text-left'>
                                        {stat.lines.map((line) =>
                                            line.kind === 'big' ? (
                                                <p
                                                    key={line.text}
                                                    className='text-2xl leading-none font-extrabold text-[#8C660D]'>
                                                    {line.text}
                                                </p>
                                            ) : line.kind === 'accent' ? (
                                                <p
                                                    key={line.text}
                                                    className='text-[11px] font-semibold tracking-[0.15em] text-[#8C660D] uppercase'>
                                                    {line.text}
                                                </p>
                                            ) : (
                                                <p
                                                    key={line.text}
                                                    className='text-[10px] leading-tight font-extrabold tracking-[0.08em] text-[#212121] uppercase'>
                                                    {line.text}
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='mt-8 flex justify-center'>
                    <GoldPillButton href='/sign-up'>Join Us Now!</GoldPillButton>
                </div>
            </div>
        </section>
    );
};

export default VisitorRedBlueSection;
