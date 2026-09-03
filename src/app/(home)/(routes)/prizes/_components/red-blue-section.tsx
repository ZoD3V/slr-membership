import type { CSSProperties, FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import GoldPillButton from '@/components/common/gold-pill-button';
import { BLUE_TIER_CARD, MONEY_ARTWORK, RED_TIER_CARD, type TierCardTheme } from '@/constant/tier-card-theme';
import { getTierPricing, minPriceOf } from '@/lib/tier-pricing';
import type { PrizeContent } from '@/types/member';

type Reward = {
    icon: string;
    period: string;

    text: string;
};

type Tier = TierCardTheme & {
    price: string;
    rewards: Reward[];
    footer: [string, string];
};

const redTheme = {
    ...RED_TIER_CARD,
    weeklyIcon: '/icons/ic-red-cole.webp',
    monthlyIcon: '/icons/ic-red-gift.webp',
    footer: ['Low Cost.', 'Strong Weekly Rewards.'] as [string, string]
};

const blueTheme = {
    ...BLUE_TIER_CARD,
    weeklyIcon: '/icons/ic-blue-cole.webp',
    monthlyIcon: '/icons/ic-blue-gift.webp',
    footer: ['Higher Tier.', 'Bigger Rewards.'] as [string, string]
};

function toTier(theme: typeof redTheme, price: string, weekly: string, monthly: string): Tier {
    const { weeklyIcon, monthlyIcon, ...rest } = theme;

    return {
        ...rest,
        price,
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
    const titleStyle: CSSProperties = { color: tier.accent, textShadow: `0px 0px 18px ${tier.accentGlow}` };

    return (
        <div className='rounded-2xl p-0.5' style={{ background: tier.borderGradient }}>
            <div
                className='relative flex h-full flex-col overflow-hidden rounded-[14px]'
                style={{ background: tier.surface }}>
                <div
                    aria-hidden='true'
                    className='absolute -top-2.5 left-0 z-0 h-52 w-full opacity-35'
                    style={{
                        background: `url('${MONEY_ARTWORK}') no-repeat center 20%`,
                        backgroundSize: 'cover',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                        filter: tier.moneyFilter
                    }}
                />

                <div className='relative z-10 flex flex-col items-center px-4 pt-8 text-center sm:px-6'>
                    <h3
                        style={titleStyle}
                        className='font-bebas-neue text-5xl font-bold tracking-wider uppercase sm:text-6xl'>
                        {tier.name}
                    </h3>
                    <span
                        style={{ border: `1px solid ${tier.pillBorder}` }}
                        className='mt-4 inline-block max-w-full rounded-full bg-black/50 px-6 py-2.5 text-lg font-bold tracking-wider whitespace-nowrap text-white uppercase sm:px-10 sm:py-3 sm:text-[22px]'>
                        From <span className='text-gradient-gold'>{tier.price}</span>
                    </span>
                    <p className='mt-4 text-sm font-bold tracking-widest text-white/60 uppercase sm:text-[15px]'>
                        {stageLabel}
                    </p>
                </div>

                <div className='relative z-10 flex flex-col gap-4 px-4 py-8 sm:px-6'>
                    {tier.rewards.map((reward) => (
                        <div
                            key={reward.period}
                            className='flex items-center gap-4 rounded-xl px-4 py-3'
                            style={{ backgroundColor: tier.prizeBox }}>
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

                <div
                    style={{ background: tier.footerBar, borderTop: '1px solid rgba(255,255,255,0.15)' }}
                    className='relative z-10 mt-auto px-3 py-3.5 text-center leading-tight'>
                    <p className='text-[clamp(12px,3.4vw,17px)] font-bold tracking-wider text-white uppercase md:text-[17px]'>
                        {tier.footer[0]}
                        <br />
                        {tier.footer[1]}
                    </p>
                </div>
            </div>
        </div>
    );
};

const RedBlueSection = async ({ content }: { content: PrizeContent }) => {
    const stats = buildStats(content);
    const pricing = await getTierPricing();
    const priceLabel = (group: 'red' | 'blue') => `$${minPriceOf(pricing, group) / 100}/month`;

    return (
        <section className='relative isolate -mt-8 overflow-hidden bg-transparent py-16 md:-mt-12 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='grid grid-cols-1 items-stretch gap-5 md:grid-cols-2'>
                    <TierCard
                        tier={toTier(redTheme, priceLabel('red'), content.red_weekly, content.red_monthly)}
                        stageLabel={content.stage_label}
                    />
                    <TierCard
                        tier={toTier(blueTheme, priceLabel('blue'), content.blue_weekly, content.blue_monthly)}
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
                        href='/giveaway-rules'
                        className='inline-flex w-full items-center justify-center rounded-xl border border-[#FFD147] bg-[#FFD1471A] px-8 py-2.5 text-base font-bold tracking-wide text-[#FFDC75] uppercase shadow-[inset_0_1px_5px_rgba(255,220,117,0.15)] transition-all hover:bg-[#FFD147]/20 sm:w-auto lg:px-10 lg:py-3 lg:text-lg'>
                        Draw Rules
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RedBlueSection;
