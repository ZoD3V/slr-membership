import type { SafeHoursConfig } from '@/types/member';

export const SAFE_HOURS_SEED: SafeHoursConfig = {
    day_of_week: 'Friday',
    start_time: '16:00',
    end_time: '19:00',
    is_active: true,
    manual_override: 'NONE',
    is_currently_locked: false,
    updated_at: '2026-08-09T14:30:00.000Z'
};
