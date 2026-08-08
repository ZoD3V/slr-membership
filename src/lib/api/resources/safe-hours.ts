import type { SafeHoursConfig } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The Friday lockout window (PRD §5.8). Admin-gated in both directions — unlike
 * Prizes there is no public/member-facing read of this document, so neither
 * function is wrapped in cache().
 */
export function getAdminSafeHours(token: string) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, { token });
}

/** Full-document replace. */
export function updateAdminSafeHours(token: string, payload: SafeHoursConfig) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, {
        method: 'PUT',
        token,
        body: payload
    });
}
