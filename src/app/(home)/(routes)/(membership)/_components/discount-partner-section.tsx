import Image from 'next/image';

import SectionEyebrow from '@/components/common/section-eyebrow';
import SectionHeading from '@/components/common/section-heading';

import PricingSection from './pricing-section';

const categories = [
    {
        icon: '/icons/ic-list-slr-smart-life-reward-1.webp',
        title: 'Member \n& Community'
    },
    {
        icon: '/icons/ic-list-slr-smart-life-reward-2.webp',
        title: 'Rewards \n& Draws'
    },
    {
        icon: '/icons/ic-list-slr-smart-life-reward-3.webp',
        title: 'Discounts \n& Contests'
    },
    {
        icon: '/icons/ic-list-slr-smart-life-reward-4.webp',
        title: 'Prize Draws \n& ODDS'
    },
    {
        icon: '/icons/ic-list-slr-smart-life-reward-5.webp',
        title: 'Chart \nBenefits'
    }
];

const DiscountPartnerSection = () => {
    return (
        <section className='bg-slr-navy-deep relative pt-16 md:pt-24'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='mb-8 text-center'>
                    <SectionEyebrow label='Gain Access To Our' color='#E2B42B' className='mt-4' />

                    <SectionHeading className='mt-2'>Exclusive Discount Partner Program</SectionHeading>

                    <p className='mt-2 text-center text-sm leading-relaxed text-[#AA8720] xl:text-base'>
                        And Community Support & Discounts
                    </p>
                </div>

                <div className='mt-4 flex justify-center'>
                    <Image
                        src='/images/slr-rewards-partner-program.webp'
                        alt='Transparent System Pie Chart'
                        width={540}
                        height={361}
                        className='h-auto w-full max-w-sm object-contain'
                    />
                </div>

                <div className='mt-12 grid grid-cols-2 gap-4 md:grid-cols-5'>
                    {categories.map((cat) => (
                        <div className='flex w-full flex-col items-center' key={cat.title}>
                            <div className='shadow-card-soft flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#0C0E1C_49.73%,#161A30_98.65%)] p-4 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#F5D78E]/40 hover:shadow-[0px_0px_20px_0px_#000000A0]'>
                                <Image
                                    src={cat.icon}
                                    alt={cat.title}
                                    width={140}
                                    height={140}
                                    className='h-35 w-35 object-contain'
                                />
                            </div>
                            <p className='font-bebas-neue text-gradient-gold mt-4 text-center text-xl leading-none font-extrabold whitespace-pre-line'>
                                {cat.title}
                            </p>
                        </div>
                    ))}
                </div>

                <div className='my-16 md:my-24'>
                    <div className='flex w-full items-center justify-center gap-2'>
                        <div className='h-px w-75 bg-[linear-gradient(270deg,#E2B42B_0%,rgba(255,255,255,0)_100%)]' />
                        {[1, 2, 3].map((i) => (
                            <Image
                                key={i}
                                src='/icons/ic-star.png'
                                alt=''
                                aria-hidden='true'
                                width={20}
                                height={20}
                                className='mt-0.5 h-4 w-4 shrink-0 object-contain sm:h-5 sm:w-5'
                            />
                        ))}
                        <div className='h-px w-75 bg-[linear-gradient(90deg,#E2B42B_0%,rgba(255,255,255,0)_100%)]' />
                    </div>
                </div>
                <PricingSection />
            </div>
        </section>
    );
};

export default DiscountPartnerSection;
