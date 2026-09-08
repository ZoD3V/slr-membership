import { BENY_ELIGIBLE_SUB_TIERS, isBenyEligibleSubTier, isStandardSubTier } from '@/constant/tiers';

import { describe, expect, it } from 'vitest';

describe('BENY eligibility and tier classification', () => {
    describe('isBenyEligibleSubTier', () => {
        it('rejects standard tiers in both uppercase and lowercase', () => {
            expect(isBenyEligibleSubTier('R1')).toBe(false);
            expect(isBenyEligibleSubTier('r1')).toBe(false);
            expect(isBenyEligibleSubTier('B1')).toBe(false);
            expect(isBenyEligibleSubTier('b1')).toBe(false);
        });

        it('rejects non-paid visitor tiers and empty inputs', () => {
            expect(isBenyEligibleSubTier('VISITOR')).toBe(false);
            expect(isBenyEligibleSubTier('visitor')).toBe(false);
            expect(isBenyEligibleSubTier('')).toBe(false);
            expect(isBenyEligibleSubTier(null)).toBe(false);
            expect(isBenyEligibleSubTier(undefined)).toBe(false);
        });

        it('accepts all Plus, Premium, and Elite tiers', () => {
            const expectedTiers = ['R4', 'R7', 'B4', 'B7', 'B10'];
            for (const code of expectedTiers) {
                expect(isBenyEligibleSubTier(code)).toBe(true);
                expect(isBenyEligibleSubTier(code.toLowerCase())).toBe(true);
            }
        });

        it('matches BENY_ELIGIBLE_SUB_TIERS set', () => {
            expect(BENY_ELIGIBLE_SUB_TIERS.has('R1')).toBe(false);
            expect(BENY_ELIGIBLE_SUB_TIERS.has('B1')).toBe(false);
            expect(BENY_ELIGIBLE_SUB_TIERS.has('R4')).toBe(true);
            expect(BENY_ELIGIBLE_SUB_TIERS.has('R7')).toBe(true);
            expect(BENY_ELIGIBLE_SUB_TIERS.has('B4')).toBe(true);
            expect(BENY_ELIGIBLE_SUB_TIERS.has('B7')).toBe(true);
            expect(BENY_ELIGIBLE_SUB_TIERS.has('B10')).toBe(true);
        });
    });

    describe('isStandardSubTier', () => {
        it('identifies R1 and B1 as standard tiers', () => {
            expect(isStandardSubTier('R1')).toBe(true);
            expect(isStandardSubTier('r1')).toBe(true);
            expect(isStandardSubTier('B1')).toBe(true);
            expect(isStandardSubTier('b1')).toBe(true);
        });

        it('returns false for non-standard tiers', () => {
            for (const code of ['R4', 'R7', 'B4', 'B7', 'B10', 'VISITOR', '']) {
                expect(isStandardSubTier(code)).toBe(false);
            }
            expect(isStandardSubTier(null)).toBe(false);
            expect(isStandardSubTier(undefined)).toBe(false);
        });
    });
});
