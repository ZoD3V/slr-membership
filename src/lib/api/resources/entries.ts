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

/**
 * `current_cycle` should stop being current once `end_at` passes — renewal is
 * meant to replace it with a new cycle. When that doesn't happen (docs/BACKEND-
 * ISSUES-SPRINT3-GIVEAWAYS.md G2: seen live 4 days past `end_at`, still
 * `entry_status: "active"`), trusting the API's own `entry_status` reports a
 * stale token count and draw eligibility as current. Missing `end_at` (seen on
 * `history[]` rows) can't be judged either way, so it's treated as not expired.
 */
export function isCycleExpired(cycle: EntryCycle): boolean {
    if (!cycle.end_at) return false;
    const end = Date.parse(cycle.end_at);

    return !Number.isNaN(end) && end < Date.now();
}

/**
 * Entry history grouped by billing cycle (current + past). `current_cycle` is
 * the live draw-cycle surface — entry_status + total_token + renewal window.
 */
export const getEntryHistory = cache((token: string) => {
    return apiFetch<EntryHistoryResponse>(API.entries.history, { token, cache: 'no-store' });
});
