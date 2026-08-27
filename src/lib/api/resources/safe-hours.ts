import type { SafeHoursConfig, SafeHoursUpdatePayload } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

export function getAdminSafeHours(token: string) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, { token });
}

export function updateAdminSafeHours(token: string, payload: SafeHoursUpdatePayload) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, {
        method: 'PUT',
        token,
        body: payload
    });
}
