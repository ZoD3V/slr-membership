'use server';

import { getBillingStatus } from '@/lib/api/resources/billing';
import { getMyMembership } from '@/lib/api/resources/memberships';
import { getAccessToken } from '@/lib/api/server';
import { formatTierName, subTierCodeOf } from '@/lib/member';
import { syncPaymentState } from '@/lib/session-actions';

export interface ActivationState {
    authed: boolean;
    active: boolean;

    requiresPayment?: boolean;
    tierLabel?: string;
    nextRenewalAt?: string | null;
}

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
