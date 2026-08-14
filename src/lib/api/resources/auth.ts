import { cache } from 'react';

import type { AuStateCode } from '@/constant/au-states';

import { API } from '../endpoints';
import { apiFetch } from '../http';

// ─── DTOs (mirror the OpenAPI schemas) ──────────────────────────────────────

export interface RegisterPayload {
    full_name: string;
    email: string;
    password: string;
    state: AuStateCode;
    phone: string;
    dob: string;
    tier?: 'visitor' | 'red' | 'blue';
    sub_tier?: string | null;
    referral_code?: string;
}

export interface RegisterResult {
    user_id: string;
    requires_otp: boolean;
    requires_payment: boolean;
    spin_available: boolean;
    // Paid tiers get a session straight from register (verified by the Stripe
    // payment instead of an OTP email), so checkout can be called immediately.
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    user?: {
        user_id: string;
        role: string;
        tier: string;
        sub_tier: string | null;
    };
}

export interface LoginResult {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in: number;
    user: {
        user_id: string;
        role: string;
        tier: string;
        /** ⚠️ Registration-time value — stale after a plan change. Read the live
         *  one from `GET /memberships/me`. */
        sub_tier: string | null;
        status?: string;
        billing_status?: string;
        /** Signed up but never paid. Login is allowed so they can finish. */
        requires_payment?: boolean;
        spin_available?: boolean;
    };
}

export interface CurrentCycle {
    cycle_id: string;
    start_at: string;
    end_at: string;
    next_renewal_at: string;
}

export interface PendingUpgrade {
    target_sub_tier: string;
    effective_at: string;
}

export interface MeResult {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    state: string;
    dob: string | null;
    tier: string;
    sub_tier: string | null;
    token: number;
    billing_status: string;
    current_cycle: CurrentCycle | null;
    beny_active: boolean;
    pending_upgrade: PendingUpgrade | null;
    referral_code: string | null;
    requires_payment?: boolean;
    email_verified_at: string | null;
}

export interface VerifyEmailResult {
    verified: boolean;
    already_verified?: boolean;
    user_id: string;
    email_verified_at: string;
}

// ─── Resource functions ──────────────────────────────────────────────────────

export const login = (email: string, password: string) =>
    apiFetch<LoginResult>(API.auth.login, { method: 'POST', body: { email, password } });

/**
 * Live identity + membership snapshot. Wrapped in `cache` because several
 * independent surfaces need it in one render (layout sidebar, page body,
 * profile) — this collapses them to a single request per server render.
 */
export const getMe = cache((token: string) => apiFetch<MeResult>(API.auth.me, { token, cache: 'no-store' }));

/** Create an account. Visitor → `requires_otp`; paid → `requires_payment` (Stripe, later). */
export const register = (payload: RegisterPayload) =>
    apiFetch<RegisterResult>(API.auth.register, { method: 'POST', body: payload });

/** Confirm the emailed OTP. Returns a full session (discarded — user signs in after). */
export const verifyOtp = (userId: string, otpCode: string) =>
    apiFetch<LoginResult>(API.auth.verifyOtp, { method: 'POST', body: { user_id: userId, otp_code: otpCode } });

/** Ask the backend to email a new OTP code (rate-limited server-side). */
export const resendOtp = (userId: string) =>
    apiFetch<null>(API.auth.resendOtp, { method: 'POST', body: { user_id: userId } });

/** Request a password-reset email for the given address. */
export async function requestPasswordReset(email: string) {
    return apiFetch<null>(API.auth.forgotPassword, {
        method: 'POST',
        body: { email }
    });
}

/** Change the authenticated member's password (validated server-side). */
export async function changePassword(
    token: string,
    body: { current_password: string; new_password: string; confirm_password: string }
) {
    return apiFetch<null>(API.auth.changePassword, { method: 'POST', token, body });
}

/** Confirm a password reset with the token from the emailed link. */
export async function resetPassword(resetToken: string, newPassword: string, confirmPassword: string) {
    return apiFetch<null>(API.auth.resetPassword, {
        method: 'POST',
        body: { reset_token: resetToken, new_password: newPassword, confirm_password: confirmPassword }
    });
}

/** Confirm the emailed verification link (paid tiers — Visitor uses OTP instead). */
export async function verifyEmail(token: string) {
    return apiFetch<VerifyEmailResult>(`${API.auth.verifyEmail}?token=${encodeURIComponent(token)}`, {
        cache: 'no-store'
    });
}

/** Ask the backend to re-send the verification link (rate-limited server-side). */
export async function resendVerification(email: string) {
    return apiFetch<{ sent: boolean; message: string }>(API.auth.resendVerification, {
        method: 'POST',
        body: { email }
    });
}
