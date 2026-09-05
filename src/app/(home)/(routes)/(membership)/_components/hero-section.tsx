import Image from 'next/image';

import GoldOutlineButton from '@/components/common/gold-outline-button';
import GoldPillButton from '@/components/common/gold-pill-button';
import { FadeUp, MaskSlideUp } from '@/components/common/reveal';
import { compareAnnouncements, getRunningText } from '@/lib/api/resources/announcements';

const FALLBACK_TICKER = [
    '$2,100 PRIZE POOL',
    'ONLY 100 MEMBERS COMPETING',
    'ODDS 9 IN 10 P/A',
    'UP TO 10 PRIZE DRAWS EVERY FRIDAY'
];

// The headline pair lands first, then the strapline, then everything below it.
const STEP = { headline: 0.2, strapline: 1.5, rest: 2.7 };

async function loadTickerSegments(): Promise<string[]> {
    try {
        const announcements = (await getRunningText()).filter((item) => item.is_active).sort(compareAnnouncements);

        const segments = announcements
            .flatMap((item) => item.content.split('•'))
            .map((segment) => segment.trim())
            .filter(Boolean);

        return segments.length > 0 ? segments : FALLBACK_TICKER;
    } catch {
        return FALLBACK_TICKER;
    }
}

const HeroSection = async () => {
    const tickerSegments = await loadTickerSegments();

    return (
        <section className='bg-slr-ink relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20'>
            <div className='relative z-20 mx-auto max-w-7xl px-4'>
                <div className='mb-8 flex justify-center'>
                    <Image
                        src='/images/slr-rewards-logo-color.webp'
                        alt='SLR Rewards'
                        width={140}
                        height={140}
                        priority
                        className='h-20 w-auto md:h-24'
                    />
                </div>

                <div className='mb-5 text-center'>
                    <MaskSlideUp delay={STEP.headline}>
                        <h1 className='text-xl font-semibold text-white uppercase md:text-2xl xl:text-3xl'>
                            Australia&apos;s <span className='text-red-600'>Best Value</span>
                        </h1>
                    </MaskSlideUp>

                    {/* The display drop-shadow spills well past the text box, so the clip needs headroom. */}
                    <MaskSlideUp delay={STEP.headline} bleed={60}>
                        <h1 className='text-gradient-silver text-center text-[34px] leading-[100%] font-extrabold tracking-[0.03em] drop-shadow-[-3.78px_15.12px_33.65px_rgba(12,13,67,0.37)] [leading-trim:cap-height] sm:text-[54px] md:text-[64px] xl:text-[72px]'>
                            REWARDS CLUB
                        </h1>
                    </MaskSlideUp>

                    <MaskSlideUp delay={STEP.strapline} className='mt-4 flex w-full items-center justify-center gap-2'>
                        <div className='h-px w-8 bg-[linear-gradient(270deg,#FFFFFF_0%,#14171A_100%)]' />

                        <p className='text-xs font-semibold text-[#E8E9E9] uppercase md:text-sm'>
                            Helping Australians Beat the Cost of Living
                        </p>

                        <div className='h-px w-8 bg-[linear-gradient(90deg,#FFFFFF_0%,#14171A_100%)]' />
                    </MaskSlideUp>
                </div>

                <FadeUp delay={STEP.rest} className='mb-8 flex justify-center'>
                    <Image
                        src='/images/slr-list-reward.webp'
                        alt='List SLR Rewards'
                        width={420}
                        height={420}
                        priority
                        className='h-auto w-auto'
                    />
                </FadeUp>

                <FadeUp
                    delay={STEP.rest}
                    className='mx-auto mt-8 flex w-full max-w-sm flex-row justify-center gap-2 px-2 sm:max-w-none sm:gap-4'>
                    <GoldPillButton
                        href='/sign-up'
                        className='w-1/2 gap-1 px-2 py-2.5 text-[12px] whitespace-nowrap sm:w-auto sm:gap-2 sm:px-8 sm:text-base sm:whitespace-normal'>
                        JOIN NOW
                    </GoldPillButton>
                    <GoldOutlineButton
                        href='#current-prizes'
                        className='w-1/2 px-2 py-2.5 text-[12px] whitespace-nowrap sm:w-auto sm:px-8 sm:text-base sm:whitespace-normal'>
                        View Prizes
                    </GoldOutlineButton>
                </FadeUp>

                <FadeUp delay={STEP.rest} className='relative mt-12 flex justify-center'>
                    <div className='relative w-full max-w-7xl'>
                        <Image
                            src='/images/giveaway-win.webp'
                            alt='Giveaway and Win Cash Prizes'
                            width={1200}
                            height={700}
                            priority
                            className='h-auto w-full object-contain'
                        />

                        <div
                            aria-hidden='true'
                            className='pointer-events-none absolute overflow-hidden'
                            style={{
                                left: '5%',
                                right: '5%',
                                top: '74%',
                                height: '19%'
                            }}>
                            <div
                                className='animate-marquee flex h-full w-max items-center whitespace-nowrap will-change-transform'
                                style={{ animationDuration: '65s' }}>
                                {Array.from({ length: 2 }).map((_, group) => (
                                    <div key={group} className='flex items-center'>
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <span
                                                key={i}
                                                className='text-gradient-gold flex items-center gap-3 px-6 text-xl font-bold tracking-[0.18em] uppercase sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'>
                                                {tickerSegments.map((segment, index) => (
                                                    <span key={index} className='flex items-center gap-3'>
                                                        <span className={index === 0 ? undefined : 'text-white/90'}>
                                                            {segment}
                                                        </span>
                                                        <span className='bg-gradient-gold inline-block h-1.5 w-1.5 rounded-full' />
                                                    </span>
                                                ))}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </div>
        </section>
    );
};

export default HeroSection;
