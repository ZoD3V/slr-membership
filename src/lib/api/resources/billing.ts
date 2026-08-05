import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

// ─── DTOs (mirrored from the live responses) ─────────────────────────────────

export interface BillingStatus {
    billing_status: 'active' | 'grace' | 'inactive' | string;
    next_renewal_at: string | null;
    grace_period: { started_at: string; expires_at: string } | null;
    stripe_subscription_id: string | null;
    subscription_status?: string;
    cancel_at_period_end?: boolean;
}

// GET /billing/invoices → `data` is the invoice array (meta holds pagination).
// ⚠️ Item fields per the FE Stripe guide — seed invoices are empty, so unverified live.
export interface BillingInvoice {
    invoice_id: string;
    amount_cents: number;
    discount_cents: number;
    stripe_invoice_id: string | null;
    paid_at: string | null;
    type: 'initial' | 'renewal' | 'manual_grace' | string;
    /**
     * Stripe-hosted invoice page (client note A3, backend added 2026-07-26). Optional
     * + guarded: not present on the public OpenAPI schema yet and no paid invoice exists
     * to verify live — render the download link only when the field is populated.
     */
    hosted_invoice_url?: string | null;
}

// ─── Resource functions ──────────────────────────────────────────────────────

/** Current billing state (active / grace / inactive) + next renewal date. */
export const getBillingStatus = cache((token: string) =>
    apiFetch<BillingStatus>(API.billing.status, { token, cache: 'no-store' })
);

/** Paginated invoice / payment history. */
export const getBillingInvoices = cache((token: string, page = 1, perPage = 10) =>
    apiFetch<BillingInvoice[]>(`${API.billing.invoices}?page=${page}&per_page=${perPage}`, {
        token,
        cache: 'no-store'
    })
);

// POST /billing/pay-manual → hosted Stripe checkout for a grace-period invoice.
export interface GraceCheckout {
    checkout_url: string;
    session_id: string;
}

/** Start a manual payment for the current grace-period invoice (redirect to `checkout_url`). */
export const payGraceInvoice = (token: string) =>
    apiFetch<GraceCheckout>(API.billing.payManual, { method: 'POST', token });
