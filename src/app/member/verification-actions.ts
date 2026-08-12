'use server';

import { getCurrentMember } from '@/data/member-dashboard';
import { resendVerification } from '@/lib/api/resources/auth';
import { ApiError, apiErrorMessage } from '@/lib/api/types';

export type ResendVerificationResult = { ok: true; message: string } | { ok: false; message: string };

/**
 * Looks the member's own email up server-side rather than trusting a client
 * argument — the banner button has nothing to pass but a click.
 */
export async function resendVerificationEmailAction(): Promise<ResendVerificationResult> {
    const member = await getCurrentMember();
    if (!member.email) return { ok: false, message: 'Could not find your email on this account.' };

    try {
        const result = await resendVerification(member.email);

        return { ok: true, message: result.message };
    } catch (error) {
        // Repeated resends currently 500 instead of a clean 429 (verified live
        // 2026-08-12, see BACKEND-ISSUES.md) — the cause is an unhandled
        // backend error, not confirmed to be time-based, so this stays a
        // generic retry message rather than claiming a rate limit we can't verify.
        return {
            ok: false,
            message: error instanceof ApiError ? apiErrorMessage(error) : 'Could not resend the verification email.'
        };
    }
}
