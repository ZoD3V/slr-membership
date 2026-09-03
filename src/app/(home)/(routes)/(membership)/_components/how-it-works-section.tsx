import type { ReactNode } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import GoldPillButton from '@/components/common/gold-pill-button';
import SectionEyebrow from '@/components/common/section-eyebrow';
import { LIVE_DRAW_URL } from '@/constant/links';
import { BENY_MONTHLY_PRICE } from '@/constant/tiers';
import { weeklyPriceLabel } from '@/lib/prize-content';
import { getTierPricing, minPriceOf } from '@/lib/tier-pricing';
import { cn } from '@/lib/utils';

import { ArrowRight } from 'lucide-react';

type Step = {
    badge: string;
    icon: string;
    title: string;
    kicker: string;
    body: ReactNode;
    cta: { label: string; href: string; external?: boolean };
    footnote?: { label: string; href: string };
    featured?: boolean;
};

const Strong = ({ children }: { children: ReactNode }) => (
    <strong className='font-bold text-[#0A0A0A]'>{children}</strong>
);

const buildSteps = (redFrom: number, blueFrom: number, redWeekly: string): Step[] => [
    {
        badge: 'Step 01',
        icon: '/icons/ic-person-circle.png',
        title: 'Choose Your Tier',
        kicker: `From $${redWeekly} / Week`,
        body: (
            <>
                Pick <Strong>{`Red ($${redFrom}/mo)`}</Strong> or <Strong>{`Blue ($${blueFrom}/mo)`}</Strong> across 2
                separate draw pools. Level up to Blue for larger prize pools &amp; higher stakes.
            </>
        ),
        cta: { label: 'View Tiers', href: '#tiers' }
    },
    {
        badge: 'Step 02',
        icon: '/icons/ic-prize-circle.png',
        title: 'Weekly Prize Draws',
        kicker: 'Live Draws Every Friday Night',
        body: (
            <>
                Get auto-entered into <Strong>up to 10 draws every Friday</Strong>. Spin monthly to win direct discounts
                on your subscription bill &amp; lower your cost.
            </>
        ),
        cta: { label: 'See Live Draw', href: LIVE_DRAW_URL, external: true },
        footnote: { label: 'Visit Giveaway Rules', href: '/giveaway-rules' },
        featured: true
    },
    {
        badge: 'Step 03',
        icon: '/icons/ic-star-circle.png',
        title: 'Everyday Discounts',
        kicker: `Beny ($${BENY_MONTHLY_PRICE}/mo Add-On)`,
        body: (
            <>
                Add Beny for <Strong>{`$${BENY_MONTHLY_PRICE}/mo`}</Strong> to unlock hundreds of instant{' '}
                <Strong>discounts on fuel, groceries, and dining</Strong> across Australia to save every day.
            </>
        ),
        cta: { label: 'Explore Discounts', href: '/membership#beny' }
    }
];

