import GoldPillButton from '@/components/common/gold-pill-button';
import SectionEyebrow from '@/components/common/section-eyebrow';
import SectionHeading from '@/components/common/section-heading';
import SpinWheelBadge from '@/components/common/spin-wheel-badge';
import { SUB_TIERS } from '@/constant/tiers';
import { getTierPricing } from '@/lib/tier-pricing';

const DiscountSpinWheelSection = async () => {
    const pricing = await getTierPricing();
    const topDiscount = Math.max(...Object.values(SUB_TIERS).map((meta) => pricing[meta.code].spinDiscountCents)) / 100;

    return (
        <section className='bg-slr-ink relative isolate overflow-hidden py-16 md:py-24'>
            <div className='mx-auto flex max-w-6xl flex-col items-center px-4 text-center'>
                <SectionEyebrow label='Monthly Bonus · Tier Exclusive' color='#E2B42B' lineColor='#B08A20' />

                <SectionHeading className='mt-4'>
                    <span className='text-gradient-silver'>Get Your </span>
                    <span className='text-gradient-gold'>Discount Spinwheel</span>
                </SectionHeading>

                <SpinWheelBadge amount={topDiscount} className='mt-10 h-56 w-56 sm:h-72 sm:w-72' />

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
