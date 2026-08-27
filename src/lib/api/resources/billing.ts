import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export interface BillingStatus {
    billing_status: 'active' | 'grace' | 'inactive' | string;
    next_renewal_at: string | null;
    grace_period: { started_at: string; expires_at: string } | null;
    stripe_subscription_id: string | null;
    subscription_status?: string;
    cancel_at_period_end?: boolean;
}

export interface BillingInvoice {
    invoice_id: string;
    amount_cents: number;
    discount_cents: number;
    stripe_invoice_id: string | null;
    paid_at: string | null;
    type: 'initial' | 'renewal' | 'manual_grace' | string;

    hosted_invoice_url?: string | null;
}

export const getBillingStatus = cache((token: string) =>
    apiFetch<BillingStatus>(API.billing.status, { token, cache: 'no-store' })
);

export const getBillingInvoices = cache((token: string, page = 1, perPage = 10) =>
    apiFetch<BillingInvoice[]>(`${API.billing.invoices}?page=${page}&per_page=${perPage}`, {
        token,
        cache: 'no-store'
    })
);

export interface GraceCheckout {
    checkout_url: string;
    session_id: string;
}

export const payGraceInvoice = (token: string) =>
    apiFetch<GraceCheckout>(API.billing.payManual, { method: 'POST', token });
