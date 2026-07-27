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

// Opens the Stripe Billing Portal. Returns the hosted URL for the client to
// redirect to (manage cards / cancel). Real members get a URL; seed dev accounts
// return 400 "No such customer".
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

// Starts a hosted Stripe Checkout for one specific paid sub-tier and returns the
// URL for the client to redirect to. Stripe sends the member to
// /payment/success (which polls until the webhook activates them) or
// /payment/cancel.
//
// Sends `sub_tier`, not `tier` — a bare tier makes the backend pick the entry
// sub-tier (r1/b1), so R4/R7/B4/B7/B10 would be unsellable from here.
//
// Only offer this to members with no live subscription (Visitor). A paid→paid
// change is POST /memberships/upgrade (scheduled at renewal) — running checkout
// for an existing subscriber would open a second subscription.
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

// Maps an API failure to a user-facing message. Business error codes live in
// the envelope, exposed via ApiError.payload.code (the ApiError instance has no
// `code` field). The Friday lockout gets the shared copy so the toast and the
// on-page notice always say the same thing.
function toActionMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        if (isSafeHoursError(error)) return SAFE_HOURS_MESSAGE;

        return apiErrorMessage(error);
    }

    return fallback;
}

// Schedule a paid tier upgrade/downgrade for the next renewal. Returns the
// scheduled change so the UI can show it optimistically (memberships/me does
// not yet expose pending_upgrade — docs/BACKEND-ISSUES.md A2).
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

// Cancel a scheduled (pending) tier change before it applies.
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

// Cancel the membership at period end. On seed accounts the fake Stripe sub may
// 400 — the message is surfaced to the user (docs/BACKEND-ISSUES.md C3).
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

// Start manual payment for a grace-period invoice → hosted Stripe checkout URL.
// Grace state can't be reproduced on seed accounts (docs/BACKEND-ISSUES.md C3),
// so this is built blind and guarded.
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
