import { cache } from 'react';

import type { AuStateCode } from '@/constant/au-states';

import { API } from '../endpoints';
import { apiFetch, apiFetchPaginated } from '../http';
import type { MemberConsentSummary } from './consents';

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
    dob?: string | null;
    state: string;

    status: string;
    tier: string;
    billing_status?: string;
    created_at: string;
    draw_pass?: number | null;
    consents?: MemberConsentSummary[];
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
    win_id: string;
    prize: string;
    recorded_at: string;
}

export interface AdminMemberDetail {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    state: string;

    dob: string | null;
    status: 'active' | 'suspended' | 'deactivated' | string;
    created_at: string;
    membership: AdminMemberDetailMembership;
    consents?: MemberConsentSummary[];
    subscription: AdminMemberDetailSubscription | null;
    cycles: AdminMemberDetailCycle[];
    wins: AdminMemberDetailWin[];
}

export type AdminMemberStatusValue = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface AdminMemberStatusUpdate {
    user_id: string;
    status: string;
}

export interface AdminMemberProfilePayload {
    full_name?: string;
    email?: string;
    phone?: string;
    state?: AuStateCode;
    dob?: string | null;

    pay_id_email?: string | null;
}

export interface AdminMemberProfileUpdate {
    user_id: string;
    full_name: string;
    email: string;
    phone: string | null;
    state: string | null;
    dob: string | null;
    pay_id_email: string | null;
    status: string;
    created_at: string;
}

export interface BenyPendingItem {
    beny_subscription_id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
}

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

export interface BenyActivateResult {
    beny_subscription_id: string;
    status: string;
    activated_at: string;
}

export const getAdminDashboardMetrics = cache((token: string) => {
    return apiFetch<AdminDashboardMetrics>(API.admin.dashboard, { token, cache: 'no-store' });
});

export interface AdminMemberListMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface AdminMemberQuery {
    tier?: 'visitor' | 'red' | 'blue';
    page?: number;
    perPage?: number;
    search?: string;
}

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

export function getAdminMembersPaginated(token: string, query: AdminMemberQuery = {}) {
    const params = new URLSearchParams();
    if (query.tier) params.set('tier', query.tier);
    if (query.page) params.set('page', String(query.page));
    if (query.perPage) params.set('per_page', String(query.perPage));
    if (query.search) params.set('search', query.search);

    const qs = params.toString();

    return apiFetchPaginated<AdminMemberListItem[], AdminMemberListMeta>(`${API.admin.members}${qs ? `?${qs}` : ''}`, {
        token,
        cache: 'no-store'
    });
}

const MAX_PER_PAGE = 100;

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

export const updateAdminMemberProfile = (userId: string, payload: AdminMemberProfilePayload, token: string) => {
    return apiFetch<AdminMemberProfileUpdate>(API.admin.updateMemberProfile(userId), {
        method: 'PUT',
        body: payload,
        token
    });
};

export const getBenyPending = cache((token: string) => {
    return apiFetch<BenyPendingItem[]>(API.admin.benyPending, { token, cache: 'no-store' });
});

export const getBenySubscriptions = cache((status: string, token: string, page = 1, perPage = 10) => {
    return apiFetch<any>(`${API.admin.benyList}?status=${status}&page=${page}&per_page=${Math.min(perPage, 100)}`, {
        token,
        cache: 'no-store'
    });
});

export async function getAllBenySubscriptions(token: string): Promise<BenySubscriptionItem[]> {
    const perPage = 100;
    const first = await apiFetchPaginated<BenySubscriptionItem[], { total_pages?: number }>(
        `${API.admin.benyList}?page=1&per_page=${perPage}`,
        { token, cache: 'no-store' }
    );

    const items = [...first.data];
    const totalPages = first.meta.total_pages ?? 1;

    for (let page = 2; page <= totalPages; page++) {
        const next = await apiFetchPaginated<BenySubscriptionItem[]>(
            `${API.admin.benyList}?page=${page}&per_page=${perPage}`,
            { token, cache: 'no-store' }
        );
        items.push(...next.data);
    }

    return items;
}

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

export type DrawCsvTier = 'visitor' | 'red' | 'blue';

export interface DrawCsvFile {
    tier: DrawCsvTier;
    filename: string;
    row_count: number;

    download_url: string;
}

export interface DrawCsvGenerateResult {
    files: DrawCsvFile[];
}

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
