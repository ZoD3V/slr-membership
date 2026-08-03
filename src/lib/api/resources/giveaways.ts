import { cache } from 'react';

import { formatDrawPool, formatShortDate, isGiveawayLocked } from '@/lib/member';
import type {
    EntryStatus,
    Giveaway,
    GiveawayDetail,
    GiveawayEntryRow,
    GiveawayPhase,
    PastWinner,
    TierGroup
} from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';
import type { EntryCycle } from './entries';

// ─── DTOs (mirrored from the live GET /giveaways/winners response) ────────────

/**
 * The giveaway STUB embedded in both winners endpoints. Verified against the live
 * OpenAPI 2026-08-03: `additionalProperties: false` on `GET /admin/winners` and
 * `GET /giveaways/winners`, carrying only these fields — **no `opens_at` /
 * `closes_at` / `draws_at`**. Anything needing the schedule must join it in from
 * `GET /admin/giveaways` by `giveaway_id`.
 */
export interface GiveawayWinnerGiveaway {
    giveaway_id: string;
    name: string;
    tier: string;
    type: string;
    /** Present on the admin stub only; the member endpoint omits it. */
    prize?: string;
}

export interface GiveawayWinner {
    winner_id: string;
    user_id: string;
    full_name: string;
    state: string;
    prize: string;
    recorded_at: string;
    giveaway: GiveawayWinnerGiveaway;
}

// ─── Resource functions (React.cache = per-request dedup) ─────────────────────

export const getGiveawayWinners = cache((token: string) =>
    apiFetch<GiveawayWinner[]>(API.giveaways.winners, { token, cache: 'no-store' })
);

// ─── Active giveaways (list + detail) ────────────────────────────────────────
// DTO confirmed against the live response (2026-07-09) AND the Notion API Contract
// v1.0 (GET /giveaways) — they match field-for-field.

export interface ApiGiveaway {
    giveaway_id: string;
    name: string;
    tier: string; // 'visitor' | 'red' | 'blue'
    type: string; // 'weekly' | 'monthly'
    prize: string | null;
    opens_at: string | null;
    closes_at: string | null;
    draws_at: string | null;
    is_entered: boolean;
    entry_status: EntryStatus | null;
}

// Embedded winner rows on the detail (same fields as GET /giveaways/winners; empty until a draw is recorded).
export interface ApiGiveawayWinnerRow {
    full_name?: string | null;
    state?: string | null;
    prize?: string | null;
    recorded_at?: string | null;
}

// GET /giveaways/{id} — meta + winners only. NO entry status / rules / description /
// pool counts (the list carries entry status; the rest isn't exposed → see below).
export interface ApiGiveawayDetail {
    giveaway_id: string;
    name: string;
    tier: string;
    type: string;
    prize: string | null;
    opens_at: string | null;
    closes_at: string | null;
    draws_at: string | null;
    winners: ApiGiveawayWinnerRow[];
}

// Static copy stopgap. The Notion API Contract v1.0 says GET /giveaways/{id} SHOULD
// return rules ("aturan") + a TPAL cert note + entry history + past winners, but the
// LIVE detail only returns meta + winners[]. Until the backend implements the rest,
// rules/TPAL are filled from CLAUDE.md §1. See docs/BACKEND-ISSUES.md.
const GIVEAWAY_RULES = [
    'Entries are allocated automatically each 28-day cycle — no manual entry needed.',
    'Your number of entries equals your active tokens for the cycle.',
    'Winners are drawn externally and certified via TPAL (randomdraws.com.au).',
    'Entries reset every cycle and do not carry over.'
];
const TPAL_NOTE =
    'Draws are conducted externally and certified via TPAL (randomdraws.com.au). Entry lists are exported per tier each cycle.';

/** API `tier` ('visitor' | 'red' | 'blue') → the UI tier group. */
export function tierGroupFromApi(tier: string | undefined): TierGroup {
    const t = tier?.toUpperCase();
    if (t === 'RED') return 'red';
    if (t === 'BLUE') return 'blue';

    return 'visitor';
}

