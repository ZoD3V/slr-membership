export const MIN_AGE_YEARS = 18;

export function latestAdultDob(now: Date = new Date()): Date {
    return new Date(now.getFullYear() - MIN_AGE_YEARS, now.getMonth(), now.getDate());
}

export function isAdultDob(value: string): boolean {
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;

    return date <= latestAdultDob();
}
