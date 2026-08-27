'use server';

import { createMembershipCheckout } from '@/lib/api/resources/stripe';
import { getAccessToken } from '@/lib/api/server';
import { ApiError, apiErrorMessage } from '@/lib/api/types';
import { SAFE_HOURS_MESSAGE, isSafeHoursError } from '@/lib/safe-hours';

export async function startMembershipCheckout(
    subTier?: string
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const { url } = await createMembershipCheckout(token, subTier ? { sub_tier: subTier.toLowerCase() } : {});

        return { ok: true, url };
    } catch (error) {
        if (isSafeHoursError(error)) return { ok: false, message: SAFE_HOURS_MESSAGE };

        return {
            ok: false,
            message: error instanceof ApiError ? apiErrorMessage(error) : 'Could not start checkout.'
        };
    }
}
