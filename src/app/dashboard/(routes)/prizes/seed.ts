import type { PrizePool } from '@/types/member';

/**
 * Placeholder document the editor falls back to while `GET /api/v1/public/prizes`
 * is still unimplemented (verified 404 on 2026-08-08).
 *
 * Values are PRD v3.2 §"Stage Prize Pool System"'s own Stage 1 example, and are
 * the same figures the backend is asked to seed with in docs/BACKEND-ISSUES.md —
 * so what an admin sees here matches what the first real GET will return.
 *
 * Scoped to this route on purpose. Member and public surfaces must NOT fall back
 * to it: prize figures are TPAL-regulated promotional claims, so serving stale
 * ones to customers is worse than showing nothing. Delete this file once the
 * endpoint answers.
 */
export const PRIZE_POOL_SEED: PrizePool = {
    headline: '$2,100',
    prizes_sublabel: '@ 22 Prizes • One Month',
    current_members: 142,
    odds_label: '9 in 10 wins yearly',
    tiers: [
        {
            tier_group: 'visitor',
            tier_label: 'Visitor',
            price_label: 'Free to join',
            weekly: '$25 Coles Digital Credit',
            monthly: null
        },
        {
            tier_group: 'red',
            tier_label: 'SLR RED',
            price_label: 'from $10/month',
            weekly: '$25 Coles Credits + $50 Cash',
            monthly: '$300 Bonus Monthly Credit'
        },
        {
            tier_group: 'blue',
            tier_label: 'SLR BLUE',
            price_label: 'from $26/month',
            weekly: '$25 Coles Credits + $150 Cash',
            monthly: '$700 Bonus Monthly Credit'
        }
    ]
};