function toPastWinner(w: ApiGiveawayWinnerRow): PastWinner {
    return {
        name: w.full_name?.trim() || '-',
        state: w.state?.trim() || '-',
        prize: w.prize?.trim() || '-',
        drawn_at: w.recorded_at ?? ''
    };
}

// The API exposes entries at the cycle level, not per giveaway (one token count
// applies to every giveaway in the member's tier). So "Your Entries" reflects the
// member's current-cycle allocation — shown only when they're actually entered in
// this giveaway. Past cycles are omitted: the entries feed can't tell us which
// specific giveaways a member was in historically.
function toEntryHistory(cycle: EntryCycle | null, entered: boolean): GiveawayEntryRow[] {
    if (!entered || !cycle) return [];

    return [
        {
            cycle: `Current Cycle · ${formatShortDate(cycle.start_at)} – ${formatShortDate(cycle.end_at)}`,
            entries: cycle.total_token,
            status: cycle.entry_status
        }
    ];
}

/** Where a giveaway sits in its window: before opens_at / open / past draws_at. */
export function giveawayPhase(opensAt: string | null | undefined, drawsAt: string | null | undefined): GiveawayPhase {
    const now = Date.now();
    const draws = Date.parse(drawsAt ?? '');
    if (!Number.isNaN(draws) && now >= draws) return 'drawn';
    const opens = Date.parse(opensAt ?? '');
    if (!Number.isNaN(opens) && now < opens) return 'upcoming';

    return 'active';
}

/**
 * Map an API giveaway → the UI `Giveaway`. The API exposes no `state` or per-giveaway
 * entry/pool counts, so pool = the member's `state + tier`, and (per CLAUDE.md §1)
 * a member's entries = their active token count for the cycle (`memberTokens`).
 *
 * Entry claims are gated by phase: entries are per-cycle (PRD — reset each cycle,
 * no carry-over), so `is_entered`/tokens only apply while the draw window is live.
 * The API sends `is_entered: true` even for drawn/not-yet-open draws — ignore it there.
 */
export function toGiveaway(g: ApiGiveaway, memberGroup: TierGroup, memberState: string, memberTokens = 0): Giveaway {
    const group = tierGroupFromApi(g.tier);
    const locked = isGiveawayLocked(group, memberGroup);
    const phase = giveawayPhase(g.opens_at, g.draws_at);
    const entered = phase === 'active' && (g.is_entered ?? false);
    const type = g.type?.toLowerCase();

    return {
        id: g.giveaway_id || '-',
        title: g.name?.trim() || '-',
        tier_group: group,
        draw_type: type === 'weekly' || type === 'monthly' ? type : null,
        draw_pool: formatDrawPool(group, memberState || '-'),
        prize_label: g.prize?.trim() || '-',
        entered,
        entry_status: entered ? (g.entry_status ?? 'inactive') : 'inactive',
        total_entries: entered ? memberTokens : 0,
        pool_entries: 0, // community pool count not exposed by the API
        locked,
        phase,
        opens_at: g.opens_at ?? '',
        draws_at: g.draws_at ?? ''
    };
}

const PHASE_ORDER: Record<GiveawayPhase, number> = { active: 0, upcoming: 1, drawn: 2 };

const timeMs = (iso: string): number => {
    const t = Date.parse(iso);

    return Number.isNaN(t) ? Infinity : t;
};

/**
 * Display order: live draws first (soonest draw), then not-yet-open (soonest
 * opening), already-drawn last (most recent first).
 */
export function compareGiveaways(a: Giveaway, b: Giveaway): number {
    const byPhase = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase];
    if (byPhase !== 0) return byPhase;
    if (a.phase === 'drawn') return timeMs(b.draws_at) - timeMs(a.draws_at);
    if (a.phase === 'upcoming') return timeMs(a.opens_at) - timeMs(b.opens_at);

    return timeMs(a.draws_at) - timeMs(b.draws_at);
}

