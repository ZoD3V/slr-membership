import type { SafeHoursConfig } from '@/types/member';

/**
 * Placeholder document the editor falls back to while `GET /api/v1/admin/safe-hours`
 * is still unimplemented (verified 404 on 2026-08-08).
 *
 * Matches the current hardcoded default in src/lib/safe-hours.ts — the same
 * figures the backend is asked to seed with in docs/BACKEND-ISSUES.md, so what
 * an admin sees here matches what the first real GET will return.
 *
 * Scoped to this route. Delete once the endpoint answers.
 */
export const SAFE_HOURS_SEED: SafeHoursConfig = {
    weekday: 'Fri',
    start_hour: 16,
    end_hour: 19
};
