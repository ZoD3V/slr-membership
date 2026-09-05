import type { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import SectionHeading from '@/components/common/section-heading';
import { weeklyPriceLabel } from '@/lib/prize-content';
import { getTierPricing, minPriceOf } from '@/lib/tier-pricing';
import { cn } from '@/lib/utils';

type TierCardProps = {
    image: string;
    width: number;
    height: number;
    alt: string;
    href: string;

    cta: string;

    /** Rendered over the artwork's cleared price band, so the card follows live pricing. */
    price: string;

    className?: string;

    buttonClassName: string;
};

const TierCard: FC<TierCardProps> = ({ image, width, height, alt, href, cta, price, className, buttonClassName }) => (
    <div className={cn('relative w-full max-w-[18rem]', className)} style={{ containerType: 'inline-size' }}>
        <Image src={image} alt={alt} width={width} height={height} className='h-auto w-full select-none' priority />
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 flex flex-col items-center leading-none font-extrabold text-white'
            style={{ top: '25.8%' }}>
            <span style={{ fontSize: '21cqw' }}>{price}</span>
            <span className='tracking-[0.12em]' style={{ fontSize: '7.5cqw', marginTop: '1.5cqw' }}>
                /WEEK
            </span>
        </div>
        <Link
            href={href}
            aria-label={cta}
            className={cn(
                'absolute rounded-md focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
                buttonClassName
            )}
        />
    </div>
);

const SavingTiersSection = async () => {
    const pricing = await getTierPricing();
    const redWeekly = weeklyPriceLabel(minPriceOf(pricing, 'red')).replace('/week', '');
    const blueWeekly = weeklyPriceLabel(minPriceOf(pricing, 'blue')).replace('/week', '');

    return (
        <section id='saving-tiers' className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <SectionHeading>
                    <span className='text-gradient-silver'>
                        Get your weekly draw tickets <br className='hidden sm:block' /> from {redWeekly} a week
                    </span>
                </SectionHeading>

                <p
                    className='mt-4 bg-clip-text text-center text-xs font-semibold tracking-[0.2em] text-transparent uppercase sm:text-sm'
                    style={{
                        backgroundImage:
                            'linear-gradient(89.12deg, #F5D68C 3.07%, #D4AD36 41.36%, #FFDE66 60.5%, #9E6E17 98.79%)'
                    }}>
                    Rewards <span className='mx-2'>•</span> Discounts <span className='mx-2'>•</span> Bonus Giveaways
                </p>

                <div className='mt-4 flex justify-center'>
                    <Image
                        src='/images/knotted-rope.png'
                        alt=''
                        width={960}
                        height={90}
                        className='h-auto w-56 sm:w-72'
                    />
                </div>

                <div className='mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-4 lg:gap-8'>
                    <TierCard
                        image='/images/card-slr-red-v2.webp'
                        width={795}
                        height={1164}
                        alt='SLR Red tier — Red Standard'
                        href='/sign-up'
                        cta='Join SLR Red'
                        price={redWeekly}
                        className='sm:w-44 md:w-52 lg:w-60'
                        buttonClassName='inset-x-[10%] bottom-[4.9%] h-[10%]'
                    />
                    <TierCard
                        image='/images/card-slr-blue-v2.webp'
                        width={795}
                        height={1164}
                        alt='SLR Blue tier — Blue Standard'
                        href='/sign-up'
                        cta='Join SLR Blue'
                        price={blueWeekly}
                        className='sm:w-44 md:w-52 lg:w-60'
                        buttonClassName='inset-x-[10%] bottom-[4.9%] h-[10%]'
                    />
                </div>
            </div>
        </section>
    );
};

export default SavingTiersSection;
