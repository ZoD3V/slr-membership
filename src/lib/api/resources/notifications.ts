import { cache } from 'react';

import type { MemberNotification } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export interface NotificationDto {
    notification_id: string;
    title: string;
    message: string;
    type: 'system' | 'billing' | 'marketing' | 'support' | string;
    is_read: boolean;
    created_at: string;
    metadata?: Record<string, any>;
}

/** In-app notifications for the current member (bell panel). */
export const getNotifications = cache((token: string) => {
    return apiFetch<NotificationDto[]>(API.notifications.list, { token, cache: 'no-store' });
});

/** Mark a single notification as read. */
export async function markNotificationRead(id: string, token: string) {
    return apiFetch<null>(API.notifications.read(id), {
        method: 'PUT',
        token
    });
}

export function notificationDtoToMemberNotification(dto: NotificationDto): MemberNotification {
    return {
        id: dto.notification_id,
        type: dto.type as any,
        title: dto.title || '-',
        body: dto.message || '-',
        created_at: dto.created_at || new Date().toISOString(),
        read_at: dto.is_read ? new Date().toISOString() : null
    };
}
