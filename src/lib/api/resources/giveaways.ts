import { cache } from 'react';

import { formatDrawPool, formatShortDate, isGiveawayLocked } from '@/lib/member';
import type { EntryStatus, Giveaway, GiveawayDetail, GiveawayEntryRow, PastWinner, TierGroup } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';
import type { EntryCycle } from './entries';

// ─── DTOs (mirrored from the live GET /giveaways/winners response) ────────────

export interface GiveawayWinnerGiveaway {
    giveaway_id: string;
    name: string;
    tier: string;
    type: string;
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

/**
 * Map an API giveaway → the UI `Giveaway`. The API exposes no `state` or per-giveaway
 * entry/pool counts, so pool = the member's `state + tier`, and (per CLAUDE.md §1)
 * a member's entries = their active token count for the cycle (`memberTokens`).
 */
export function toGiveaway(g: ApiGiveaway, memberGroup: TierGroup, memberState: string, memberTokens = 0): Giveaway {
    const group = tierGroupFromApi(g.tier);
    const locked = isGiveawayLocked(group, memberGroup);

    return {
        id: g.giveaway_id || '-',
        title: g.name?.trim() || '-',
        tier_group: group,
        draw_pool: formatDrawPool(group, memberState || '-'),
        prize_label: g.prize?.trim() || '-',
        entered: g.is_entered ?? false,
        entry_status: g.entry_status ?? 'inactive',
        total_entries: g.is_entered ? memberTokens : 0,
        pool_entries: 0, // community pool count not exposed by the API
        locked,
        draws_at: g.draws_at ?? ''
    };
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
