'use server';

import { getCurrentMember } from '@/data/member-dashboard';
import { resendVerification } from '@/lib/api/resources/auth';
import { ApiError, apiErrorMessage } from '@/lib/api/types';

export type ResendVerificationResult =
    | { ok: true; message: string }
    | { ok: false; message: string; rateLimited: boolean };

/**
 * Looks the member's own email up server-side rather than trusting a client
 * argument — the banner button has nothing to pass but a click.
 */
export async function resendVerificationEmailAction(): Promise<ResendVerificationResult> {
    const member = await getCurrentMember();
    if (!member.email) return { ok: false, message: 'Could not find your email on this account.', rateLimited: false };

    try {
        const result = await resendVerification(member.email);

        return { ok: true, message: result.message };
    } catch (error) {
        // Repeated resends now answer a proper 429 RATE_LIMITED (fixed by the
        // backend, re-verified live 2026-08-12 — was a 500 earlier the same
        // day) — apiErrorMessage() already surfaces its message as-is.
        return {
            ok: false,
            message: error instanceof ApiError ? apiErrorMessage(error) : 'Could not resend the verification email.',
            rateLimited: error instanceof ApiError && error.status === 429
        };
    }
}
