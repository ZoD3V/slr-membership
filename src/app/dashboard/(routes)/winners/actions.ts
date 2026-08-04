'use server';

import { handleApiAuthError } from '@/lib/api/guard';
import {
    type AdminMemberListItem,
    getAdminMembers
} from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { TierGroup } from '@/types/member';

export interface WinnerMemberOption {
    /** `user_id` — what POST /admin/winners actually wants. */
    id: string;
    name: string;
    email: string;
    /** Still carried (not a picker column) — the winner form shows it under the name. */
    state: string;
    status: string;
}

export type MemberSearchResult = { ok: true; data: WinnerMemberOption[] } | { ok: false; message: string };

export interface WinnerMemberQuery {
    /** The giveaway's tier — one half of the draw pool. */
    tier: TierGroup;
    /** AU state code — the other half. Omitted means every state. */
    state?: string;
    search?: string;
}

/** Server-enforced ceiling: per_page above this returns 400 VALIDATION_ERROR. */
const MAX_PER_PAGE = 100;

/**
 * Every member matching the query, following pagination. The picker filters on
 * `state` afterwards, so a single page could otherwise hide matches sitting on
 * page two.
 */
async function fetchAllMembers(token: string, tier: TierGroup, search?: string): Promise<AdminMemberListItem[]> {
    const all: AdminMemberListItem[] = [];

    for (let page = 1; ; page++) {
        const batch = await getAdminMembers(token, { tier, search, page, perPage: MAX_PER_PAGE });
        all.push(...batch);
        if (batch.length < MAX_PER_PAGE) break;
    }

    return all;
}

/**
 * Members eligible to be recorded as a winner of a giveaway, scoped to its draw
 * pool (CLAUDE.md §1: pool = state + tier).
 *
 * `tier` and `search` are API parameters; **`state` is not** — GET /admin/members
 * exposes no state filter, so that half of the pool is narrowed here. Members on
 * draw_pass 0 are dropped last, once the cheap filters have cut the set down.
 */
export async function searchWinnerMembersAction(query: WinnerMemberQuery): Promise<MemberSearchResult> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const search = query.search?.trim();
        const rows = await fetchAllMembers(token, query.tier, search || undefined);
        const scoped = query.state ? rows.filter((m) => m.state === query.state) : rows;

        // Only a live account can be recorded as a winner: `pending_payment`
        // (registered but never paid), `suspended` and `deactivated` members are
        // not in any draw pool.
        const active = scoped.filter((m) => m.status?.toLowerCase() === 'active');
        const eligible = active.filter((m) => m.draw_pass !== 0);

        return {
            ok: true,
            data: eligible.map((m) => ({
                id: m.user_id,
                name: m.full_name || '-',
                email: m.email || '-',
                state: m.state || '-',
                status: m.status || '-'
            }))
        };
    } catch (error) {
        // 401 (expired/invalid session) → redirect('/api/auth/logout'), never returns.
        handleApiAuthError(error);

        return {
            ok: false,
            message: error instanceof ApiError ? error.message : 'Could not load members. Please try again.'
        };
    }
}
