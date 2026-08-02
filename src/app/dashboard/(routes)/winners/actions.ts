'use server';

import { handleApiAuthError } from '@/lib/api/guard';
import {
    type AdminMemberDetailCycle,
    type AdminMemberListItem,
    getAdminMemberDetail,
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

// ── draw_pass gate ───────────────────────────────────────────────────────────
// A member on draw_pass 0 has left the cycle's pool (they already won, or spent
// all four passes), so they must not be selectable as a winner.
//
// This costs one detail request per member: verified against the live OpenAPI
// (2026-08-03), `GET /admin/members` declares `additionalProperties: false` and
// carries neither `draw_pass` nor `entry_status`, and exposes no filter for
// them — `cycles[].draw_pass` on `GET /admin/members/{userId}` is the only
// source. See docs/BACKEND-ISSUES.md for the ask that would make this one call.

/** Requests in flight at once — enough to stay quick without flooding the API. */
const DETAIL_CONCURRENCY = 8;

/** The cycle the member is in right now: the active one, else the most recent. */
function currentCycle(cycles: AdminMemberDetailCycle[]): AdminMemberDetailCycle | null {
    if (!cycles.length) return null;
    const active = cycles.find((c) => c.status?.toLowerCase() === 'active');
    if (active) return active;

    return [...cycles].sort((a, b) => (b.start_at ?? '').localeCompare(a.start_at ?? ''))[0] ?? null;
}

async function isInPool(userId: string, token: string): Promise<boolean> {
    try {
        const detail = await getAdminMemberDetail(userId, token);
        const cycle = currentCycle(detail.cycles ?? []);
        // No cycle at all means entries were never allocated — not in any pool.
        if (!cycle) return false;

        // `-1` is the Visitor "infinite passes" sentinel, so only an exact 0 excludes.
        return cycle.draw_pass !== 0;
    } catch {
        // A failed lookup must not silently hide a member who is genuinely eligible.
        return true;
    }
}

/** Drops members whose current cycle sits on draw_pass 0. */
async function withDrawPass(members: AdminMemberListItem[], token: string): Promise<AdminMemberListItem[]> {
    const kept: AdminMemberListItem[] = [];

    for (let i = 0; i < members.length; i += DETAIL_CONCURRENCY) {
        const batch = members.slice(i, i + DETAIL_CONCURRENCY);
        const eligible = await Promise.all(batch.map((m) => isInPool(m.user_id, token)));
        batch.forEach((m, j) => {
            if (eligible[j]) kept.push(m);
        });
    }

    return kept;
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
        const eligible = await withDrawPass(scoped, token);

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
