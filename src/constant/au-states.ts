export const AU_STATE_CODES = ['VIC'] as const;

export type AuStateCode = (typeof AU_STATE_CODES)[number];

export const AU_STATES: { code: AuStateCode; label: string }[] = [
    { code: 'VIC', label: 'Victoria' }
];
