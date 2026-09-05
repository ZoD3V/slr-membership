import Image from 'next/image';

import { Reveal } from '@/components/common/reveal';
import SectionEyebrow from '@/components/common/section-eyebrow';
import SectionHeading from '@/components/common/section-heading';

/** Cards land one after another rather than as a block, so the eye reads them in order. */
const CARD_DELAY = [0.4, 1.1, 1.8];

type Feature = {
    number: string;
    icon: string;
    title: string;
    description: string;

    stat?: { value: string; label: string };

    tiers?: boolean;
};

const features: Feature[] = [
    {
        number: '01',
        icon: '/icons/ic-calendar-gold.png',
        title: 'Cash Given Away Weekly',
        description:
            'Say goodbye to endless waiting. By breaking our huge prize pools down into weekly cash drops, your next chance to win is never more than a few days away.',
        stat: { value: 'Weekly', label: 'Prize Draws' }
    },
    {
        number: '02',
        icon: '/icons/ic-trophy3d-gold.webp',
        title: 'Yes, You Can Win Multiple Times',
        description:
            "Winning once doesn't knock you out! Your entries stay active for the entire month. Stack more entries to multiply your chances of winning cash over and over again.",
        stat: { value: 'Up To 4', label: 'Multiple Wins' }
    },
    {
        number: '03',
        icon: '/icons/ic-scales-gold.png',
        title: 'Stop Competing With Millions',
        description:
            "We don't dump everyone into one massive, impossible pool. By separating members into exclusive Red and Blue tiers, your odds of winning skyrocket compared to standard crowded giveaways.",
        tiers: true
    }
];

const TrustedSection = () => {
    return (
        <section className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <SectionEyebrow label='Platform Advantages' color='#E2B42B' lineColor='#B08A20' />

                <SectionHeading className='mt-4'>
                    <span className='text-gradient-silver'>Why </span>
                    <span className='text-gradient-gold'>Members Choose SLR</span>
                </SectionHeading>

                <p className='text-slr-muted mx-auto mt-4 max-w-2xl text-center text-sm md:text-base'>
                    Our platform is built to give members{' '}
                    <span className='font-semibold text-[#FFD959]'>more chances to win</span>,{' '}
                    <span className='font-semibold text-[#FFD959]'>multiple wins per cycle</span>, and{' '}
                    <span className='font-semibold text-[#FFD959]'>better odds</span> through a tiered weekly-draw
                    structure.
                </p>

                <div className='mt-12 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3'>
                    {features.map((feature, index) => (
                        <Reveal
                            key={feature.number}
                            delay={CARD_DELAY[index] ?? 0}
                            className='bg-card-dark-navy shadow-card-soft flex h-full flex-col rounded-2xl border border-[#A0B4D259] p-6'>
                            <div className='flex items-start justify-between'>
                                <span className='font-bebas-neue text-gradient-gold text-[44px] leading-none font-extrabold'>
                                    {feature.number}
                                </span>
                                <Image
                                    src={feature.icon}
                                    alt=''
                                    width={56}
                                    height={56}
                                    className='h-12 w-12 sm:h-14 sm:w-14'
                                />
                            </div>

                            <h3 className='mt-6 text-lg font-bold tracking-wide text-white uppercase'>
                                {feature.title}
                            </h3>

                            <p className='text-slr-dim mt-3 text-sm leading-relaxed'>{feature.description}</p>

                            <div className='mt-auto pt-8'>
                                {feature.stat ? (
                                    <div className='inline-flex items-center gap-3 rounded-lg border border-[#403314] bg-[#14171A] px-4 py-2.5'>
                                        <span className='font-bebas-neue text-gradient-gold text-xl leading-none font-bold'>
                                            {feature.stat.value}
                                        </span>
                                        <span className='h-4 w-px bg-[#403314]' />
                                        <span className='text-slr-muted text-[10px] font-semibold tracking-widest uppercase'>
                                            {feature.stat.label}
                                        </span>
                                    </div>
                                ) : (
                                    <div className='flex flex-wrap gap-2'>
                                        <span className='inline-flex items-center gap-1.5 rounded-full border border-[#F0212159] bg-[#240505] px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#F02121] uppercase'>
                                            <span className='h-1.5 w-1.5 rounded-full bg-[#F02121]' />
                                            Red Tier
                                        </span>
                                        <span className='inline-flex items-center gap-1.5 rounded-full border border-[#3873F759] bg-[#081125] px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#3873F7] uppercase'>
                                            <span className='h-1.5 w-1.5 rounded-full bg-[#3873F7]' />
                                            Blue Tier
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustedSection;
