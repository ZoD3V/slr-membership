import { cache } from 'react';

import type { PrizeContent, PrizeContentUpdatePayload, PrizePool } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The stage prize pool document (PRD §"Stage Prize Pool System").
 *
 * Reads from the public endpoint (`GET /api/v1/public/prizes`), which is still
 * unconfirmed live — verified 404 as of 2026-08-10, distinct from the admin
 * CMS endpoint below (`GET /api/v1/admin/prizes`, verified 200). Cached for 5
 * minutes on the assumption the eventual figures change infrequently.
 *
 * Currently has zero callers: the marketing page at src/app/(home)/(routes)/prizes
 * is fully static, and src/app/member/prizes reads the local mock in
 * @/data/prizes instead. Kept in place for the Phase 2 rewire once
 * /public/prizes is confirmed live (see docs/BACKEND-ISSUES.md) — deliberately
 * not wired up or deleted yet.
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
