export const AU_STATE_CODES = ['VIC', 'QLD', 'WA', 'TAS', 'NT'] as const;

export type AuStateCode = (typeof AU_STATE_CODES)[number];

export const AU_STATES: { code: AuStateCode; label: string }[] = [
    { code: 'VIC', label: 'Victoria' },
    { code: 'QLD', label: 'Queensland' },
    { code: 'WA', label: 'Western Australia' },
    { code: 'TAS', label: 'Tasmania' },
    { code: 'NT', label: 'Northern Territory' }
];
