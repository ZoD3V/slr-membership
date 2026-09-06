import { isAuPhone, toAuE164 } from '@/lib/au-phone';

import { describe, expect, it } from 'vitest';

describe('isAuPhone', () => {
    it('accepts local mobiles and landlines, spaced or not', () => {
        for (const v of ['0412345678', '0412 345 678', '(02) 9876 5432', '0398765432']) expect(isAuPhone(v)).toBe(true);
    });
    it('accepts +61 international form', () => {
        expect(isAuPhone('+61412345678')).toBe(true);
        expect(isAuPhone('+61 412 345 678')).toBe(true);
    });
    it('accepts 1300/1800 service numbers', () => {
        expect(isAuPhone('1300123456')).toBe(true);
    });
    it('rejects the shapes that would break BENY activation', () => {
        for (const v of ['', '12345', '0512345678', '628212988882', '+1 415 555 0123', '04123456789'])
            expect(isAuPhone(v)).toBe(false);
    });
});

describe('toAuE164', () => {
    it('converts local to +61', () => {
        expect(toAuE164('0412 345 678')).toBe('+61412345678');
    });
    it('leaves an already-international number alone', () => {
        expect(toAuE164('+61412345678')).toBe('+61412345678');
    });
});
