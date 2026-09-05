import { Metadata } from 'next';

import EmptyState from '@/components/common/empty-state';
import {
    type MembershipTiers,
    type TierDisplay,
    type TierOption,
    getMembershipTiers
} from '@/lib/api/resources/memberships';
import { weeklyPriceLabel } from '@/lib/prize-content';
import { getMembershipOfferSchema } from '@/lib/seo/structured-data';
import { getTierPricing, minPriceOf, tierPricingFrom } from '@/lib/tier-pricing';

import BlueTiersSection from '../(membership)/_components/blue-tiers-section';
import RedTiersSection from '../(membership)/_components/red-tiers-section';
import DiscountSpinWheelSection from './_components/discount-spinwheel-section';
import SaveMoreWithBenySection from './_components/save-more-with-beny-section';
import SavingTodaySection from './_components/saving-today-section';
import { CircleAlert } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
    const pricing = await getTierPricing();

    return {
        title: 'Membership · SLR Rewards',
        description: `Compare Smart Life Rewards membership tiers — SLR Red (from $${minPriceOf(pricing, 'red') / 100} per 4 weeks) and SLR Premium (from $${minPriceOf(pricing, 'blue') / 100} per 4 weeks). Choose the plan that's right for you.`
    };
}

const formatPrice = (cents: number) => {
    const dollars = cents / 100;

    return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
};

const toDisplayMap = (options: TierOption[]): Record<string, TierDisplay> =>
    options.reduce<Record<string, TierDisplay>>((map, t) => {
        map[t.sub_tier.toUpperCase()] = {
            price: formatPrice(t.price_cents),
            tokens: `${t.token} Entr${t.token === 1 ? 'y' : 'ies'}`,
            name: t.marketing_name,
            spin: t.spin ? `$${t.spin_discount_cents / 100} Off` : null
        };

        return map;
    }, {});

/** The hero box reads "Start From <x> /week", so this is the cheapest sub-tier spread over the 28-day cycle. */
const startFrom = (options: TierOption[]): string =>
    weeklyPriceLabel(Math.min(...options.map((t) => t.price_cents))).replace('/week', '');

const MembershipPage = async () => {
    let tiers: MembershipTiers | null = null;
    try {
        tiers = await getMembershipTiers();
    } catch {
        tiers = null;
    }

    const hasTiers = !!tiers && (tiers.red.length > 0 || tiers.blue.length > 0);

    const pricing = tierPricingFrom(tiers);
    const redFrom = minPriceOf(pricing, 'red') / 100;
    const blueFrom = minPriceOf(pricing, 'blue') / 100;

    const schemaTiers = [
        {
            name: 'Smart Life Rewards Red',
            description: `SLR Red Membership - starting from $${redFrom} per 4 weeks. Access to Red draws, partner discounts, and digital e-books.`,
            price: redFrom.toFixed(2),
            priceCurrency: 'AUD',
            billingPeriod: 'P28D'
        },
        {
            name: 'Smart Life Rewards Premium (Blue)',
            description: `SLR Premium Blue Membership - starting from $${blueFrom} per 4 weeks. Full access to premium blue draws, complete discounts directory, e-books library, and BENY add-on.`,
            price: blueFrom.toFixed(2),
            priceCurrency: 'AUD',
            billingPeriod: 'P28D'
        }
    ];

    const membershipSchema = getMembershipOfferSchema(schemaTiers);

    return (
        <main className='bg-slr-ink pt-12'>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(membershipSchema)
                }}
            />
            {hasTiers ? (
                <>
                    <RedTiersSection live={toDisplayMap(tiers!.red)} startFrom={startFrom(tiers!.red)} />
                    <BlueTiersSection live={toDisplayMap(tiers!.blue)} startFrom={startFrom(tiers!.blue)} />
                </>
            ) : (
                <section className='bg-slr-ink py-16 md:py-24'>
                    <div className='mx-auto max-w-7xl px-4'>
                        <EmptyState
                            icon={CircleAlert}
                            title='Pricing Unavailable'
                            description="We couldn't load membership pricing right now. Please refresh in a moment."
                        />
                    </div>
                </section>
            )}

            <SaveMoreWithBenySection />
            <DiscountSpinWheelSection />
            <SavingTodaySection />
        </main>
    );
};

export default MembershipPage;
