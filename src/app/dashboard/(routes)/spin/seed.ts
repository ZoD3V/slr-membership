import type { SpinConfig, SpinHistoryMeta } from '@/types/member';

export const SPIN_CONFIG_SEED: SpinConfig = {
    global_enabled: true,
    sub_tiers: [
        { sub_tier_id: 'r4', marketing_name: 'Red Plus', has_spin: true, spin_discount_cents: 1000 },
        { sub_tier_id: 'r7', marketing_name: 'Red Premium', has_spin: true, spin_discount_cents: 1000 },
        { sub_tier_id: 'b4', marketing_name: 'Blue Plus', has_spin: true, spin_discount_cents: 1000 },
        { sub_tier_id: 'b7', marketing_name: 'Blue Premium', has_spin: true, spin_discount_cents: 1000 },
        { sub_tier_id: 'b10', marketing_name: 'Blue Elite', has_spin: true, spin_discount_cents: 1000 }
    ]
};

export const SPIN_HISTORY_META_SEED: SpinHistoryMeta = { page: 1, per_page: 20, total: 0, total_pages: 1 };
