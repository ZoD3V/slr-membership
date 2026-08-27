import Image from 'next/image';

import GoldPillButton from '@/components/common/gold-pill-button';

const SlrRewardCarsSection = () => {
    return (
        <section className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-[2fr_3fr]'>
                    <div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
                        <Image
                            src='/images/slr-rewards-logo.webp'
                            alt='SLR Rewards'
                            width={4096}
                            height={1220}
                            className='h-9 w-auto md:h-11'
                        />

                        <h2 className='mt-6 text-[40px] leading-[1.05] font-extrabold tracking-tight uppercase sm:text-[52px] lg:text-[60px] xl:text-[68px]'>
                            <span className='text-gradient-silver block'>Rewards.</span>
                            <span className='text-gradient-gold block'>Giveaways.</span>
                            <span className='text-gradient-silver block'>Real Value.</span>
                        </h2>

                        <p className='mt-5 text-[10px] font-semibold tracking-[3px] text-white/70 uppercase sm:text-xs'>
                            Weekly <span className='text-slr-gold-label mx-1'>•</span> Monthly{' '}
                            <span className='text-slr-gold-label mx-1'>•</span> Member Benefits
                        </p>

                        <GoldPillButton href='/sign-up' className='mt-8'>
                            JOIN NOW
                        </GoldPillButton>
                    </div>

                    <Image
                        src='/images/bg-slr-car-reward.webp'
                        alt='SLR rewards — luxury car, cash and gift hamper giveaways'
                        width={1448}
                        height={1086}
                        className='h-auto w-full object-cover'
                    />
                </div>
            </div>
        </section>
    );
};

export default SlrRewardCarsSection;
