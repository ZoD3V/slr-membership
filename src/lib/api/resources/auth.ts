import { cache } from 'react';

import type { AuStateCode } from '@/constant/au-states';

import { API } from '../endpoints';
import { apiFetch } from '../http';

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
    /** Optional marketing consent. Ignored by the API until the backend stores it. */
    marketing_opt_in?: boolean;
}

export interface RegisterResult {
    user_id: string;
    requires_otp: boolean;
    requires_payment: boolean;
    spin_available: boolean;

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

        sub_tier: string | null;
        status?: string;
        billing_status?: string;

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

export const login = (email: string, password: string) =>
    apiFetch<LoginResult>(API.auth.login, { method: 'POST', body: { email, password } });

export const getMe = cache((token: string) => apiFetch<MeResult>(API.auth.me, { token, cache: 'no-store' }));

export const register = (payload: RegisterPayload) =>
    apiFetch<RegisterResult>(API.auth.register, { method: 'POST', body: payload });

export const verifyOtp = (userId: string, otpCode: string) =>
    apiFetch<LoginResult>(API.auth.verifyOtp, { method: 'POST', body: { user_id: userId, otp_code: otpCode } });

export const resendOtp = (userId: string) =>
    apiFetch<null>(API.auth.resendOtp, { method: 'POST', body: { user_id: userId } });

export async function requestPasswordReset(email: string) {
    return apiFetch<null>(API.auth.forgotPassword, {
        method: 'POST',
        body: { email }
    });
}

export async function changePassword(
    token: string,
    body: { current_password: string; new_password: string; confirm_password: string }
) {
    return apiFetch<null>(API.auth.changePassword, { method: 'POST', token, body });
}

export async function resetPassword(resetToken: string, newPassword: string, confirmPassword: string) {
    return apiFetch<null>(API.auth.resetPassword, {
        method: 'POST',
        body: { reset_token: resetToken, new_password: newPassword, confirm_password: confirmPassword }
    });
}

export async function verifyEmail(token: string) {
    return apiFetch<VerifyEmailResult>(`${API.auth.verifyEmail}?token=${encodeURIComponent(token)}`, {
        cache: 'no-store'
    });
}

export async function resendVerification(email: string) {
    return apiFetch<{ sent: boolean; message: string }>(API.auth.resendVerification, {
        method: 'POST',
        body: { email }
    });
}
