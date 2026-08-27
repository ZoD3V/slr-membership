import { ApiError, apiErrorCode } from '@/lib/api/types';

export const SAFE_HOURS = {
    weekday: 'Fri',
    startHour: 16,
    endHour: 19,
    timeZone: 'Australia/Sydney'
} as const;

export const SAFE_HOURS_MESSAGE =
    'Sign-up and plan changes are paused while this week’s draw runs. Please try again after 7:00 pm (AU eastern time).';

export function isSafeHoursLocked(now: Date = new Date()): boolean {
    const parts = new Intl.DateTimeFormat('en-AU', {
        timeZone: SAFE_HOURS.timeZone,
        weekday: 'short',
        hour: 'numeric',
        hour12: false
    }).formatToParts(now);

    const weekday = parts.find((p) => p.type === 'weekday')?.value;
    const hour = Number(parts.find((p) => p.type === 'hour')?.value);

    if (weekday !== SAFE_HOURS.weekday || Number.isNaN(hour)) return false;

    return hour >= SAFE_HOURS.startHour && hour < SAFE_HOURS.endHour;
}

export function isSafeHoursError(error: unknown): boolean {
    return error instanceof ApiError && apiErrorCode(error) === 'SAFE_HOURS_LOCKED';
}
