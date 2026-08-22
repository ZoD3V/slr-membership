import type { PrizeContent } from '@/types/member';

/**
 * Static copy the public Prizes page renders when `GET /api/v1/prizes` cannot
 * be read. Marketing pages keep a static fallback rather than an EmptyState
 * (docs/API-INTEGRATION.md rule 6) — an empty hero on the public page would
 * cost SEO and first impressions.
 *
 * These are the exact strings the page hardcoded before it was wired to the
 * CMS, so an API outage renders the last designed state instead of nothing.
 * Distinct from PRIZE_CONTENT_SEED in dashboard/(routes)/prizes, which backs
 * the admin editor.
 */
export const PUBLIC_PRIZE_FALLBACK: PrizeContent = {
    prize_pool_headline: '$2,100',
    prize_count: '@ 22 Prizes • One Month',
    stage_label: 'For 100 Members • Stage 1',
    visitor_prize: '$25 Coles Digital Credit',
    red_weekly: '$25 Coles Credits',
    red_monthly: '$300 Bonus Monthly Credit',
    blue_weekly: '$25 Coles Credits',
    blue_monthly: '$700 Bonus Monthly Credit',
    odds: '9 in 10 wins yearly',
    updated_at: null
};
