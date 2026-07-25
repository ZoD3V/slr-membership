import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * Cancel my subscription at the end of the current period. Access continues
 * until the period end; no further charges. Seed dev accounts carry a fake
 * Stripe sub (`sub_seeded_*`) so this may return 400 there — the caller guards
 * it (docs/BACKEND-ISSUES.md C3).
 */
export const cancelMySubscription = (token: string) =>
    apiFetch<unknown>(API.subscriptions.cancel, { method: 'POST', token });