/**
 * Map an API giveaway detail → the UI `GiveawayDetail`. The detail endpoint omits
 * entry status, so the matching `listItem` (from GET /giveaways/) fills it. Rules/
 * TPAL copy are static (see above); `winners[]` → past winners.
 */
export function toGiveawayDetail(
    d: ApiGiveawayDetail,
    listItem: ApiGiveaway | undefined,
    memberGroup: TierGroup,
    memberState: string,
    currentCycle: EntryCycle | null = null
): GiveawayDetail {
    const memberTokens = currentCycle?.total_token ?? 0;
    const base = toGiveaway(
        {
            giveaway_id: d.giveaway_id,
            name: d.name,
            tier: d.tier,
            type: d.type,
            prize: d.prize,
            opens_at: d.opens_at,
            closes_at: d.closes_at,
            draws_at: d.draws_at,
            is_entered: listItem?.is_entered ?? false,
            entry_status: listItem?.entry_status ?? 'inactive'
        },
        memberGroup,
        memberState,
        memberTokens
    );

    return {
        ...base,
        prize_description: d.prize?.trim() || '-',
        rules: GIVEAWAY_RULES,
        tpal_note: TPAL_NOTE,
        entry_history: toEntryHistory(currentCycle, base.entered),
        past_winners: (d.winners ?? []).map(toPastWinner)
    };
}

/** Active giveaways for the member's tier (live). */
export const getGiveaways = cache((token: string) =>
    apiFetch<ApiGiveaway[]>(API.giveaways.list, { token, cache: 'no-store' })
);

/** One giveaway's detail (meta + winners). Merge with the list item for entry status. */
export const getGiveaway = cache((id: string, token: string) =>
    apiFetch<ApiGiveawayDetail>(API.giveaways.detail(id), { token, cache: 'no-store' })
);

// ─── Admin CRUD ───────────────────────────────────────────────────────────────
// Verified against the live API 2026-08-02. Two things differ from the member
// endpoints above and are easy to get wrong:
//   1. Responses wrap rows in `data.items` + `data.pagination` (not a bare array).
//   2. `tier`/`type` are UPPERCASE here ('RED'/'WEEKLY'); the member endpoints
//      return lowercase. Sending lowercase to admin writes → 400.

/** `data` envelope used by every paginated admin list. */
export interface Paginated<T> {
    items: T[];
    pagination: { page: number; per_page: number; total: number; total_pages: number };
}

export type AdminGiveawayTier = 'VISITOR' | 'RED' | 'BLUE';
export type AdminGiveawayType = 'WEEKLY' | 'MONTHLY';

/** Server-derived lifecycle — do not recompute it from the dates. */
export type AdminGiveawayStatus = 'OPEN' | 'CLOSED' | 'DRAWN' | string;

export interface AdminGiveaway {
    giveaway_id: string;
    name: string;
    tier: AdminGiveawayTier;
    type: AdminGiveawayType;
    prize: string | null;
    status: AdminGiveawayStatus;
    opens_at: string | null;
    closes_at: string | null;
    draws_at: string | null;
    created_at: string | null;
    winner_count: number;
    entry_count: number;
}

/** All seven fields are required — the API rejects a partial body. */
export interface AdminGiveawayPayload {
    name: string;
    tier: AdminGiveawayTier;
    type: AdminGiveawayType;
    prize: string;
    opens_at: string;
    closes_at: string;
    draws_at: string;
}

export interface AdminWinner {
    winner_id: string;
    giveaway_id?: string;
    user_id: string;
    full_name?: string | null;
    state?: string | null;
    prize: string;
    recorded_at?: string | null;
    giveaway?: GiveawayWinnerGiveaway;
}

