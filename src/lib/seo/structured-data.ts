import type { SubTierCode } from '@/types/member';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://smartliferewards.com.au';
const siteName = 'Smart Life Rewards';

const socialMediaUrls = [
    'https://www.facebook.com/share/1CcxZ86yHn/?mibextid=wwXIfr',
    'https://www.instagram.com/smartliferewards',
    'https://www.tiktok.com/@smartlife.rewards'
];

export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        alternateName: 'SLR',
        url: siteUrl,
        logo: `${siteUrl}/images/slr-rewards-logo-color.webp`,
        description:
            'Smart Life Rewards is an Australian membership club built to help everyday Australians beat the cost of living through weekly draws, partner discounts, and digital offers.',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'cs@smartliferewards.com.au',
            availableLanguage: 'English'
        },
        sameAs: socialMediaUrls
    };
}

export function getWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/faq?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    };
}

export interface FaqItem {
    question: string;
    answer: string;
}

export function getFAQPageSchema(faqs: FaqItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };
}

export function getMembershipOfferSchema(
    tiers: {
        name: string;
        description: string;
        price: string;
        priceCurrency: string;
        billingPeriod: string;
    }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${siteName} Keanggotaan`,
        description: 'Monthly/subscription membership tiers for Smart Life Rewards club benefits.',
        brand: {
            '@type': 'Brand',
            name: siteName
        },
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'AUD',
            lowPrice: '0.00',
            highPrice: '65.00',
            offerCount: tiers.length.toString(),
            offers: tiers.map((tier) => ({
                '@type': 'Offer',
                name: tier.name,
                description: tier.description,
                price: tier.price,
                priceCurrency: tier.priceCurrency,
                priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    price: tier.price,
                    priceCurrency: tier.priceCurrency,
                    referenceQuantity: {
                        '@type': 'QuantitativeValue',
                        value: '1',
                        unitCode: tier.billingPeriod
                    }
                }
            }))
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '247',
            bestRating: '5',
            worstRating: '1'
        }
    };
}
