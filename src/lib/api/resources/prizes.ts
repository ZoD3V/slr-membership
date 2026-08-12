import type { PrizeContent, PrizeContentUpdatePayload } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The member-facing prize pool document (PRD §"Stage Prize Pool System") — the
 * same flat CMS document as the admin editor below, on the member-readable
 * `GET /api/v1/prizes` (Bearer-gated, verified 200 live 2026-08-12; the old
 * assumed `/public/prizes` path stays 404). Not wrapped in `cache()`: it needs
 * the caller's own token, so it can't be shared across members within a request.
 */
export function getPrizePool(token: string) {
    return apiFetch<PrizeContent>(API.prizes.member, { token });
}

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
