import LogoMarquee from '@/components/common/logo-marquee';
import SectionHeading from '@/components/common/section-heading';

const STATIC_PARTNERS = Array.from({ length: 10 }, (_, idx) => ({
    src: `/images/list-partner-logo-${idx + 1}.webp`,
    alt: `Partner Logo ${idx + 1}`
}));

const PartnersSection = ({ logos }: { logos?: string[] }) => {
    const partners =
        logos && logos.length > 0
            ? logos.map((src, idx) => ({ src, alt: `Partner Logo ${idx + 1}` }))
            : STATIC_PARTNERS;

    return (
        <section id='partners' className='bg-slr-ink relative overflow-hidden py-16 md:py-24'>
            <div className='mb-12 px-4 text-center md:mb-16'>
                <SectionHeading className='text-[56px] leading-[0.90] sm:text-[56px] md:text-[72px] md:leading-none xl:text-[90px]'>
                    <span className='text-gradient-silver'>Community Givebacks</span>
                </SectionHeading>

                <p className='text-slr-muted mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed md:text-base'>
                    Giving back to our community with exclusive draw prizes and everyday member discounts.
                </p>
            </div>

            <div className='mt-10'>
                <LogoMarquee logos={partners} />
            </div>
        </section>
    );
};

export default PartnersSection;
