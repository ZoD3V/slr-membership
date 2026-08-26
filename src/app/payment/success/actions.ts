'use server';

import { getBillingStatus } from '@/lib/api/resources/billing';
import { getMyMembership } from '@/lib/api/resources/memberships';
import { getAccessToken } from '@/lib/api/server';
import { formatTierName, subTierCodeOf } from '@/lib/member';
import { syncPaymentState } from '@/lib/session-actions';

export interface ActivationState {
    /** false = no app session (e.g. checked out without logging in) → show a generic success. */
    authed: boolean;
    active: boolean;
    /** Still true = the session token would still be bounced to /complete-payment. */
    requiresPayment?: boolean;
    tierLabel?: string;
    nextRenewalAt?: string | null;
}

// Polled by the success page until the Stripe webhook flips billing to active.
export async function checkActivation(): Promise<ActivationState> {
    const token = await getAccessToken();
    if (!token) return { authed: false, active: false };

    try {
        const [billing, membership] = await Promise.all([
            getBillingStatus(token),
            getMyMembership(token).catch(() => null)
        ]);

        const tierLabel = membership ? formatTierName(subTierCodeOf(membership.subTierId)) : undefined;
        const active = billing.billing_status === 'active';

        // The login-time JWT still says "unpaid" — rewrite it here, or the very
        // next hop to /member gets redirected straight back to /complete-payment.
        const synced = await syncPaymentState();

        return {
            authed: true,
            active,
            requiresPayment: synced?.requiresPayment ?? !active,
            tierLabel,
            nextRenewalAt: billing.next_renewal_at
        };
    } catch {
        return { authed: true, active: false };
    }
}
