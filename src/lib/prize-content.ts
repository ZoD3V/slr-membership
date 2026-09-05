// The prizes CMS stores free text (headline, bullet-separated stats, newline-separated
// prize lists), so every reader has to parse it the same way. Keep that here.

const CYCLE_WEEKS = 4; // 28-day billing cycle

const poolFormatter = new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

/** " $3,700" -> 3700. Returns null when the CMS holds something unparseable. */
export function parseAmount(value: string | null | undefined): number | null {
    const digits = value?.replace(/[^0-9.]/g, '') ?? '';
    if (!digits) return null;
    const amount = Number.parseFloat(digits);

    return Number.isFinite(amount) ? amount : null;
}

export function formatPoolAmount(amount: number): string {
    return `$${poolFormatter.format(amount)}`;
}

/** "@ 22 Prizes • One Month" -> ["22 Prizes", "One Month"]. Leading "@" and "For" are labels, not content. */
export function splitSegments(value: string | null | undefined): string[] {
    return (value ?? '')
        .split('•')
        .map((part) => part.replace(/^(?:[@\s]+|for\s+)+/i, '').trim())
        .filter(Boolean);
}

/** "1x $100 Gift Card \n1x $25 Gift" -> ["1x $100 Gift Card", "1x $25 Gift"] */
export function splitLines(value: string | null | undefined): string[] {
    return (value ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

/** "For 100 Members • Stage 1" -> "100" */
export function membersCount(stageLabel: string | null | undefined): string | null {
    const match = /([\d,]+)\s*members/i.exec(stageLabel ?? '');

    return match ? match[1] : null;
}

/**
 * Milestone bonus prizes. The prizes CMS has no field for these yet, so the marketing page
 * and the legal documents read them from here instead of each carrying their own copy.
 */
export const GRAND_BONUS = {
    membersCount: '1,000',
    red: '$5,000 Bonus',
    blue: '$10,000 Bonus'
} as const;

/** The advertised pool exactly as the CMS holds it, falling back when the field is junk or empty. */
export function poolLabel(headline: string | null | undefined, fallback: string): string {
    const raw = headline?.trim();

    return raw && parseAmount(raw) !== null ? raw : fallback;
}

/** "For 100 Members • Stage 1" -> "100 Members Capped" */
export function membersCapLabel(stageLabel: string | null | undefined): string | null {
    const count = membersCount(stageLabel);

    return count ? `${count} Members Capped` : null;
}

/** Cheapest sub-tier price in cents -> "$2.50/week" over the 28-day cycle. */
export function weeklyPriceLabel(priceCents: number): string {
    const perWeek = priceCents / 100 / CYCLE_WEEKS;
    const rounded = Math.round(perWeek * 100) / 100;

    return `$${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}/week`;
}

export function minPriceCents(options: { price_cents: number }[]): number | null {
    const prices = options.map((option) => option.price_cents).filter((cents) => Number.isFinite(cents));

    return prices.length > 0 ? Math.min(...prices) : null;
}

export interface PrizeStat {
    value: string;
    label: string;
}

/** Builds a stat block from a CMS string, falling back when the CMS value is empty. */
export function toStat(value: string | null | undefined, fallback: PrizeStat): PrizeStat {
    const [head, tail] = splitSegments(value);
    if (!head) return fallback;

    return { value: head, label: tail || fallback.label };
}
