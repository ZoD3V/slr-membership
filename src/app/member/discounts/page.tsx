import type { Metadata } from 'next';

import EmptyState from '@/components/common/empty-state';
import { handleApiAuthError } from '@/lib/api/guard';
import { type Discount, getDiscounts } from '@/lib/api/resources/discounts';
import { getAccessToken } from '@/lib/api/server';

import { DiscountsExplorer } from './_components/discounts-explorer';
import { CircleAlert, Tag } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Discounts · SLR Member'
};

export default async function DiscountsPage() {
    let discounts: Discount[] = [];
    let failed = false;

    const token = await getAccessToken();
    if (token) {
        try {
            discounts = (await getDiscounts(token)).filter((d) => d.title?.trim() || d.partner_name?.trim());
        } catch (error) {
            handleApiAuthError(error);
            failed = true;
        }
    }

    const categories = Array.from(new Set(discounts.map((d) => d.category))).sort();

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='space-y-1'>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>Discounts</h1>
                <p className='text-slr-muted text-sm md:text-base'>
                    Partner offers and premium savings, exclusive to SLR members.
                </p>
            </header>

            {failed ? (
                <EmptyState
                    icon={CircleAlert}
                    title='Discounts Unavailable'
                    description='We couldn’t load partner offers right now. Please try again shortly.'
                />
            ) : discounts.length > 0 ? (
                <DiscountsExplorer discounts={discounts} categories={categories} />
            ) : (
                <EmptyState
                    icon={Tag}
                    title='No Discounts Yet'
                    description='New partner offers are on the way — check back soon.'
                />
            )}
        </div>
    );
}
