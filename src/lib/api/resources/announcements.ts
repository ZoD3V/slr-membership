import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export const RUNNING_TEXT_TYPE = 'RUNNING_TEXT';

export const DRAW_RULES_TYPE = 'DRAW_RULES';

export const ANNOUNCEMENT_TYPES = ['RUNNING_TEXT', 'TV', 'BANNER', 'POPUP', 'DRAW_RULES'] as const;

export interface AnnouncementItem {
    id: string;
    type: string;
    title: string | null;
    content: string;
    link_url: string | null;
    is_active: boolean;
    sort_order: number;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface AnnouncementPayload {
    type: string;
    title?: string | null;
    content: string;
    link_url?: string | null;
    is_active: boolean;
    sort_order: number;
}

interface ListQuery {
    search?: string;
    type?: string;
    isActive?: boolean;
    page?: number;
    perPage?: number;
}

function listQs(query: ListQuery = {}): string {
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.type) params.set('type', query.type);
    if (query.isActive !== undefined) params.set('is_active', String(query.isActive));
    if (query.page) params.set('page', String(query.page));
    if (query.perPage) params.set('per_page', String(query.perPage));
    const qs = params.toString();

    return qs ? `?${qs}` : '';
}

// Public announcement copy — cached server-side, so an admin edit surfaces within a minute.
export const getPublicAnnouncements = cache((type: string) =>
    apiFetch<AnnouncementItem[]>(API.announcements.public(type), { revalidate: 60 })
);

export const getRunningText = () => getPublicAnnouncements(RUNNING_TEXT_TYPE);

/** The single active DRAW_RULES document, or null when the CMS has none yet. */
export async function getDrawRules(): Promise<AnnouncementItem | null> {
    try {
        const active = (await getPublicAnnouncements(DRAW_RULES_TYPE))
            .filter((item) => item.is_active && item.content?.trim())
            .sort(compareAnnouncements);

        return active[0] ?? null;
    } catch {
        return null;
    }
}

export const getAdminAnnouncements = (token: string, query: ListQuery = {}) =>
    apiFetch<AnnouncementItem[]>(`${API.announcements.adminList}${listQs(query)}`, { token, cache: 'no-store' });

const MAX_PER_PAGE = 100;

export async function getAllAdminAnnouncements(token: string): Promise<AnnouncementItem[]> {
    const all: AnnouncementItem[] = [];

    for (let page = 1; ; page++) {
        const res = await getAdminAnnouncements(token, { page, perPage: MAX_PER_PAGE });
        all.push(...res);
        if (res.length < MAX_PER_PAGE) break;
    }

    return all;
}

export const getAdminAnnouncement = cache((id: string, token: string) =>
    apiFetch<AnnouncementItem>(API.announcements.adminDetail(id), { token, cache: 'no-store' })
);

export const createAnnouncement = (token: string, body: AnnouncementPayload) =>
    apiFetch<AnnouncementItem>(API.announcements.adminList, { method: 'POST', token, body });

export const updateAnnouncement = (token: string, id: string, body: AnnouncementPayload) =>
    apiFetch<AnnouncementItem>(API.announcements.adminDetail(id), { method: 'PUT', token, body });

export const deleteAnnouncement = (token: string, id: string) =>
    apiFetch<null>(API.announcements.adminDetail(id), { method: 'DELETE', token });

export function compareAnnouncements(a: AnnouncementItem, b: AnnouncementItem): number {
    const byOrder = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (byOrder !== 0) return byOrder;

    return Date.parse(a.created_at ?? '') - Date.parse(b.created_at ?? '');
}
