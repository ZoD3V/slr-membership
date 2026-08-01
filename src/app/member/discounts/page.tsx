import type { Metadata } from 'next';
import Link from 'next/link';

import EmptyState from '@/components/common/empty-state';
import { getCurrentMember } from '@/data/member-dashboard';
import { handleApiAuthError } from '@/lib/api/guard';
import { type Discount, getDiscounts } from '@/lib/api/resources/discounts';
import { getAccessToken } from '@/lib/api/server';
import { tierGroupOf } from '@/lib/member';
import { goldButtonStyle } from '@/lib/styles';

import { DiscountsExplorer } from './_components/discounts-explorer';
import { ArrowRight, CircleAlert, Lock, Tag } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Discounts · SLR Member'
};

export default async function DiscountsPage() {
    const member = await getCurrentMember();
    // PRD §4.4: basic discounts are RED/BLUE only — Visitor sees an upgrade gate.
    const canAccess = tierGroupOf(member.sub_tier) !== 'visitor';

    let discounts: Discount[] = [];
    let failed = false;

    if (canAccess) {
        const token = await getAccessToken();
        if (token) {
            try {
                // Only show discounts that actually carry data.
                discounts = (await getDiscounts(token)).filter((d) => d.title?.trim() || d.partner_name?.trim());
            } catch (error) {
                handleApiAuthError(error); // expired session → force logout
                failed = true;
            }
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

            {canAccess ? (
                <>
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
                </>
            ) : (
                <div className='flex flex-col items-center px-6 py-14 text-center'>
                    <span className='bg-gold-tint mb-4 flex size-12 items-center justify-center rounded-xl border border-[#D4AF3759]'>
                        <Lock className='text-slr-gold-label size-6' />
                    </span>
                    <h2 className='font-bebas-neue text-2xl tracking-wide text-white uppercase'>
                        Discounts are a member benefit
                    </h2>
                    <p className='text-slr-muted mt-2 max-w-md text-sm leading-relaxed'>
                        Upgrade to SLR RED or BLUE to unlock partner discounts, promo codes and the BENY savings add-on.
                    </p>
                    <Link
                        href='/member/membership'
                        className='mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold uppercase'
                        style={goldButtonStyle}>
                        Upgrade now <ArrowRight className='size-4' />
                    </Link>
                </div>
            )}
        </div>
    );
}
