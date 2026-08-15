import type { Metadata } from 'next';

import EmptyState from '@/components/common/empty-state';
import { handleApiAuthError } from '@/lib/api/guard';
import { type ReferralStatus, getReferralStatus } from '@/lib/api/resources/referral';
import { getAccessToken } from '@/lib/api/server';

import { ReferralSection } from './_components/referral-section';
import { CircleAlert } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Referral · SLR Member'
};

export default async function ReferralPage() {
    const token = await getAccessToken();
    if (!token) return null; // handled by middleware/layout

    let referral: ReferralStatus | null = null;
    let failed = false;

    try {
        referral = await getReferralStatus(token);
    } catch (error) {
        handleApiAuthError(error);
        failed = true;
    }

    return (
        <div className='mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='space-y-1'>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>Referral</h1>
                <p className='text-slr-muted text-sm md:text-base'>
                    Invite friends and earn bonus rewards — every referral counts toward your next milestone.
                </p>
            </header>

            {failed || !referral ? (
                <EmptyState
                    icon={CircleAlert}
                    title='Referral Unavailable'
                    description='We couldn’t load your referral details right now. Please try again shortly.'
                />
            ) : (
                <ReferralSection referral={referral} />
            )}
        </div>
    );
}