/** Name/state come from the member record — only these three are accepted. */
export interface AdminWinnerPayload {
    giveaway_id: string;
    user_id: string;
    prize: string;
}

interface ListQuery {
    page?: number;
    perPage?: number;
    giveawayId?: string;
}

function listQs(query: ListQuery = {}): string {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.perPage) params.set('per_page', String(query.perPage));
    if (query.giveawayId) params.set('giveaway_id', query.giveawayId);
    const qs = params.toString();

    return qs ? `?${qs}` : '';
}

/** Admin: list giveaways (paginated, UPPERCASE tier/type). */
export const getAdminGiveaways = (token: string, query: ListQuery = {}) =>
    apiFetch<Paginated<AdminGiveaway>>(`${API.admin.giveaways}${listQs(query)}`, { token, cache: 'no-store' });

/** Server-enforced ceiling: per_page above this returns 400 VALIDATION_ERROR. */
const MAX_PER_PAGE = 100;

/**
 * Admin: every giveaway, following pagination. Both admin lists silently IGNORE
 * `?search=` (verified live 2026-08-03 — a bogus term still returns every row),
 * so search has to happen client-side over the full set.
 */
export async function getAllAdminGiveaways(token: string): Promise<AdminGiveaway[]> {
    const all: AdminGiveaway[] = [];

    for (let page = 1; ; page++) {
        const res = await getAdminGiveaways(token, { page, perPage: MAX_PER_PAGE });
        all.push(...res.items);
        if (res.items.length < MAX_PER_PAGE) break;
    }

    return all;
}

/** Admin: every recorded winner, following pagination (see getAllAdminGiveaways on why). */
export async function getAllAdminWinners(token: string, giveawayId?: string): Promise<AdminWinner[]> {
    const all: AdminWinner[] = [];

    for (let page = 1; ; page++) {
        const res = await getAdminWinners(token, { page, perPage: MAX_PER_PAGE, giveawayId });
        all.push(...res.items);
        if (res.items.length < MAX_PER_PAGE) break;
    }

    return all;
}

/** Admin: one giveaway's full record. */
export const getAdminGiveaway = (id: string, token: string) =>
    apiFetch<AdminGiveaway>(API.admin.giveawayDetail(id), { token, cache: 'no-store' });

/** Admin: create a giveaway. */
export const createGiveaway = (token: string, payload: AdminGiveawayPayload) =>
    apiFetch<AdminGiveaway>(API.admin.giveaways, { method: 'POST', token, body: payload });

/** Admin: update a giveaway. PUT, not PATCH — PATCH answers 404. */
export const updateGiveaway = (token: string, id: string, payload: AdminGiveawayPayload) =>
    apiFetch<AdminGiveaway>(API.admin.giveawayDetail(id), { method: 'PUT', token, body: payload });

/** Admin: delete a giveaway. */
export const deleteGiveaway = (token: string, id: string) =>
    apiFetch<null>(API.admin.giveawayDetail(id), { method: 'DELETE', token });

/** Admin: list recorded winners (paginated). */
export const getAdminWinners = (token: string, query: ListQuery = {}) =>
    apiFetch<Paginated<AdminWinner>>(`${API.admin.winners}${listQs(query)}`, { token, cache: 'no-store' });

/** Admin: record a winner for a giveaway. */
export const createWinner = (token: string, payload: AdminWinnerPayload) =>
    apiFetch<AdminWinner>(API.admin.winners, { method: 'POST', token, body: payload });

/** Admin: edit a recorded winner. PUT, not PATCH — PATCH answers 404. */
export const updateWinner = (token: string, id: string, payload: AdminWinnerPayload) =>
    apiFetch<AdminWinner>(API.admin.winnerDetail(id), { method: 'PUT', token, body: payload });

/** Admin: delete a winner record. */
export const deleteWinner = (token: string, id: string) =>
    apiFetch<null>(API.admin.winnerDetail(id), { method: 'DELETE', token });
