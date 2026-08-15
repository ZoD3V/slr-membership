import { cache } from 'react';

import { API } from '../endpoints';
import { apiFetch } from '../http';

// GET /referral/ — PRD §4.9. Two variants by `tier_type`: paid members earn
// token bonuses automatically (bonus_history), Visitors get a manual admin
// gift instead (gift_history) — never both populated at once.
export interface ReferralBonusEntry {
    triggered_at: string;
    referral_count: number;
    bonus_token: number;
    status: string;
}

export interface ReferralGiftEntry {
    triggered_at: string;
    referral_count: number;
    gift_status: string;
    admin_note: string | null;
}

export interface ReferralStatus {
    referral_code: string;
    tier_type: 'paid' | 'visitor';
    total_referrals: number;
    progress_to_next: { current: number; target: number };
    bonuses_received?: number;
    bonus_history?: ReferralBonusEntry[];
    gift_history?: ReferralGiftEntry[];
}

export const getReferralStatus = cache((token: string) => {
    return apiFetch<ReferralStatus>(API.referral.status, { token, cache: 'no-store' });
});
