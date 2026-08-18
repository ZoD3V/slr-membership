import Image from 'next/image';

import LogoMarquee from '@/components/common/logo-marquee';
import SectionHeading from '@/components/common/section-heading';

const STATIC_PARTNERS = Array.from({ length: 10 }, (_, idx) => ({
    src: `/images/list-partner-logo-${idx + 1}.webp`,
    alt: `Partner Logo ${idx + 1}`
}));

// `logos` = public discount logo_urls (fetched server-side). Section-level fallback:
// any real logos → show them; none (empty / fetch failed) → the static partner set.
const PartnersSection = ({ logos }: { logos?: string[] }) => {
    const partners =
        logos && logos.length > 0
            ? logos.map((src, idx) => ({ src, alt: `Partner Logo ${idx + 1}` }))
            : STATIC_PARTNERS;

    return (
        <section id='partners' className='bg-slr-ink relative overflow-hidden pt-16 md:pt-24'>
            <div className='px-4 pb-12 text-center'>
                <div className='flex justify-center'>
                    <Image
                        src='/images/knotted-rope.png'
                        alt=''
                        width={960}
                        height={90}
                        className='h-auto w-56 sm:w-72'
                    />
                </div>

                <SectionHeading className='mt-6 text-[42px] leading-none sm:text-[56px] md:text-[72px] xl:text-[90px] xl:leading-22.5'>
                    <span className='text-gradient-silver'>Community Givebacks</span>
                </SectionHeading>

                <p className='text-slr-muted mt-4 text-sm md:text-base'>
                    Draw prizes and discounts to support community
                </p>

                <div className='mt-6 flex justify-center'>
                    <Image
                        src='/images/knotted-rope.png'
                        alt=''
                        width={960}
                        height={90}
                        className='h-auto w-56 sm:w-72'
                    />
                </div>
            </div>

            <div className='mt-10'>
                <LogoMarquee logos={partners} />
            </div>
        </section>
    );
};

export default PartnersSection;
