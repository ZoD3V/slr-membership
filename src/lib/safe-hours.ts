import { ApiError, apiErrorCode } from '@/lib/api/types';

/**
 * PRD: sign-up, upgrade and downgrade are disabled every Friday 16:00–19:00.
 * Admin pulls the TPAL CSV at 16:00, the draw runs at randomdraws.com between
 * 16:00–18:00, and the extra hour is spare time to be sure the data is clear.
 *
 * The window is AU eastern time. `Australia/Sydney` is used rather than a fixed
 * +10 so the wall-clock hour stays 16:00–19:00 across daylight saving.
 */
export const SAFE_HOURS = {
    weekday: 'Fri',
    startHour: 16,
    endHour: 19,
    timeZone: 'Australia/Sydney'
} as const;

export const SAFE_HOURS_MESSAGE =
    'Sign-up and plan changes are paused while this week’s draw runs. Please try again after 7:00 pm (AU eastern time).';

/**
 * Advisory check so the UI can disable the button before the request. The API is
 * the authority — it answers `403 SAFE_HOURS_LOCKED` inside the window.
 */
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

/** True when the API refused the action because the lockout window is open. */
export function isSafeHoursError(error: unknown): boolean {
    return error instanceof ApiError && apiErrorCode(error) === 'SAFE_HOURS_LOCKED';
}
