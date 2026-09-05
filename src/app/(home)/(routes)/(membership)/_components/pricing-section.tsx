import { StarsBackground } from '@/components/ui/stars-background';
import { getTierPricing, minPriceOf } from '@/lib/tier-pricing';

const PricingSection = async () => {
    const pricing = await getTierPricing();

    return (
        <section id='pricing' className='bg-slr-navy-deep relative mx-auto max-w-7xl'>
            <StarsBackground starDensity={0.0003} />

            <div className='relative grid grid-cols-2 gap-2 sm:gap-3'>
                <div className='flex h-auto flex-col items-center justify-center rounded-xl border border-[#C8152E66] bg-[linear-gradient(154.36deg,#1C0308_0.82%,#2A0810_49.73%,#1A0306_98.65%)] p-3 text-center shadow-[0px_0px_13px_0px_#776D6D26] sm:p-4 md:h-55.5'>
                    <p className='text-[10px] font-semibold tracking-widest text-[#FFB5B5] uppercase sm:text-xs md:text-sm'>
                        RED
                    </p>
                    <p className='font-bebas-neue text-gradient-gold mt-2 text-[52px] font-extrabold md:text-[60px] lg:text-[60px] xl:text-[70px]'>
                        ${minPriceOf(pricing, 'red') / 100}
                    </p>
                    <p className='text-slr-dim mt-1 text-[10px] sm:text-sm'>/4 weeks</p>
                </div>

                <div className='shadow-card-soft flex h-auto flex-col items-center justify-center rounded-xl border border-[#2878E84D] bg-[linear-gradient(154.36deg,#0E1828_0.82%,#142034_49.73%,#0E1828_98.65%)] p-3 text-center sm:p-4 md:h-55.5'>
                    <p className='text-[10px] font-semibold tracking-widest text-[#2878E8] uppercase sm:text-xs md:text-sm'>
                        SLR Premium
                    </p>
                    <p className='font-bebas-neue text-gradient-gold mt-2 text-[52px] font-extrabold md:text-[60px] lg:text-[60px] xl:text-[70px]'>
                        ${minPriceOf(pricing, 'blue') / 100}
                    </p>
                    <p className='text-slr-dim mt-1 text-[10px] sm:text-sm'>/4 weeks</p>
                </div>
            </div>

            <p className='text-slr-muted mx-auto mt-24 max-w-xl px-4 text-center text-sm sm:text-base md:text-lg'>
                Smart Life Rewards is a membership platform designed to help Australians access value through rewards,
                promotional prizes, partner discounts, and digital offers.
            </p>
        </section>
    );
};

export default PricingSection;
