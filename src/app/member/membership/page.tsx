import type { Metadata } from 'next';

import { BenySection } from '@/app/member/discounts/_components/beny-section';
import EmptyState from '@/components/common/empty-state';
import { SUB_TIERS } from '@/constant/tiers';
import { getCurrentMember } from '@/data/member-dashboard';
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

import { ManageBillingButton } from './_components/manage-billing-button';
import { ManageTier } from './_components/manage-tier';
import { TierCard } from './_components/tier-card';
import { CreditCard, ReceiptText } from 'lucide-react';

export const metadata: Metadata = { title: 'Membership · SLR Member', robots: { index: false } };

const INVOICE_TYPE: Record<string, string> = { initial: 'Initial', renewal: 'Renewal', manual_grace: 'Grace payment' };

export default async function MembershipPage() {
    const member = await getCurrentMember();
    const token = await getAccessToken();

    let billing: BillingStatus | null = null;
    let invoices: BillingInvoice[] = [];
    let membership: MembershipRecord | null = null;
    let benyStatus: BenyStatusValue = 'inactive';

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
        else handleApiAuthError(i.reason);
        if (m.status === 'fulfilled') membership = m.value;
        else handleApiAuthError(m.reason);
        if (y.status === 'fulfilled') benyStatus = y.value.beny_status ?? 'inactive';
        else handleApiAuthError(y.reason);
    }

    const subTier = subTierCodeOf(membership?.subTierId ?? member.sub_tier);
    const isVisitor = tierGroupOf(subTier) === 'visitor';
    const priceCents = membership?.subTier.priceCents ?? SUB_TIERS[subTier].price_cents;

    return (
        <div className='mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <h1 className='font-bebas-neue text-3xl tracking-wide text-white uppercase sm:text-4xl'>Membership</h1>

            <TierCard
                subTier={subTier}
                priceCents={priceCents}
                billingStatus={billing?.billing_status ?? membership?.billingStatus ?? 'active'}
                nextRenewal={billing?.next_renewal_at ?? null}
            />

            <ManageTier
                isVisitor={isVisitor}
                currentSubTier={subTier}
                nextRenewalIso={billing?.next_renewal_at ?? null}
            />

            {/* Payment method */}
            <section className='bg-slr-navy-card border-slr-navy-border rounded-2xl border p-5 md:p-6'>
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
            {isVisitor ? null : <BenySection status={benyStatus} />}

            {/* Payment history */}
            <section className='bg-slr-navy-card border-slr-navy-border rounded-2xl border p-5 md:p-6'>
                <div className='mb-4 flex items-center gap-2'>
                    <ReceiptText className='text-slr-gold-label size-5' />
                    <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase'>Payment History</h2>
                </div>
                {invoices.length === 0 ? (
                    <p className='text-slr-dim text-sm'>No payments yet.</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='text-slr-dim border-b border-white/5 text-left text-xs uppercase'>
                                    <th className='py-2 pr-4 font-medium'>Date</th>
                                    <th className='py-2 pr-4 font-medium'>Type</th>
                                    <th className='py-2 pr-4 font-medium'>Amount</th>
                                    <th className='py-2 font-medium'>Status</th>
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
                                        <td className='py-2.5'>
                                            <span className='font-semibold text-emerald-400'>Paid</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {!billing && !membership ? (
                <EmptyState icon={CreditCard} title='Billing Unavailable' description='Please sign in and try again.' />
            ) : null}
        </div>
    );
}
