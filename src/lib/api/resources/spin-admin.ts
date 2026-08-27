import type { SpinConfig, SpinHistoryMeta, SpinHistoryRow, SpinMoment, SpinTierId } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch, apiFetchPaginated } from '../http';

export interface SpinHistoryFilters {
    tier?: SpinTierId;
    moment?: SpinMoment;
    page?: number;
    perPage?: number;
}

function historyQuery(filters?: SpinHistoryFilters): string {
    const params = new URLSearchParams();
    if (filters?.tier) params.set('tier', filters.tier);
    if (filters?.moment) params.set('moment', filters.moment);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.perPage) params.set('per_page', String(filters.perPage));

    const query = params.toString();

    return query ? `?${query}` : '';
}

export function getAdminSpinHistory(token: string, filters?: SpinHistoryFilters) {
    return apiFetchPaginated<SpinHistoryRow[], SpinHistoryMeta>(`${API.admin.spinHistory}${historyQuery(filters)}`, {
        token
    });
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
