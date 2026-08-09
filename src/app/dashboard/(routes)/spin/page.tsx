import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { SPIN_ELIGIBLE_SUB_TIERS } from '@/constant/tiers';
import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminSpinConfig, getAdminSpinHistory } from '@/lib/api/resources/spin-admin';
import { getAccessToken } from '@/lib/api/server';
import type { SpinConfig, SpinEligibleSubTier, SpinHistoryRow } from '@/types/member';

import { SPIN_CONFIG_SEED } from './seed';
import { SpinConfigClient } from './spin-config-client';
import { SpinHistoryClient } from './spin-history-client';

// Single source of truth per constant/tiers.ts — don't re-list the five codes.
const TIER_VALUES = Array.from(SPIN_ELIGIBLE_SUB_TIERS) as SpinEligibleSubTier[];
const MOMENT_VALUES = ['registration', 'renewal'] as const;

function isSpinEligibleSubTier(value: string): value is SpinEligibleSubTier {
    return (TIER_VALUES as readonly string[]).includes(value);
}

function isSpinMoment(value: string): value is 'registration' | 'renewal' {
    return (MOMENT_VALUES as readonly string[]).includes(value);
}

// GET /admin/spin/config's shape is an unconfirmed guess (spec §3.2) — merge
// whatever the backend actually returns over the seed's shape so every key is
// always present, instead of trusting the response to be complete.
function normalizeSpinConfig(raw: Partial<SpinConfig> | null | undefined): SpinConfig {
    return {
        enabled: raw?.enabled ?? SPIN_CONFIG_SEED.enabled,
        sub_tier_enabled: { ...SPIN_CONFIG_SEED.sub_tier_enabled, ...raw?.sub_tier_enabled }
    };
}

export default async function SpinPage({
    searchParams
}: {
    searchParams: Promise<{ tier?: string; moment?: string }>;
}) {
    const { tier: rawTier = 'all', moment: rawMoment = 'all' } = await searchParams;
    // Whitelist before use — an unrecognised value would otherwise be sent to
    // the backend as a filter while the Select silently falls back to its
    // placeholder, showing no filter active for a filtered fetch.
    const tier = rawTier === 'all' || isSpinEligibleSubTier(rawTier) ? rawTier : 'all';
    const moment = rawMoment === 'all' || isSpinMoment(rawMoment) ? rawMoment : 'all';

    const token = await getAccessToken();

    let config: SpinConfig;
    let isConfigPlaceholder = false;
    let history: SpinHistoryRow[] = [];

    if (token) {
        const [configResult, historyResult] = await Promise.allSettled([
            getAdminSpinConfig(token),
            getAdminSpinHistory(token, {
                tier: tier === 'all' ? undefined : tier,
                moment: moment === 'all' ? undefined : moment
            })
        ]);

        // Inspect rejections before any fallback logic runs: a 401 (expired
        // admin session) must force a logout, not be swallowed as "endpoint
        // missing" and silently rendered as seed data. handleApiAuthError
        // redirects (throws NEXT_REDIRECT) outside of allSettled's promises,
        // so it can't be caught and absorbed as just another settled rejection.
        if (configResult.status === 'rejected') handleApiAuthError(configResult.reason);
        if (historyResult.status === 'rejected') handleApiAuthError(historyResult.reason);

        if (configResult.status === 'fulfilled') {
            config = normalizeSpinConfig(configResult.value);
        } else {
            config = SPIN_CONFIG_SEED;
            isConfigPlaceholder = true;
        }

        if (historyResult.status === 'fulfilled') {
            history = historyResult.value;
        }
        // On failure, history stays [] — the table's own empty state handles it,
        // per spec §3.5: a list has no honest placeholder, unlike the config card.
    } else {
        config = SPIN_CONFIG_SEED;
        isConfigPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <Heading
                title='Spin Wheel'
                description='Availability and spin history for the registration and renewal wheel.'
            />

            <div className='space-y-6'>
                {isConfigPlaceholder ? (
                    <p className='text-muted-foreground text-sm'>
                        Showing placeholder settings — the spin config endpoint is not live yet, so saving will not
                        persist.
                    </p>
                ) : null}

                <SpinConfigClient config={config} />
                <SpinHistoryClient rows={history} tier={tier} moment={moment} />
            </div>
        </DashboardPageShell>
    );
}
