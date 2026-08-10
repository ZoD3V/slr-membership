import type { PrizeContent } from '@/types/member';

/**
 * Defensive fallback the editor renders against when `GET /api/v1/admin/prizes`
 * cannot be read (network error, or a non-401 API error).
 *
 * The endpoint is live — it answers 401 unauthenticated, verified 2026-08-10 —
 * so reaching this seed means something went wrong, not that the backend is
 * missing. Values are the real API doc's own Stage 1 example response.
 *
 * Scoped to this route on purpose — distinct from PrizePool's mock in
 * src/data/prizes.ts, which is a different, still-unconfirmed document.
 */
export const PRIZE_CONTENT_SEED: PrizeContent = {
    prize_pool_headline: '$2,100',
    prize_count: '@ 22 Prizes • One Month',
    stage_label: 'For 100 Members • Stage 1',
    visitor_prize: '1x Free Draw Pass Entry',
    red_weekly: '1x $100 Gift Card',
    red_monthly: '1x $500 Tech Bundle',
    blue_weekly: '1x $250 Gift Card',
    blue_monthly: '1x $1000 Cash Prize',
    odds: '9 in 10 wins yearly',
    updated_at: null
};
