import type { CSSProperties, FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import GoldPillButton from '@/components/common/gold-pill-button';
import type { PrizeContent } from '@/types/member';

type Reward = {
    icon: string;
    period: string;

    text: string;
};

type Tier = {
    name: string;
    price: string;
    rewards: Reward[];
    footer: [string, string];
    cardBg: string;
    borderGradient: string;
    accent: string;
    footerBg: string;
};

const redTheme = {
    name: 'SLR Red',
    price: '$10 Month',
    weeklyIcon: '/icons/ic-red-cole.webp',
    monthlyIcon: '/icons/ic-red-gift.webp',
    footer: ['Low Cost.', 'Strong Weekly Rewards.'] as [string, string],
    cardBg: 'linear-gradient(180deg, #530710 0%, #000000 19.27%, #220408 71.42%, #470818 87.62%)',
    borderGradient: 'linear-gradient(180deg, #FF6B7A 10%, #C8152E 25%, #8B0010 75.24%, #C8152E 87.62%, #FF6B7A 100%)',
    accent: '#F24040',
    footerBg: 'linear-gradient(180deg, #F22E2E 0%, #A61212 100%)'
};

const blueTheme = {
    name: 'SLR Blue',
    price: '$26 Month',
    weeklyIcon: '/icons/ic-blue-cole.webp',
    monthlyIcon: '/icons/ic-blue-gift.webp',
    footer: ['Higher Tier.', 'Bigger Rewards.'] as [string, string],
    cardBg: 'linear-gradient(180deg, #0F2F7A 0%, #000207 10.41%, #000D35 63.57%, #0D2662 87.62%)',
    borderGradient: 'linear-gradient(180deg, #6AACFF 0%, #1A62C0 25%, #0A2E80 50%, #1A62C0 75%, #6AACFF 100%)',
    accent: '#6699FF',
    footerBg: 'linear-gradient(180deg, #4080FF 0%, #143399 100%)'
};

function toTier(theme: typeof redTheme, weekly: string, monthly: string): Tier {
    const { weeklyIcon, monthlyIcon, ...rest } = theme;

    return {
        ...rest,
        rewards: [
            { icon: weeklyIcon, period: 'Weekly', text: weekly },
            { icon: monthlyIcon, period: 'Monthly', text: monthly }
        ]
    };
}

type StatLine = { text: string; kind?: 'accent' | 'big' };
type Stat = { icon: string; iconClass: string; lines: StatLine[] };

function stageLines(stageLabel: string): StatLine[] {
    const [audience, stage] = stageLabel.split(/\s*[•·|]\s*/);

    if (!stage) return [{ text: stageLabel }];

    return [{ text: audience }, { text: `— ${stage} —`, kind: 'accent' }];
}

function buildStats(content: PrizeContent): Stat[] {
    return [
        {
            icon: '/icons/ic-people3d-gold.webp',
            iconClass: 'h-14 w-14',
            lines: stageLines(content.stage_label)
        },
        {
            icon: '/icons/ic-target3d-gold.webp',
            iconClass: 'h-14 w-14',
            lines: [
                { text: 'Focus on Members Level' },
                { text: 'Value, Rewards &' },
                { text: 'Cost of Living Support' }
            ]
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
            lines: [
                { text: '90.7%', kind: 'big' },
                { text: content.odds, kind: 'accent' }
            ]
        }
    ];
}

const statBarStyle: CSSProperties = {
    background: 'linear-gradient(180deg, #FFE073 0%, #C7992E 50%, #FFE073 100%)',
    boxShadow: '0px 0px 30px 0px #FFB23340, 0px 10px 20px 0px #00000080'
};

const TierCard: FC<{ tier: Tier; stageLabel: string }> = ({ tier, stageLabel }) => {
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
                    <p className='mt-3 text-sm font-semibold tracking-wider text-white/60 uppercase'>{stageLabel}</p>
                </div>

                <div className='flex flex-col gap-6 px-6 py-8'>
                    {tier.rewards.map((reward) => (
                        <div key={reward.period} className='flex items-center gap-4'>
                            <Image
                                src={reward.icon}
                                alt=''
                                width={80}
                                height={80}
                                className='h-16 w-16 shrink-0 object-contain'
                            />
                            <div className='min-w-0 text-left'>
                                <p
                                    style={{ color: tier.accent }}
                                    className='text-sm font-bold tracking-[0.2em] uppercase'>
                                    {reward.period}
                                </p>
                                <p className='mt-1 text-xl leading-tight font-extrabold whitespace-pre-line text-white sm:text-2xl'>
                                    {reward.text}
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

const RedBlueSection = ({ content }: { content: PrizeContent }) => {
    const stats = buildStats(content);

    return (
        <section className='relative isolate -mt-8 overflow-hidden bg-transparent py-16 md:-mt-12 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='grid grid-cols-1 items-stretch gap-5 md:grid-cols-2'>
                    <TierCard
                        tier={toTier(redTheme, content.red_weekly, content.red_monthly)}
                        stageLabel={content.stage_label}
                    />
                    <TierCard
                        tier={toTier(blueTheme, content.blue_weekly, content.blue_monthly)}
                        stageLabel={content.stage_label}
                    />
                </div>

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
                                                    className='text-xs font-semibold tracking-[0.15em] text-[#8C660D] uppercase'>
                                                    {line.text}
                                                </p>
                                            ) : (
                                                <p
                                                    key={line.text}
                                                    className='text-[11px] leading-tight font-extrabold tracking-[0.08em] text-[#212121] uppercase'>
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

                <div className='mx-auto mt-8 flex w-full max-w-xs flex-col gap-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center'>
                    <GoldPillButton href='/sign-up' className='w-full sm:w-auto'>
                        Join Us Now!
                    </GoldPillButton>
                    <Link
                        href='/membership'
                        className='inline-flex w-full items-center justify-center rounded-xl border border-[#FFD147] bg-[#FFD1471A] px-8 py-2.5 text-base font-bold tracking-wide text-[#FFDC75] uppercase shadow-[inset_0_1px_5px_rgba(255,220,117,0.15)] transition-all hover:bg-[#FFD147]/20 sm:w-auto lg:px-10 lg:py-3 lg:text-lg'>
                        Draw Rules
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RedBlueSection;
