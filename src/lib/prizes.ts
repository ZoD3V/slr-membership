/**
 * Stage prize pool derivation (PRD v3.2 §"Stage Prize Pool System").
 *
 * Only `current_members` is stored — every other stage figure is computed here.
 * PRD is explicit: "current_stage is derived from paid_members — do NOT
 * hardcode." Deriving also removes the failure mode where an admin types a
 * stage that contradicts the member count.
 *
 * This module imports nothing on purpose: it is pure arithmetic over PRD rules
 * and is covered by prizes.test.ts.
 */

/**
 * Stage thresholds in paid members (RED + BLUE combined, Visitors excluded).
 * PRD calls this table "internal reference" — code-side, not CMS-editable.
 */
export const PRIZE_STAGES = [100, 200, 300, 400, 500, 1000, 2000] as const;

export interface ActiveStage {
    /** 1-based stage number. */
    stage: number;
    /** The stage's member threshold — the figure shown as "For X Members". */
    threshold: number;
}

/**
 * The stage whose figures are on display: the highest one whose threshold has
 * been reached. Below the first threshold the pool is pre-launch, and PRD says
 * to show Stage 1 as the target — so Stage 1 is returned there too.
 */
export function activeStage(paidMembers: number): ActiveStage {
    let index = 0;

    for (let i = 0; i < PRIZE_STAGES.length; i++) {
        if (paidMembers >= PRIZE_STAGES[i]) index = i;
    }

    return { stage: index + 1, threshold: PRIZE_STAGES[index] };
}

/**
 * The threshold the progress bar counts toward, or null at the top stage.
 * Pre-launch counts toward Stage 1's own threshold rather than Stage 2's.
 */
export function nextThreshold(paidMembers: number): number | null {
    return PRIZE_STAGES.find((threshold) => paidMembers < threshold) ?? null;
}

/** The stage number being counted toward, or null at the top stage. */
export function nextStageNumber(paidMembers: number): number | null {
    const index = PRIZE_STAGES.findIndex((threshold) => paidMembers < threshold);

    return index === -1 ? null : index + 1;
}

/** e.g. 'For 100 Members • Stage 1'. Built from the threshold, never the live count. */
export function stageLabel(active: ActiveStage): string {
    return `For ${active.threshold.toLocaleString('en-AU')} Members • Stage ${active.stage}`;
}

export interface StageProgress {
    /** 0–100, clamped and rounded. */
    pct: number;
    /** Members still needed to reach the next threshold; 0 at the top stage. */
    remaining: number;
}

export function stageProgress(paidMembers: number): StageProgress {
    const target = nextThreshold(paidMembers);

    if (target === null) return { pct: 100, remaining: 0 };

    return {
        pct: Math.min(100, Math.max(0, Math.round((paidMembers / target) * 100))),
        remaining: Math.max(0, target - paidMembers)
    };
}
