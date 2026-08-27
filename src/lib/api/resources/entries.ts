import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export interface EntryCycle {
    cycle_id: string;

    start_at?: string | null;
    end_at?: string | null;
    tier: string;
    base_token: number;
    referral_bonus: number;
    total_token: number;
    entry_status: 'active' | 'inactive';
}

export interface EntryHistoryResponse {
    current_cycle: EntryCycle | null;
    history: EntryCycle[];
}

export function isCycleExpired(cycle: EntryCycle): boolean {
    if (!cycle.end_at) return false;
    const end = Date.parse(cycle.end_at);

    return !Number.isNaN(end) && end < Date.now();
}

export const getEntryHistory = cache((token: string) => {
    return apiFetch<EntryHistoryResponse>(API.entries.history, { token, cache: 'no-store' });
});
