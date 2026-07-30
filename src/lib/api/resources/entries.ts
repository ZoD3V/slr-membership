import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export interface EntryCycle {
    cycle_id: string;
    // Past-cycle rows (`history[]`) can omit these entirely — seen live after a
    // plan swap mid-checkout. Never assume they're present.
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

export const getEntryHistory = cache((token: string) => {
    return apiFetch<EntryHistoryResponse>(API.entries.history, { token, cache: 'no-store' });
});
