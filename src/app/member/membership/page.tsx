import type { Metadata } from 'next';

import { BenySection } from '@/app/member/discounts/_components/beny-section';
import EmptyState from '@/components/common/empty-state';
import { SUB_TIERS } from '@/constant/tiers';
import { getCurrentMember } from '@/data/member-dashboard';
import { getMemberProfile } from '@/data/profile';
import { handleApiAuthError } from '@/lib/api/guard';
import { type BenyStatusValue, getBenyStatus } from '@/lib/api/resources/beny';
import {
    type BillingInvoice,
    type BillingStatus,
    getBillingInvoices,
    getBillingStatus
} from '@/lib/api/resources/billing';
import { type MembershipRecord, getMyMembership } from '@/lib/api/resources/memberships';
import { getAccessToken } from '@/lib/api/server';
import { formatAud, formatShortDate, subTierCodeOf, tierGroupOf } from '@/lib/member';

import { CancelledMembershipBanner } from '../_components/dashboard/cancelled-membership-banner';
import { GraceBanner } from './_components/grace-banner';
import { ManageBillingButton } from './_components/manage-billing-button';
import { ManageTier } from './_components/manage-tier';
import { TierCard } from './_components/tier-card';
import { CircleAlert, CreditCard, ExternalLink, ReceiptText } from 'lucide-react';

export const metadata: Metadata = { title: 'Membership · SLR Member', robots: { index: false } };

const INVOICE_TYPE: Record<string, string> = { initial: 'Initial', renewal: 'Renewal', manual_grace: 'Grace payment' };

export default async function MembershipPage() {
    const member = await getCurrentMember();
    const profile = await getMemberProfile();
    const token = await getAccessToken();

    let billing: BillingStatus | null = null;
    let invoices: BillingInvoice[] = [];
    let membership: MembershipRecord | null = null;
    let benyStatus: BenyStatusValue = 'inactive';
    let benyCancelledAt: string | null = null;
    let benyExpiresAt: string | null = null;
    // Tracked separately from the data: a failed read must never render as "you
    // have none" — a member who has paid would be told they never did.
    let invoicesFailed = false;

    if (token) {
        const [b, i, m, y] = await Promise.allSettled([
            getBillingStatus(token),
            getBillingInvoices(token),
            getMyMembership(token),
            getBenyStatus(token)
        ]);
        if (b.status === 'fulfilled') billing = b.value;
        else handleApiAuthError(b.reason);
        if (i.status === 'fulfilled') invoices = i.value;
        else {
            handleApiAuthError(i.reason);
            invoicesFailed = true;
        }
        if (m.status === 'fulfilled') membership = m.value;
        else handleApiAuthError(m.reason);
        if (y.status === 'fulfilled') {
            benyStatus = y.value.beny_status ?? 'inactive';
            benyCancelledAt = y.value.cancelled_at ?? null;
            benyExpiresAt = y.value.expires_at ?? null;
        } else handleApiAuthError(y.reason);
    }

    const subTier = subTierCodeOf(membership?.subTierId ?? member.sub_tier);
    const isVisitor = tierGroupOf(subTier) === 'visitor';
    const priceCents = membership?.subTier.priceCents ?? SUB_TIERS[subTier].price_cents;

    return (
        <div className='mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <h1 className='font-bebas-neue text-3xl tracking-wide text-white uppercase sm:text-4xl'>Membership</h1>

            {billing?.billing_status === 'grace' ? (
                <GraceBanner expiresAt={billing.grace_period?.expires_at ?? null} />
            ) : null}

            {!isVisitor && billing?.cancel_at_period_end && billing?.next_renewal_at ? (
                <CancelledMembershipBanner accessEndsAt={billing.next_renewal_at} />
            ) : null}

            <TierCard
                subTier={subTier}
                priceCents={priceCents}
                billingStatus={billing?.billing_status ?? membership?.billingStatus ?? null}
                nextRenewal={billing?.next_renewal_at ?? null}>
                <ManageTier
                    isVisitor={isVisitor}
                    currentSubTier={subTier}
                    nextRenewalIso={billing?.next_renewal_at ?? null}
                    scheduledChange={membership?.pending_upgrade ?? null}
                    billingStatus={billing?.billing_status ?? membership?.billingStatus ?? null}
                    cancelAtPeriodEnd={Boolean(billing?.cancel_at_period_end)}
                />
            </TierCard>

            {/* Payment method */}
            <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                        <CreditCard className='text-slr-gold-label size-5' />
                        <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase'>Payment Method</h2>
                    </div>
                    <ManageBillingButton />
                </div>
                <p className='text-slr-dim mt-2 text-xs'>
                    Update your card or cancel via Stripe’s secure billing portal.
                </p>
            </section>

            {/* BENY */}
            {isVisitor ? null : (
                <BenySection
                    status={benyStatus}
                    userProfile={profile}
                    cancelledAt={benyCancelledAt}
                    expiresAt={benyExpiresAt ?? billing?.next_renewal_at ?? null}
                />
            )}

            {/* Payment history */}
            <section className='bg-card-dark-navy border-slr-navy-border rounded-2xl border p-5 md:p-6'>
                <div className='mb-4 flex items-center gap-2'>
                    <ReceiptText className='text-slr-gold-label size-5' />
                    <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase'>Payment History</h2>
                </div>
                {invoicesFailed ? (
                    <EmptyState
                        icon={CircleAlert}
                        title='History Unavailable'
                        description='We couldn’t load your invoices right now. Any payments you’ve made are still recorded — please try again shortly.'
                        className='mx-auto max-w-sm border-0 bg-transparent px-0 py-6'
                    />
                ) : invoices.length === 0 ? (
                    <p className='text-slr-dim text-sm'>No payments yet.</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-slr-dim border-b border-white/5 text-left text-xs uppercase'>
                                    <th className='py-2 pr-4 font-medium'>Date</th>
                                    <th className='py-2 pr-4 font-medium'>Type</th>
                                    <th className='py-2 pr-4 font-medium'>Amount</th>
                                    <th className='py-2 pr-4 font-medium'>Status</th>
                                    <th className='py-2 font-medium'>Invoice</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-white/5'>
                                {invoices.map((inv) => (
                                    <tr key={inv.invoice_id} className='text-white/90'>
                                        <td className='py-2.5 pr-4'>
                                            {inv.paid_at ? formatShortDate(inv.paid_at) : '-'}
                                        </td>
                                        <td className='py-2.5 pr-4'>{INVOICE_TYPE[inv.type] ?? inv.type}</td>
                                        <td className='py-2.5 pr-4 tabular-nums'>{formatAud(inv.amount_cents ?? 0)}</td>
                                        <td className='py-2.5 pr-4'>
                                            <span className='font-semibold text-emerald-400'>Paid</span>
                                        </td>
                                        <td className='py-2.5'>
                                            {inv.hosted_invoice_url ? (
                                                <a
                                                    href={inv.hosted_invoice_url}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-slr-gold-label inline-flex items-center gap-1 hover:underline'>
                                                    View <ExternalLink className='size-3' />
                                                </a>
                                            ) : (
                                                <span className='text-slr-dim'>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {!billing && !membership ? (
                <EmptyState
                    icon={CircleAlert}
                    title='Billing Unavailable'
                    description={
                        token
                            ? 'We couldn’t reach the billing service, so the plan shown above may be out of date. Please try again shortly.'
                            : 'Please sign in and try again.'
                    }
                />
            ) : null}
        </div>
    );
}
