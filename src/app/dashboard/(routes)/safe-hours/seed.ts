import type { SafeHoursConfig } from '@/types/member';

/**
 * Defensive fallback the editor renders against when `GET /api/v1/admin/safe-hours`
 * cannot be read.
 *
 * The endpoint exists but answered 500 INTERNAL_ERROR when verified against
 * production on 2026-08-10, so this fallback is load-bearing right now — see
 * the Safe Hours entry in docs/BACKEND-ISSUES.md. Values are the real API
 * doc's own example: the default Friday 16:00-19:00 Sydney window, no override
 * active, currently unlocked.
 *
 * Scoped to this route.
 */
export const SAFE_HOURS_SEED: SafeHoursConfig = {
    day_of_week: 'Friday',
    start_time: '16:00',
    end_time: '19:00',
    is_active: true,
    manual_override: 'NONE',
    is_currently_locked: false,
    updated_at: '2026-08-09T14:30:00.000Z'
};
