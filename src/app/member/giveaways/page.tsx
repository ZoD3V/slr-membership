import type { Metadata } from 'next';

import Link from 'next/link';

import EmptyState from '@/components/common/empty-state';
import { getCurrentMember } from '@/data/member-dashboard';
import { handleApiAuthError } from '@/lib/api/guard';
import { getBillingStatus } from '@/lib/api/resources/billing';
import { getEntryHistory } from '@/lib/api/resources/entries';
import { compareGiveaways, getGiveaways, toGiveaway } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';
import { tierGroupOf } from '@/lib/member';
import type { Giveaway } from '@/types/member';

import { GiveawaysBoard } from './_components/giveaways-board';
import { ArrowLeft, CircleAlert, Gift } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Giveaways · SLR Member'
};

export default async function GiveawaysPage() {
    const member = await getCurrentMember();
    const token = await getAccessToken();
    const memberGroup = tierGroupOf(member.sub_tier);

    let giveaways: Giveaway[] = [];
    let failed = false;
    let nextRenewalIso: string | null = null;

    if (token) {
        // Giveaways + entries in parallel — entries gives the cycle token count, which
        // is the member's entries-per-giveaway (the API has no per-giveaway count).
        // Billing feeds the locked-tab banner ("upgrade takes effect at your next cycle").
        const [giveawaysRes, entriesRes, billingRes] = await Promise.allSettled([
            getGiveaways(token),
            getEntryHistory(token),
            getBillingStatus(token)
        ]);

        if (giveawaysRes.status === 'fulfilled') {
            const tokens = entriesRes.status === 'fulfilled' ? (entriesRes.value.current_cycle?.total_token ?? 0) : 0;
            giveaways = giveawaysRes.value
                .map((g) => toGiveaway(g, memberGroup, member.state, tokens))
                .sort(compareGiveaways);
        } else {
            handleApiAuthError(giveawaysRes.reason); // expired session → force logout
            failed = true;
        }
        if (billingRes.status === 'fulfilled') nextRenewalIso = billingRes.value.next_renewal_at ?? null;
        else handleApiAuthError(billingRes.reason);
    }

    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='space-y-1'>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>Giveaways</h1>
                <p className='text-slr-muted text-sm md:text-base'>
                    Active draws for your tier. Entries are allocated automatically each cycle — no manual entry needed.
                </p>
            </header>

            {failed ? (
                <EmptyState
                    icon={CircleAlert}
                    title='Giveaways Unavailable'
                    description='We couldn’t load the draws for your tier right now. Please try again shortly.'
                />
            ) : giveaways.length === 0 ? (
                // Open layout matching the Referral (ComingSoon) empty state — no card box.
                <EmptyState
                    icon={Gift}
                    title='No Giveaways Right Now'
                    description='Active draws for your tier will appear here soon.'
                    action={
                        <Link
                            href='/member'
                            className='text-slr-gold-label inline-flex items-center gap-1.5 text-sm font-semibold uppercase transition-opacity hover:opacity-80'>
                            <ArrowLeft className='size-4' /> Back to dashboard
                        </Link>
                    }
                    className='border-0 bg-transparent py-16'
                />
            ) : (
                <GiveawaysBoard giveaways={giveaways} memberSubTier={member.sub_tier} nextRenewalIso={nextRenewalIso} />
            )}
        </div>
    );
}
