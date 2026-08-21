import Image from 'next/image';

import GoldPillButton from '@/components/common/gold-pill-button';
import SectionEyebrow from '@/components/common/section-eyebrow';
import SectionHeading from '@/components/common/section-heading';

const DiscountSpinWheelSection = () => {
    return (
        <section className='bg-slr-ink relative isolate overflow-hidden py-16 md:py-24'>
            <div className='mx-auto flex max-w-6xl flex-col items-center px-4 text-center'>
                <SectionEyebrow label='Monthly Bonus · Tier Exclusive' color='#E2B42B' lineColor='#B08A20' />

                <SectionHeading className='mt-4'>
                    <span className='text-gradient-silver'>Get Your </span>
                    <span className='text-gradient-gold'>Discount Spinwheel</span>
                </SectionHeading>

                <Image
                    src='/icons/ic-duck-20-wheel.webp'
                    alt='Monthly discount spin wheel'
                    width={390}
                    height={390}
                    className='mt-10 h-56 w-56 object-contain sm:h-72 sm:w-72'
                />

                <p className='text-slr-muted mt-10 max-w-2xl text-sm leading-relaxed md:text-base'>
                    Sign up for your first spin and enjoy a monthly spin for exciting discounts. Each tier offers
                    different rewards — spin within 24 hours before renewal for surprise bonuses and special discounts
                    from us!
                </p>

                <GoldPillButton href='/sign-up' className='mt-10'>
                    Join &amp; Spin the Wheel
                </GoldPillButton>
            </div>
        </section>
    );
};

export default DiscountSpinWheelSection;