const StepCard = ({ step }: { step: Step }) => {
    const ctaClass = cn(
        'flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-90 sm:text-sm',
        step.featured ? 'bg-[#0A0A0A] text-[#FFDC75]' : 'border border-[#C78C14] bg-transparent text-[#1A1308]'
    );

    return (
        <div className='bg-gradient-gold flex h-full flex-col rounded-3xl p-0.75 shadow-[0_0_28px_rgba(212,175,55,0.25)]'>
            <div className='bg-slr-navy-deep flex flex-1 flex-col rounded-[21px] p-1.5'>
                <div
                    className={cn(
                        'flex flex-1 flex-col items-center rounded-2xl px-6 pt-8 pb-7 text-center',
                        step.featured
                            ? 'border border-[#8C660D] bg-[linear-gradient(180deg,#FFE066_0%,#F5C22E_50%,#C78C14_100%)]'
                            : 'bg-[linear-gradient(180deg,#FFFFFF_0%,#E5E5E5_100%)]'
                    )}>
                    <div className='mb-4 flex items-center justify-center'>
                        <Image
                            src={step.icon}
                            alt=''
                            width={120}
                            height={120}
                            className='h-16 w-16 object-contain sm:h-20 sm:w-20'
                        />
                    </div>

                    <span
                        className={cn(
                            'mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-bold tracking-widest text-[#FFDC75] uppercase',
                            step.featured
                                ? 'border border-[#8C660D] bg-[#0A0A0A]'
                                : 'border border-[#C78C14] bg-[#14171A]'
                        )}>
                        {step.badge}
                    </span>

                    <h3 className='text-lg leading-tight font-extrabold tracking-wide text-[#0A0A0A] uppercase sm:text-xl lg:text-2xl'>
                        {step.title}
                    </h3>

                    <p
                        className={cn(
                            'mt-1 text-xs font-bold tracking-wider uppercase',
                            step.featured ? 'text-[#3D2800]' : 'text-[#997314]'
                        )}>
                        {step.kicker}
                    </p>

                    <div className={cn('my-3 h-px w-10', step.featured ? 'bg-[#8C660D]/40' : 'bg-[#C78C14]/30')} />

                    <p
                        className={cn(
                            'mt-1 max-w-xs text-sm leading-relaxed',
                            step.featured ? 'text-[#1A1308]' : 'text-[#2F2F2F]'
                        )}>
                        {step.body}
                    </p>

                    <div className='mt-auto flex w-full flex-col items-center pt-6'>
                        {step.cta.external ? (
                            <a href={step.cta.href} target='_blank' rel='noopener noreferrer' className={ctaClass}>
                                {step.cta.label}
                                <ArrowRight className='h-4 w-4' strokeWidth={2.5} />
                            </a>
                        ) : (
                            <Link href={step.cta.href} className={ctaClass}>
                                {step.cta.label}
                                <ArrowRight className='h-4 w-4' strokeWidth={2.5} />
                            </Link>
                        )}

                        {step.footnote ? (
                            <Link
                                href={step.footnote.href}
                                className='mt-4 flex h-6 items-center text-[10px] font-bold tracking-widest text-[#5C4308] uppercase underline transition-colors hover:text-[#1A1308]'>
                                {step.footnote.label}
                            </Link>
                        ) : (
                            <div className='mt-4 h-6' />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HowItWorksSection = async () => {
    const pricing = await getTierPricing();
    const redFrom = minPriceOf(pricing, 'red') / 100;
    const blueFrom = minPriceOf(pricing, 'blue') / 100;
    const steps = buildSteps(
        redFrom,
        blueFrom,
        weeklyPriceLabel(minPriceOf(pricing, 'red')).replace('$', '').replace('/week', '')
    );

    return (
        <section id='how-it-works' className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='flex flex-col'>
                    <SectionEyebrow
                        label='Simple 3-Step Process'
                        color='#E2B42B'
                        lineColor='#B08A20'
                        className='mt-4'
                    />
                    <h2 className='font-bebas-neue mt-3 text-center text-6xl font-medium tracking-wider text-white uppercase md:text-7xl lg:text-[80px] xl:text-[90px]'>
                        <span className='text-gradient-gold block md:ml-3 md:inline'>How It Works</span>
                    </h2>
                </div>

                <div className='mx-auto mt-12 grid max-w-6xl grid-cols-1 items-stretch gap-8 md:grid-cols-3 md:gap-6 lg:gap-8'>
                    {steps.map((step) => (
                        <StepCard key={step.badge} step={step} />
                    ))}
                </div>

                <div className='mt-16 flex flex-col items-center justify-center gap-6 md:mt-20'>
                    <div className='flex w-full items-center justify-center gap-4'>
                        <div
                            className='h-px w-12 sm:w-20 lg:w-32'
                            style={{ background: 'linear-gradient(270deg, #B08A20 0%, rgba(255,255,255,0) 100%)' }}
                            aria-hidden='true'
                        />
                        <h2 className='font-bebas-neue text-center text-4xl leading-none font-medium tracking-wider uppercase sm:text-5xl lg:text-[56px] xl:text-[64px]'>
                            <span className='text-gradient-gold'>SLR Saving &amp; Rewards Club</span>
                        </h2>
                        <div
                            className='h-px w-12 sm:w-20 lg:w-32'
                            style={{ background: 'linear-gradient(90deg, #B08A20 0%, rgba(255,255,255,0) 100%)' }}
                            aria-hidden='true'
                        />
                    </div>

                    <GoldPillButton href='/sign-up' withArrow={false}>
                        JOIN NOW
                    </GoldPillButton>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
