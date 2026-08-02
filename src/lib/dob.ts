export const MIN_AGE_YEARS = 18;

/** Latest date of birth that still satisfies the 18+ rule today. */
export function latestAdultDob(now: Date = new Date()): Date {
    return new Date(now.getFullYear() - MIN_AGE_YEARS, now.getMonth(), now.getDate());
}

/** True when the given date-only string represents an 18+ date of birth. */
export function isAdultDob(value: string): boolean {
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;

    return date <= latestAdultDob();
}
