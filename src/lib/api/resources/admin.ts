import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

// ── DTOs ──────────────────────────────────────────────────────────────────────

// Mirrors the live GET /admin/dashboard response.
export interface TierCount {
    tier: string;
    count: number;
}

export interface StateCount {
    state: string;
    count: number;
}

export interface DashboardAlerts {
    failed_payments_30d: number;
    pending_beny_activations: number;
    active_beny_subscriptions?: number;
    pending_beny_deactivations?: number;
    cancelled_beny_subscriptions?: number;
}

export interface AdminDashboardMetrics {
    total_members: number;
    active_subscriptions: number;
    mrr_cents: number;
    members_by_tier: TierCount[];
    members_by_state: StateCount[];
    alerts: DashboardAlerts;
}

export interface AdminMemberListItem {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    state: string;
    status: 'active' | 'suspended' | 'deactivated';
    tier: string; // e.g., 'RED R4'
    created_at: string;
}

export interface AdminMemberDetailMembership {
    tier: string;
    tier_code: string;
    billing_status: string;
    renew_at: string | null;
}

export interface AdminMemberDetailSubscription {
    stripe_subscription_id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
}

export interface AdminMemberDetailCycle {
    cycle_id: string;
    start_at: string;
    end_at: string;
    tier: string;
    base_token: number;
    referral_bonus: number;
    total_token: number;
    draw_pass: number;
    status: string;
}

export interface AdminMemberDetailWin {
    // TODO: Define win structure once backend provides examples
    win_id: string;
    giveaway_name: string;
    won_at: string;
}

export interface AdminMemberDetail {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    state: string;
    status: 'active' | 'suspended' | 'deactivated' | string;
    created_at: string;
    membership: AdminMemberDetailMembership;
    subscription: AdminMemberDetailSubscription | null;
    cycles: AdminMemberDetailCycle[];
    wins: AdminMemberDetailWin[];
}

// Live PUT /admin/members/{userId}/status accepts uppercase enum values.
export type AdminMemberStatusValue = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

// Mirrors the live PUT /admin/members/{userId}/status response `data`.
export interface AdminMemberStatusUpdate {
    user_id: string;
    status: string; // lowercase, e.g. 'active'
}

// Mirrors GET /admin/beny/pending items.
export interface BenyPendingItem {
    beny_subscription_id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
}

// Extends for the new 4-state cycle: pending_activation | active | pending_deactivation | cancelled
export interface BenySubscriptionItem {
    beny_subscription_id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    status: 'pending_activation' | 'active' | 'pending_deactivation' | 'cancelled' | 'canceled' | string;
    created_at: string;
    activated_at?: string | null;
    access_ends_at?: string | null;
    deactivated_at?: string | null;
    deactivation_reason?: string | null;
}

export interface BenyListResult {
    data: BenySubscriptionItem[];
    total: number;
}

// Mirrors POST /admin/beny/{id}/activate response.
export interface BenyActivateResult {
    beny_subscription_id: string;
    status: string;
    activated_at: string;
}

// ── Resource functions ──────────────────────────────────────────────────────

export const getAdminDashboardMetrics = cache((token: string) => {
    return apiFetch<AdminDashboardMetrics>(API.admin.dashboard, { token, cache: 'no-store' });
});

export interface AdminMemberQuery {
    /** Parent tier group. The list row carries only a marketing name ('Plus'),
     *  so filtering per group is how the caller recovers which group a row is in. */
    tier?: 'visitor' | 'red' | 'blue';
    page?: number;
    perPage?: number;
    search?: string;
}

// Verified live 2026-08-02: `tier`, `search`, `page` and `per_page` all work
// (an older comment here claimed every parameter 400'd — no longer true).
export const getAdminMembers = cache((token: string, query: AdminMemberQuery = {}) => {
    const params = new URLSearchParams();
    if (query.tier) params.set('tier', query.tier);
    if (query.page) params.set('page', String(query.page));
    if (query.perPage) params.set('per_page', String(query.perPage));
    if (query.search) params.set('search', query.search);

    const qs = params.toString();

    return apiFetch<AdminMemberListItem[]>(`${API.admin.members}${qs ? `?${qs}` : ''}`, {
        token,
        cache: 'no-store'
    });
});

