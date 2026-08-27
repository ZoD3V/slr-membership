'use server';

import { type BenyStatusValue, type BenySubscribePayload, cancelBeny, subscribeBeny } from '@/lib/api/resources/beny';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';

type BenyActionResult =
    | { ok: true; status: BenyStatusValue; message: string; checkoutUrl?: string | null }
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

    try {
        const data = await subscribeBeny(token, payload);

        return {
            ok: true,
            status: data.beny_status ?? 'pending_activation',
            message: 'BENY subscription requested.',
            checkoutUrl: data.checkout_url ?? null
        };
    } catch (error) {
        return toBenyError(error);
    }
}

export async function cancelBenyAction(): Promise<BenyActionResult> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
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
