import type { SafeHoursConfig, SafeHoursUpdatePayload } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The Friday lockout window (PRD §5.8, real API 2026-08-09). Admin-gated in
 * both directions — unlike Prizes there is no public/member-facing read of
 * this document, so neither function is wrapped in cache().
 */
export function getAdminSafeHours(token: string) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, { token });
}

/** Full-document replace, minus the two read-only fields the server computes. */
export function updateAdminSafeHours(token: string, payload: SafeHoursUpdatePayload) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, {
        method: 'PUT',
        token,
        body: payload
    });
}
