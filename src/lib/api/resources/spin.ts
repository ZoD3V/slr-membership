import { API } from '../endpoints';
import { apiFetch } from '../http';

// ─── DTOs ────────────────────────────────────────────────────────────────────

/** When the spin is offered: at sign-up, or H-2 (48h) before an auto-renewal. */
export type SpinMoment = 'registration' | 'renewal';

export interface SpinStatus {
    available: boolean;
    moment: SpinMoment | string | null;
    expires_at: string | null;
    /** Prize on offer, in cents — not what was won. */
    discount_cents: number;
}

export interface SpinResult {
    result: 'win' | 'lose';
    /** Won amount in cents (0 when `result` is `lose`). */
    discount_cents: number;
    spin_token: string;
    applies_to: string;
}

// ─── Resource functions ──────────────────────────────────────────────────────
// Eligibility is per (user_id, moment) — NOT per sub-tier. Changing plan does
// not hand out a second spin, so a member can't re-roll until they win.
// A below-eligible sub-tier (r1/b1) gets 403; treat that as "no spin".
// The won discount is applied by the backend at checkout, so nothing needs to
// be forwarded to `createMembershipCheckout`.

/** Whether a spin is currently offered (and at which moment). */
export const getSpinStatus = (token: string) => apiFetch<SpinStatus>(API.spin.status, { token, cache: 'no-store' });

/** Spin the wheel once. The backend decides win/lose (1/4 odds) and records it. */
export const executeSpin = (token: string) => apiFetch<SpinResult>(API.spin.execute, { method: 'POST', token });
