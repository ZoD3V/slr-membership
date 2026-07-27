'use server';

import { createMembershipCheckout } from '@/lib/api/resources/stripe';
import { getAccessToken } from '@/lib/api/server';
import { ApiError, apiErrorMessage } from '@/lib/api/types';
import { SAFE_HOURS_MESSAGE, isSafeHoursError } from '@/lib/safe-hours';

// Opens (or re-opens) hosted Stripe Checkout for a member who signed up but
// never paid. Safe to call repeatedly — each call mints a fresh session, so a
// link that expired after 24h just gets replaced.
//
// This is POST /membership/checkout, NOT /memberships/upgrade: upgrade is for
// members with a live subscription and schedules a change at renewal, which
// would strand an unpaid account.
export async function startMembershipCheckout(
    subTier?: string
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const { url } = await createMembershipCheckout(token, subTier ? { sub_tier: subTier.toLowerCase() } : {});

        return { ok: true, url };
    } catch (error) {
        // Finishing a pending payment counts as sign-up, so it hits the Friday lockout.
        if (isSafeHoursError(error)) return { ok: false, message: SAFE_HOURS_MESSAGE };

        return {
            ok: false,
            message: error instanceof ApiError ? apiErrorMessage(error) : 'Could not start checkout.'
        };
    }
}
