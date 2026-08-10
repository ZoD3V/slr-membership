import { cache } from 'react';

import type { PrizeContent, PrizeContentUpdatePayload, PrizePool } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The stage prize pool document (PRD §"Stage Prize Pool System").
 *
 * Read from the public endpoint: the unauthenticated marketing page at /prizes
 * consumes it alongside the member page, following the /public/discounts
 * precedent. Cached for 5 minutes — the figures change only when an admin edits
 * them, and the save action revalidates both consumer routes.
 *
 * Untouched by the 2026-08-09 contract rewire — this is a different, still-
 * unconfirmed document on a different endpoint from the admin CMS below.
 */
export const getPrizePool = cache(() => {
    return apiFetch<PrizePool>(API.prizes.public, { revalidate: 300 });
});

/**
 * The admin-editable Prizes CMS document (real API, 2026-08-09). Admin-gated
 * in both directions, so neither function is wrapped in cache().
 */
export function getAdminPrizeContent(token: string) {
    return apiFetch<PrizeContent>(API.admin.prizes, { token });
}

export function updateAdminPrizeContent(token: string, payload: PrizeContentUpdatePayload) {
    return apiFetch<PrizeContent>(API.admin.prizes, {
        method: 'PUT',
        token,
        body: payload
    });
}
