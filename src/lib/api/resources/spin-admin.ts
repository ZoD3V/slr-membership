import type { SpinConfig, SpinEligibleSubTier, SpinHistoryRow } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * Admin-only spin wheel functions (PRD §5.7). Kept separate from spin.ts, which
 * is the member-facing "check status / execute a spin" module — different
 * audience, different auth, no shared code.
 */

export interface SpinHistoryFilters {
    tier?: SpinEligibleSubTier;
    moment?: 'registration' | 'renewal';
}

function historyQuery(filters?: SpinHistoryFilters): string {
    const params = new URLSearchParams();
    if (filters?.tier) params.set('tier', filters.tier);
    if (filters?.moment) params.set('moment', filters.moment);

    const query = params.toString();

    return query ? `?${query}` : '';
}

export function getAdminSpinHistory(token: string, filters?: SpinHistoryFilters) {
    return apiFetch<SpinHistoryRow[]>(`${API.admin.spinHistory}${historyQuery(filters)}`, { token });
}

export function getAdminSpinConfig(token: string) {
    return apiFetch<SpinConfig>(API.admin.spinConfig, { token });
}

export function updateAdminSpinConfig(token: string, payload: SpinConfig) {
    return apiFetch<SpinConfig>(API.admin.spinConfig, {
        method: 'PUT',
        token,
        body: payload
    });
}
