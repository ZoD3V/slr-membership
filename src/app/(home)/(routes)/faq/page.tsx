import { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { BENY_MONTHLY_PRICE } from '@/constant/tiers';
import { getFAQPageSchema } from '@/lib/seo/structured-data';
import { goldButtonStyle } from '@/lib/styles';
import { getTierPricing, minPriceOf } from '@/lib/tier-pricing';

import PageHero from '../_components/page-hero';
import FaqList from './_components/faq-list';
import { buildCategories } from './faq-data';

export const metadata: Metadata = {
    title: 'FAQ · SLR Rewards',
    description: 'Answers to common questions about Smart Life Rewards membership, draws, billing, and discounts.'
};

const FaqPage = async () => {
    const pricing = await getTierPricing();
    const categories = buildCategories(
        minPriceOf(pricing, 'red') / 100,
        minPriceOf(pricing, 'blue') / 100,
        BENY_MONTHLY_PRICE
    );
    const allFaqs = categories.flatMap((category) => category.items);
    const faqSchema = getFAQPageSchema(allFaqs);

    return (
        <>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema)
                }}
            />
            <PageHero
                eyebrow='Help Centre'
                title='Frequently Asked Questions'
                description="Everything you need to know about your SLR membership — tiers, billing, draws, discounts, and more. Can't find what you're looking for? Get in touch."
            />

            <section className='bg-slr-navy-deep relative py-12 md:py-16'>
                <div className='mx-auto max-w-4xl px-4'>
                    <FaqList categories={categories} />

                    <div className='mt-16 rounded-2xl border border-[#A0B4D259] bg-[linear-gradient(154.36deg,#141820_0.82%,#1E2530_49.73%,#141820_98.65%)] p-8 text-center shadow-[0px_0px_20px_0px_#776D6D26]'>
                        <h2 className='font-bebas-neue text-3xl tracking-wider text-white uppercase md:text-4xl'>
                            Still have questions?
                        </h2>
                        <p className='text-slr-muted mt-3 text-sm leading-relaxed md:text-base'>
                            Our support team is here to help. Reach out any time and we&apos;ll get back to you within
                            one business day.
                        </p>
                        <div className='mt-6 flex flex-wrap justify-center gap-3'>
                            <Link href='/contact'>
                                <Button style={goldButtonStyle} className='h-11 rounded-xl px-8 font-bold uppercase'>
                                    Contact Support
                                </Button>
                            </Link>
                            <Link href='/sign-up'>
                                <Button
                                    variant='outline'
                                    className='h-11 rounded-xl border border-[#FFD147] bg-[#FFD1471A] px-8 font-semibold text-[#FFDC75] hover:bg-[#FFD14726] hover:text-[#FFDC75]'>
                                    Join Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default FaqPage;
