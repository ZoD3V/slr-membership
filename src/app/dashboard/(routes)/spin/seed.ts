import type { SpinConfig } from '@/types/member';

/**
 * Placeholder document the config card falls back to while
 * `GET /api/v1/admin/spin/config` is unimplemented (verified 404 on 2026-08-08,
 * and not even documented in the API Contract — see spec §3.3).
 *
 * All five spin-eligible sub-tiers default to enabled, matching how the wheel
 * behaves today with no admin toggle at all. Delete once the endpoint answers.
 */
export const SPIN_CONFIG_SEED: SpinConfig = {
    enabled: true,
    sub_tier_enabled: {
        R4: true,
        R7: true,
        B4: true,
        B7: true,
        B10: true
    }
};
