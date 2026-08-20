import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

const SlrLifeTiersSection = () => {
    return (
        <section className='bg-slr-ink relative isolate overflow-hidden py-16 md:py-24'>
            <div className='mx-auto flex max-w-7xl flex-col items-center px-4 text-center'>
                <p className='text-slr-muted text-[10px] font-semibold tracking-[0.25em] uppercase sm:text-xs md:text-sm'>
                    Visit Prizes, Bonus &amp; Promotions
                </p>

                <div className='relative mt-4 md:mt-5'>
                    <div
                        aria-hidden='true'
                        className='pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[140%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,#D4AF3759_0%,#D4AF3700_65%)] blur-2xl'
                    />
                    <h2 className='text-gradient-gold font-bebas-neue text-[52px] leading-none tracking-wider uppercase sm:text-[72px] md:text-[88px] xl:text-[104px]'>
                        SLR Membership Club
                    </h2>
                </div>

                <Link
                    href='/membership'
                    className='text-slr-gold-label mt-8 inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[#D1A62E] bg-[#212429] px-8 py-3 text-sm font-bold tracking-[0.18em] uppercase transition-colors hover:bg-[#2A2E34] sm:px-10 sm:text-base md:mt-10'>
                    Explore All Tiers
                    <ArrowRight className='h-4 w-4 sm:h-5 sm:w-5' />
                </Link>
            </div>
        </section>
    );
};

export default SlrLifeTiersSection;
