import type {
    NotificationLogMeta,
    NotificationLogRow,
    NotificationSendPayload,
    NotificationSendResult,
    NotificationTemplate,
    NotificationTemplateUpdatePayload
} from '@/types/member';

import { API } from '../endpoints';
import { apiFetch, apiFetchPaginated } from '../http';

/**
 * Admin-only notification functions (OpenAPI 2026-08-11). Kept separate from
 * notifications.ts, which is the member-facing bell panel — different
 * audience, different auth, no shared code. Mirrors spin-admin.ts / spin.ts.
 */

export interface NotificationLogFilters {
    userId?: string;
    type?: string;
    status?: string;
    page?: number;
    perPage?: number;
}

function logsQuery(filters?: NotificationLogFilters): string {
    const params = new URLSearchParams();
    if (filters?.userId) params.set('user_id', filters.userId);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.perPage) params.set('per_page', String(filters.perPage));

    const query = params.toString();

    return query ? `?${query}` : '';
}

export function getNotificationTemplates(token: string) {
    return apiFetch<NotificationTemplate[]>(API.admin.notificationTemplates, { token, cache: 'no-store' });
}

export function updateNotificationTemplate(
    token: string,
    templateId: string,
    payload: NotificationTemplateUpdatePayload
) {
    return apiFetch<NotificationTemplate>(API.admin.notificationTemplateDetail(templateId), {
        method: 'PUT',
        token,
        body: payload
    });
}

/** Server-paginated — the API returns `meta.total_pages`, not the full set. */
export function getNotificationLogs(token: string, filters?: NotificationLogFilters) {
    return apiFetchPaginated<NotificationLogRow[], NotificationLogMeta>(
        `${API.admin.notificationLogs}${logsQuery(filters)}`,
        { token, cache: 'no-store' }
    );
}

export function sendNotifications(token: string, payload: NotificationSendPayload) {
    return apiFetch<NotificationSendResult>(API.admin.notificationsSend, {
        method: 'POST',
        token,
        body: payload
    });
}
