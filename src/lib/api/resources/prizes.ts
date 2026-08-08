import { cache } from 'react';

import type { PrizePool } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The stage prize pool document (PRD §"Stage Prize Pool System").
 *
 * Read from the public endpoint: the unauthenticated marketing page at /prizes
 * consumes it alongside the member page, following the /public/discounts
 * precedent. Cached for 5 minutes — the figures change only when an admin edits
 * them, and the save action revalidates both consumer routes.
 */
export const getPrizePool = cache(() => {
    return apiFetch<PrizePool>(API.prizes.public, { revalidate: 300 });
});

/** Full-document replace. Admin only. */
export function updatePrizePool(token: string, payload: PrizePool) {
    return apiFetch<PrizePool>(API.prizes.update, {
        method: 'PUT',
        token,
        body: payload
    });
}
