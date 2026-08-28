import Image from 'next/image';
import Link from 'next/link';

import GoldPillButton from '@/components/common/gold-pill-button';

const HeroSection = () => {
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
                    <h1 className='text-xl font-semibold text-white uppercase md:text-2xl xl:text-3xl'>
                        Australia&apos;s <span className='text-red-600'>Best Value</span>
                    </h1>
                    <h1 className='text-gradient-silver text-center text-[34px] leading-[100%] font-extrabold tracking-[0.03em] drop-shadow-[-3.78px_15.12px_33.65px_rgba(12,13,67,0.37)] [leading-trim:cap-height] sm:text-[54px] md:text-[64px] xl:text-[72px]'>
                        REWARDS CLUB
                    </h1>

                    <div className='mt-4 flex w-full items-center justify-center gap-2'>
                        <div className='h-px w-8 bg-[linear-gradient(270deg,#FFFFFF_0%,#14171A_100%)]'></div>

                        <p className='text-xs font-semibold text-[#E8E9E9] uppercase md:text-sm'>
                            Helping Australians Beat the Cost of Living
                        </p>

                        <div className='h-px w-8 bg-[linear-gradient(90deg,#FFFFFF_0%,#14171A_100%)]'></div>
                    </div>
                </div>

                <div className='mb-8 flex justify-center'>
                    <Image
                        src='/images/slr-list-reward.webp'
                        alt='List SLR Rewards'
                        width={420}
                        height={420}
                        priority
                        className='h-auto w-auto'
                    />
                </div>

                <div className='mx-auto mt-8 flex w-full max-w-xs flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center'>
                    <GoldPillButton href='/sign-up' className='w-full sm:w-auto'>
                        JOIN NOW
                    </GoldPillButton>
                    <Link
                        href='/membership'
                        className='inline-flex w-full items-center justify-center rounded-xl border border-[#FFD147] bg-[#FFD1471A] px-8 py-2.5 text-base font-bold tracking-wide text-[#FFDC75] uppercase shadow-[inset_0_1px_5px_rgba(255,220,117,0.15)] transition-all hover:bg-[#FFD147]/20 sm:w-auto lg:px-10 lg:py-3 lg:text-lg'>
                        View Membership
                    </Link>
                </div>

                <div className='relative mt-12 flex justify-center'>
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
                                                <span>$2,100 PRIZE POOL</span>
                                                <span className='bg-gradient-gold inline-block h-1.5 w-1.5 rounded-full' />
                                                <span className='text-white/90'>ONLY 100 MEMBERS COMPETING</span>
                                                <span className='bg-gradient-gold inline-block h-1.5 w-1.5 rounded-full' />
                                                <span className='text-white/90'>ODDS 9 IN 10 P/A</span>
                                                <span className='bg-gradient-gold inline-block h-1.5 w-1.5 rounded-full' />
                                                <span className='text-white/90'>4-6 PRIZE DRAWS EVERY FRIDAY</span>
                                                <span className='bg-gradient-gold inline-block h-1.5 w-1.5 rounded-full' />
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
