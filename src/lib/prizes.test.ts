import { activeStage, nextStageNumber, nextThreshold, stageLabel, stageProgress } from '@/lib/prizes';

import { describe, expect, it } from 'vitest';

// Cases come straight from PRD v3.2 §"Stage Prize Pool System" — the 142-member
// row is PRD's own worked example, and the 99-member row is its pre-launch edge
// case ("if paid_members < 100 … show Stage 1 as the target").
describe('activeStage', () => {
    it.each([
        [0, 1, 100],
        [99, 1, 100],
        [100, 1, 100],
        [142, 1, 100],
        [199, 1, 100],
        [200, 2, 200],
        [999, 5, 500],
        [1000, 6, 1000],
        [2500, 7, 2000]
    ])('%i paid members → Stage %i (threshold %i)', (members, stage, threshold) => {
        expect(activeStage(members)).toEqual({ stage, threshold });
    });
});

describe('nextThreshold', () => {
    it.each([
        [99, 100],
        [142, 200],
        [200, 300],
        [1999, 2000]
    ])('%i counts toward %i', (members, target) => {
        expect(nextThreshold(members)).toBe(target);
    });

    it('returns null once the top stage is reached', () => {
        expect(nextThreshold(2000)).toBeNull();
        expect(nextThreshold(2500)).toBeNull();
    });
});

describe('nextStageNumber', () => {
    it.each([
        [99, 1],
        [142, 2],
        [200, 3]
    ])('%i is counting toward Stage %i', (members, stage) => {
        expect(nextStageNumber(members)).toBe(stage);
    });

    it('returns null at the top stage', () => {
        expect(nextStageNumber(2500)).toBeNull();
    });
});

describe('stageLabel', () => {
    it('uses the stage threshold, never the live member count', () => {
        expect(stageLabel(activeStage(142))).toBe('For 100 Members • Stage 1');
    });

    it('groups thousands', () => {
        expect(stageLabel(activeStage(2500))).toBe('For 2,000 Members • Stage 7');
    });
});

describe('stageProgress', () => {
    // PRD: "Progress bar = paid_members / next_threshold". The superseded
    // implementation used (current - base) / (target - base), which gave 42%
    // for the 142-member example instead of 71%.
    it.each([
        [99, 99, 1],
        [142, 71, 58],
        [200, 67, 100],
        // 199/200 and 1999/2000 round to 100% — the bar must not read "full"
        // while the caption still says members are needed.
        [199, 99, 1],
        [1999, 99, 1]
    ])('%i members → %i%% with %i remaining', (members, pct, remaining) => {
        expect(stageProgress(members)).toEqual({ pct, remaining });
    });

    it('is complete at the top stage', () => {
        expect(stageProgress(2500)).toEqual({ pct: 100, remaining: 0 });
    });
});
