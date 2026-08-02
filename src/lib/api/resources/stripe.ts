import { API } from '../endpoints';
import { apiFetch } from '../http';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export type CheckoutTier = 'RED' | 'BLUE';

export interface CheckoutSession {
    url: string;
    sessionId?: string;
}

export interface PortalSession {
    url: string;
}

// ─── Resource functions ──────────────────────────────────────────────────────
// Hosted Stripe: the app only redirects to `url`; the backend handles webhooks.
// ⚠️ Seed dev accounts have placeholder Stripe customer ids → 400 "No such
// customer"; real (checked-out) members return a live URL.

/**
 * Open a hosted Stripe Checkout for the sign-up / "change plan while pending"
 * flow. `sub_tier` (r1/r4/r7/b1/b4/b7/b10) picks an exact sub-tier; passing
 * `tier` alone lets the backend choose, which lands every signup on the cheapest
 * one (r1/b1). Safe to call repeatedly — each call mints a fresh session (the
 * previous one expires after 24h). Any won spin discount is resolved server-side here.
 */
export const createMembershipCheckout = (token: string, body: { sub_tier?: string; tier?: CheckoutTier }) =>
    apiFetch<CheckoutSession>(API.memberships.checkout, { method: 'POST', token, body });

export const createCheckoutSession = (token: string, body: { tier: CheckoutTier; couponId?: string }) =>
    apiFetch<CheckoutSession>(API.stripe.checkout, { method: 'POST', token, body });

/** Open the Stripe Billing Portal (manage cards / cancel) for the current member. */
export const createPortalSession = (token: string) =>
    apiFetch<PortalSession>(API.stripe.portal, { method: 'POST', token });