/** Server-enforced ceiling: per_page above this returns 400 VALIDATION_ERROR. */
const MAX_PER_PAGE = 100;

/**
 * Every member in one tier group, following pagination.
 * `apiFetch` unwraps `data` and drops `meta`, so the loop stops on the first
 * short page rather than reading `total_pages`.
 */
export async function getAdminMembersByTier(
    token: string,
    tier: NonNullable<AdminMemberQuery['tier']>
): Promise<AdminMemberListItem[]> {
    const all: AdminMemberListItem[] = [];

    for (let page = 1; ; page++) {
        const batch = await getAdminMembers(token, { tier, page, perPage: MAX_PER_PAGE });
        all.push(...batch);
        if (batch.length < MAX_PER_PAGE) break;
    }

    return all;
}

export const getAdminMemberDetail = cache((userId: string, token: string) => {
    return apiFetch<AdminMemberDetail>(API.admin.memberDetail(userId), { token, cache: 'no-store' });
});

export const deleteAdminMember = (userId: string, token: string) => {
    return apiFetch<null>(API.admin.deleteMember(userId), { method: 'DELETE', token });
};

export const updateAdminMemberStatus = (userId: string, status: AdminMemberStatusValue, token: string) => {
    return apiFetch<AdminMemberStatusUpdate>(API.admin.updateMemberStatus(userId), {
        method: 'PUT',
        body: { status },
        token
    });
};

export const getBenyPending = cache((token: string) => {
    return apiFetch<BenyPendingItem[]>(API.admin.benyPending, { token, cache: 'no-store' });
});

export const getBenySubscriptions = cache((status: string, token: string, page = 1, limit = 10) => {
    // Falls back/adapts format if backend returns a list of items or paginated format
    return apiFetch<any>(`${API.admin.benyList}?status=${status}&page=${page}&limit=${limit}`, {
        token,
        cache: 'no-store'
    });
});

export const activateBeny = (id: string, token: string) => {
    return apiFetch<BenyActivateResult>(API.admin.benyActivate(id), { method: 'POST', token });
};

export const deactivateBeny = (id: string, token: string, reason?: string) => {
    return apiFetch<{ success?: boolean; status?: string }>(API.admin.benyDeactivate(id), {
        method: 'POST',
        token,
        body: reason ? { reason } : undefined
    });
};

// ── TPAL draw exports ─────────────────────────────────────────────────────────
// DTOs mirrored from the live responses (the OpenAPI schemas are empty).
// The draw itself runs externally at randomdraws.com/au: admin generates the 3
// CSVs here, uploads them there, then records the winners back.

export type DrawCsvTier = 'visitor' | 'red' | 'blue';

// POST /admin/csv/generate → `data.files`
export interface DrawCsvFile {
    tier: DrawCsvTier;
    filename: string;
    row_count: number;
    /** Presigned, attachment-disposition URL. Short-lived (X-Amz-Expires=3600). */
    download_url: string;
}

export interface DrawCsvGenerateResult {
    files: DrawCsvFile[];
}

// GET /admin/csv/history → `data` (flat array, one row per tier per run, newest first)
export interface DrawCsvHistoryItem extends DrawCsvFile {
    id: string;
    generated_at: string;
}

export const getDrawCsvHistory = cache((token: string) => {
    return apiFetch<DrawCsvHistoryItem[]>(API.admin.csvHistory, { token, cache: 'no-store' });
});

export const generateDrawCsv = (token: string) => {
    return apiFetch<DrawCsvGenerateResult>(API.admin.csvGenerate, { method: 'POST', token });
};
