import type { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import SectionHeading from '@/components/common/section-heading';
import { cn } from '@/lib/utils';

type TierCardProps = {
    image: string;
    width: number;
    height: number;
    alt: string;
    href: string;

    cta: string;

    className?: string;

    buttonClassName: string;
};

const TierCard: FC<TierCardProps> = ({ image, width, height, alt, href, cta, className, buttonClassName }) => (
    <div className={cn('relative w-full max-w-[18rem]', className)}>
        <Image src={image} alt={alt} width={width} height={height} className='h-auto w-full select-none' priority />
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

const SavingTiersSection = () => {
    return (
        <section id='saving-tiers' className='bg-slr-ink relative py-16 md:py-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <SectionHeading>
                    <span className='text-gradient-silver'>
                        Get your weekly draw tickets <br className='hidden sm:block' /> from $1.50 a week
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
                        image='/images/card-slr-red.webp'
                        width={795}
                        height={1164}
                        alt='SLR Red tier — $10 per month, Red Standard'
                        href='/sign-up'
                        cta='Join SLR Red'
                        className='sm:w-44 md:w-52 lg:w-60'
                        buttonClassName='inset-x-[10%] bottom-[4.9%] h-[10%]'
                    />
                    <TierCard
                        image='/images/card-slr-blue.webp'
                        width={795}
                        height={1164}
                        alt='SLR Blue tier — $26 per month, Blue Standard'
                        href='/sign-up'
                        cta='Join SLR Blue'
                        className='sm:w-44 md:w-52 lg:w-60'
                        buttonClassName='inset-x-[10%] bottom-[4.9%] h-[10%]'
                    />
                </div>
            </div>
        </section>
    );
};

export default SavingTiersSection;
