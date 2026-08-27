'use server';

import { handleApiAuthError } from '@/lib/api/guard';
import { type AdminMemberListItem, getAdminMembers } from '@/lib/api/resources/admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { TierGroup } from '@/types/member';

export interface WinnerMemberOption {
    id: string;
    name: string;
    email: string;

    state: string;
    status: string;
}

export type MemberSearchResult = { ok: true; data: WinnerMemberOption[] } | { ok: false; message: string };

export interface WinnerMemberQuery {
    tier: TierGroup;

    state?: string;
    search?: string;
}

const MAX_PER_PAGE = 100;

async function fetchAllMembers(token: string, tier: TierGroup, search?: string): Promise<AdminMemberListItem[]> {
    const all: AdminMemberListItem[] = [];

    for (let page = 1; ; page++) {
        const batch = await getAdminMembers(token, { tier, search, page, perPage: MAX_PER_PAGE });
        all.push(...batch);
        if (batch.length < MAX_PER_PAGE) break;
    }

    return all;
}

export async function searchWinnerMembersAction(query: WinnerMemberQuery): Promise<MemberSearchResult> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const search = query.search?.trim();
        const rows = await fetchAllMembers(token, query.tier, search || undefined);
        const scoped = query.state ? rows.filter((m) => m.state === query.state) : rows;

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
        handleApiAuthError(error);

        return {
            ok: false,
            message: error instanceof ApiError ? error.message : 'Could not load members. Please try again.'
        };
    }
}
