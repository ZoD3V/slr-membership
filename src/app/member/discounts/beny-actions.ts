'use server';

import { type BenyStatusValue, type BenySubscribePayload, cancelBeny, subscribeBeny } from '@/lib/api/resources/beny';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';

type BenyActionResult =
    | { ok: true; status: BenyStatusValue; message: string }
    | { ok: false; message: string; code?: string | null };

function toBenyError(error: unknown): BenyActionResult {
    if (error instanceof ApiError) {
        const payload = error.payload as { code?: string } | undefined;

        return { ok: false, message: error.message, code: payload?.code ?? null };
    }

    return { ok: false, message: 'Something went wrong. Please try again.' };
}

export async function subscribeBenyAction(payload: BenySubscribePayload): Promise<BenyActionResult> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    // ⚠️ BACKEND BLOCK — remove this comment once Stripe is wired.
    // PRD §1: the BENY add-on must redirect to Stripe Checkout ($4/mo) BEFORE the
    // pending record is created. The live POST /beny/subscribe creates the pending
    // subscription immediately WITHOUT collecting payment (no checkout URL in the
    // response). We call it directly for now; once the backend returns a Stripe
    // checkout session, redirect to it here and let the webhook create the pending.
    try {
        const data = await subscribeBeny(token, payload);

        return { ok: true, status: data.beny_status ?? 'pending_activation', message: 'BENY subscription requested.' };
    } catch (error) {
        return toBenyError(error);
    }
}

export async function cancelBenyAction(): Promise<BenyActionResult> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        // The cancel response carries no beny_status. Cancelling does NOT end
        // access — it moves the subscription to pending_deactivation and the
        // member keeps BENY until the paid period ends and an admin revokes it
        // in the BENY portal (PRD §2.3). Reporting 'cancelled' here would tell
        // members their access is gone while they can still use it.
        await cancelBeny(token);

        return {
            ok: true,
            status: 'pending_deactivation',
            message: 'BENY cancelled — access continues until the end of your paid period.'
        };
    } catch (error) {
        return toBenyError(error);
    }
}
