import { cache } from 'react';

import type { PrizeContent, PrizeContentUpdatePayload } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The member-facing prize pool document (PRD §"Stage Prize Pool System") — the
 * same flat CMS document as the admin editor below, on `GET /api/v1/prizes`
 * (the old assumed `/public/prizes` path stays 404). Not wrapped in `cache()`:
 * it passes the caller's own token, so it can't be shared across members
 * within a request.
 *
 * The endpoint no longer requires that token (see `getPublicPrizeContent`), but
 * the member reader keeps sending it so a future re-gate doesn't break /member.
 */
export function getPrizePool(token: string) {
    return apiFetch<PrizeContent>(API.prizes.member, { token });
}

/** Cache tag for the public read below — purged by the admin save action. */
export const PRIZE_CONTENT_TAG = 'prize-content';

/**
 * The same document read without a token, for the public marketing page.
 * Verified live 2026-08-22: 200 unauthenticated. Revalidated hourly — prize
 * stages turn over far slower than that, and the public page must stay fast.
 * Tagged so an admin save can purge it immediately instead of leaving the
 * marketing page up to an hour stale.
 */
export const getPublicPrizeContent = cache(() =>
    apiFetch<PrizeContent>(API.prizes.member, { revalidate: 3600, tags: [PRIZE_CONTENT_TAG] })
);

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
