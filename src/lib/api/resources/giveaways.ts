import { cache } from 'react';

import { formatDrawPool, formatShortDate, isGiveawayLocked } from '@/lib/member';
import type { EntryStatus, Giveaway, GiveawayDetail, GiveawayEntryRow, GiveawayPhase, TierGroup } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';
import type { EntryCycle } from './entries';

export interface GiveawayWinnerGiveaway {
    giveaway_id: string;
    name: string;
    tier: string;
    type: string;

    prize?: string;
    opens_at?: string | null;
    closes_at?: string | null;
    ends_at?: string | null;
    draws_at?: string | null;
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

export const getGiveawayWinners = cache((token: string) =>
    apiFetch<GiveawayWinner[]>(API.giveaways.winners, { token, cache: 'no-store' })
);

export interface ApiGiveaway {
    giveaway_id: string;
    name: string;
    tier: string;
    type: string;
    prize: string | null;
    opens_at: string | null;
    closes_at: string | null;
    draws_at: string | null;
    is_entered: boolean;
    entry_status: EntryStatus | null;
}

export interface ApiGiveawayWinnerRow {
    full_name?: string | null;
    state?: string | null;
    prize?: string | null;
    recorded_at?: string | null;
}

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

export const GIVEAWAY_RULES = [
    'Entries are allocated automatically each 28-day cycle — no manual entry needed.',
    'Your number of entries is set by your membership tier for the cycle.',
    'Entries close 6:30 PM AEST each Friday; the draw runs at 8:00 PM AEST.',
    'Winners are drawn by the TPAL digital draw system or SLR’s provably fair draw engine, audited with SHA-256 verification.',
    'Entries reset every cycle and do not carry over.'
];
const TPAL_NOTE =
    'Draws are run on the TPAL digital draw system, SLR’s own provably fair random draw engine, or another lawful random-draw system identified by SLR. Every draw announcement is audited to certified trade promotion standards using cryptographic SHA-256 verification.';

export function tierGroupFromApi(tier: string | undefined): TierGroup {
    const t = tier?.toUpperCase();
    if (t === 'RED') return 'red';
    if (t === 'BLUE') return 'blue';

    return 'visitor';
}

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

export function giveawayPhase(opensAt: string | null | undefined, drawsAt: string | null | undefined): GiveawayPhase {
    const now = Date.now();
    const draws = Date.parse(drawsAt ?? '');
    if (!Number.isNaN(draws) && now >= draws) return 'drawn';
    const opens = Date.parse(opensAt ?? '');
    if (!Number.isNaN(opens) && now < opens) return 'upcoming';

    return 'active';
}

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
        pool_entries: 0,
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

export function compareGiveaways(a: Giveaway, b: Giveaway): number {
    const byPhase = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase];
    if (byPhase !== 0) return byPhase;
    if (a.phase === 'drawn') return timeMs(b.draws_at) - timeMs(a.draws_at);
    if (a.phase === 'upcoming') return timeMs(a.opens_at) - timeMs(b.opens_at);

    return timeMs(a.draws_at) - timeMs(b.draws_at);
}

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
        entry_history: toEntryHistory(currentCycle, base.entered)
    };
}

export const getGiveaways = cache((token: string) =>
    apiFetch<ApiGiveaway[]>(API.giveaways.list, { token, cache: 'no-store' })
);

export const getGiveaway = cache((id: string, token: string) =>
    apiFetch<ApiGiveawayDetail>(API.giveaways.detail(id), { token, cache: 'no-store' })
);

export interface Paginated<T> {
    items: T[];
    pagination: { page: number; per_page: number; total: number; total_pages: number };
}

export type AdminGiveawayTier = 'VISITOR' | 'RED' | 'BLUE';
export type AdminGiveawayType = 'WEEKLY' | 'MONTHLY';

export type AdminGiveawayStatus = 'OPEN' | 'CLOSED' | 'COMPLETED' | 'DRAWN' | string;

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

export const getAdminGiveaways = (token: string, query: ListQuery = {}) =>
    apiFetch<AdminGiveaway[]>(`${API.admin.giveaways}${listQs(query)}`, { token, cache: 'no-store' });

const MAX_PER_PAGE = 100;

export async function getAllAdminGiveaways(token: string): Promise<AdminGiveaway[]> {
    const all: AdminGiveaway[] = [];

    for (let page = 1; ; page++) {
        const res = await getAdminGiveaways(token, { page, perPage: MAX_PER_PAGE });
        all.push(...res);
        if (res.length < MAX_PER_PAGE) break;
    }

    return all;
}

export async function getAllAdminWinners(token: string, giveawayId?: string): Promise<AdminWinner[]> {
    const all: AdminWinner[] = [];

    for (let page = 1; ; page++) {
        const res = await getAdminWinners(token, { page, perPage: MAX_PER_PAGE, giveawayId });
        all.push(...res);
        if (res.length < MAX_PER_PAGE) break;
    }

    return all;
}

export const getAdminGiveaway = (id: string, token: string) =>
    apiFetch<AdminGiveaway>(API.admin.giveawayDetail(id), { token, cache: 'no-store' });

export const createGiveaway = (token: string, payload: AdminGiveawayPayload) =>
    apiFetch<AdminGiveaway>(API.admin.giveaways, { method: 'POST', token, body: payload });

export const updateGiveaway = (token: string, id: string, payload: AdminGiveawayPayload) =>
    apiFetch<AdminGiveaway>(API.admin.giveawayDetail(id), { method: 'PUT', token, body: payload });

export const deleteGiveaway = (token: string, id: string) =>
    apiFetch<null>(API.admin.giveawayDetail(id), { method: 'DELETE', token });

export const getAdminWinners = (token: string, query: ListQuery = {}) =>
    apiFetch<AdminWinner[]>(`${API.admin.winners}${listQs(query)}`, { token, cache: 'no-store' });

export const createWinner = (token: string, payload: AdminWinnerPayload) =>
    apiFetch<AdminWinner>(API.admin.winners, { method: 'POST', token, body: payload });

export const updateWinner = (token: string, id: string, payload: AdminWinnerPayload) =>
    apiFetch<AdminWinner>(API.admin.winnerDetail(id), { method: 'PUT', token, body: payload });

export const deleteWinner = (token: string, id: string) =>
    apiFetch<null>(API.admin.winnerDetail(id), { method: 'DELETE', token });
