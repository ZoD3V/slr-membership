'use server';

import { executeSpin } from '@/lib/api/resources/spin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError, apiErrorMessage } from '@/lib/api/types';

export type SpinActionResult = { ok: true; won: boolean; discount: number } | { ok: false; message: string };

/**
 * Runs the pre-renewal spin (PRD §4.5 moment 2). The server decides the outcome
 * and attaches any discount to the upcoming auto-renewal invoice — nothing is
 * passed back into checkout from here.
 */
export async function runRenewalSpin(): Promise<SpinActionResult> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const spin = await executeSpin(token);
        const won = spin.result === 'win';

        return { ok: true, won, discount: won ? spin.discount_cents / 100 : 0 };
    } catch (error) {
        return {
            ok: false,
            message: error instanceof ApiError ? apiErrorMessage(error) : 'Spin failed. Please try again.'
        };
    }
}
