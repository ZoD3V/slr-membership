import {
    formatPoolAmount,
    membersCapLabel,
    minPriceCents,
    parseAmount,
    splitLines,
    splitSegments,
    toStat,
    weeklyPriceLabel
} from './prize-content';
import { describe, expect, it } from 'vitest';

describe('parseAmount', () => {
    it('reads the live CMS headline', () => {
        expect(parseAmount(' $3,700')).toBe(3700);
    });

    it('keeps decimals', () => {
        expect(parseAmount('$1900.00')).toBe(1900);
        expect(parseAmount('$1,234.56')).toBe(1234.56);
    });

    it('returns null when there is no number', () => {
        expect(parseAmount('TBA')).toBeNull();
        expect(parseAmount('')).toBeNull();
        expect(parseAmount(null)).toBeNull();
    });
});

describe('formatPoolAmount', () => {
    it('always shows two decimals', () => {
        expect(formatPoolAmount(0)).toBe('$0.00');
        expect(formatPoolAmount(3700)).toBe('$3,700.00');
    });
});

describe('splitSegments', () => {
    it('splits on the bullet and strips leading markers', () => {
        expect(splitSegments('@ 22 Prizes • One Month')).toEqual(['22 Prizes', 'One Month']);
        expect(splitSegments('For 100 Members • Stage 1')).toEqual(['100 Members', 'Stage 1']);
    });

    it('handles a single segment', () => {
        expect(splitSegments('9 in 10 win')).toEqual(['9 in 10 win']);
    });

    it('drops empties', () => {
        expect(splitSegments('  •  ')).toEqual([]);
        expect(splitSegments(undefined)).toEqual([]);
    });
});

describe('splitLines', () => {
    it('trims each prize line', () => {
        expect(splitLines('1x $100 Gift Card \n1x $25 Gift\n1x asdaa')).toEqual([
            '1x $100 Gift Card',
            '1x $25 Gift',
            '1x asdaa'
        ]);
    });

    it('returns an empty list for blank content', () => {
        expect(splitLines('\n \n')).toEqual([]);
    });
});

describe('membersCapLabel', () => {
    it('pulls the member cap out of the stage label', () => {
        expect(membersCapLabel('For 100 Members • Stage 1')).toBe('100 Members Capped');
        expect(membersCapLabel('for 2,000 members')).toBe('2,000 Members Capped');
    });

    it('returns null when the stage label has no member count', () => {
        expect(membersCapLabel('Stage 1')).toBeNull();
    });
});

describe('weeklyPriceLabel', () => {
    it('divides the monthly price across the 4-week cycle', () => {
        expect(weeklyPriceLabel(1000)).toBe('$2.50/week');
        expect(weeklyPriceLabel(2600)).toBe('$6.50/week');
        expect(weeklyPriceLabel(600)).toBe('$1.50/week');
        expect(weeklyPriceLabel(1200)).toBe('$3/week');
    });
});

describe('minPriceCents', () => {
    it('picks the cheapest sub-tier', () => {
        expect(minPriceCents([{ price_cents: 3000 }, { price_cents: 1000 }, { price_cents: 2000 }])).toBe(1000);
    });

    it('returns null for an empty tier list', () => {
        expect(minPriceCents([])).toBeNull();
    });
});

describe('toStat', () => {
    const fallback = { value: 'Up To 34 Prizes', label: 'Every Month' };

    it('uses the CMS value and label', () => {
        expect(toStat('@ 22 Prizes • One Month', fallback)).toEqual({ value: '22 Prizes', label: 'One Month' });
    });

    it('keeps the fallback label when the CMS has one segment', () => {
        expect(toStat('9 in 10 win', fallback)).toEqual({ value: '9 in 10 win', label: 'Every Month' });
    });

    it('falls back entirely when the CMS is empty', () => {
        expect(toStat('', fallback)).toEqual(fallback);
    });
});
