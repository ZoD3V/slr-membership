'use server';

import { payGraceInvoice } from '@/lib/api/resources/billing';
import {
    type MemberSubTierId,
    type ScheduledTierChange,
    cancelScheduledChange,
    scheduleMembershipChange
} from '@/lib/api/resources/memberships';
import { createMembershipCheckout, createPortalSession } from '@/lib/api/resources/stripe';
import { cancelMySubscription } from '@/lib/api/resources/subscriptions';
import { getAccessToken } from '@/lib/api/server';
import { ApiError, apiErrorMessage } from '@/lib/api/types';
import { SAFE_HOURS_MESSAGE, isSafeHoursError } from '@/lib/safe-hours';
import type { SubTierCode } from '@/types/member';

export async function openBillingPortal(): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const { url } = await createPortalSession(token);

        return { ok: true, url };
    } catch (error) {
        return { ok: false, message: error instanceof ApiError ? error.message : 'Could not open the billing portal.' };
    }
}

export async function startSubTierCheckout(
    subTier: SubTierCode
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const { url } = await createMembershipCheckout(token, { sub_tier: subTier.toLowerCase() });

        return { ok: true, url };
    } catch (error) {
        return { ok: false, message: toActionMessage(error, 'Could not start checkout.') };
    }
}

function toActionMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        if (isSafeHoursError(error)) return SAFE_HOURS_MESSAGE;

        return apiErrorMessage(error);
    }

    return fallback;
}

export async function scheduleTierChangeAction(
    targetSubTierId: MemberSubTierId
): Promise<{ ok: true; change: ScheduledTierChange } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const change = await scheduleMembershipChange(targetSubTierId, token);

        return { ok: true, change };
    } catch (error) {
        return { ok: false, message: toActionMessage(error, 'Could not schedule the plan change.') };
    }
}

export async function cancelScheduledTierChangeAction(): Promise<{ ok: true } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        await cancelScheduledChange(token);

        return { ok: true };
    } catch (error) {
        return { ok: false, message: toActionMessage(error, 'Could not cancel the scheduled change.') };
    }
}

export async function cancelMembershipAction(): Promise<{ ok: true } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        await cancelMySubscription(token);

        return { ok: true };
    } catch (error) {
        return { ok: false, message: toActionMessage(error, 'Could not cancel your membership.') };
    }
}

export async function payGraceInvoiceAction(): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const { checkout_url } = await payGraceInvoice(token);

        return { ok: true, url: checkout_url };
    } catch (error) {
        return { ok: false, message: toActionMessage(error, 'Could not start the grace payment.') };
    }
}
