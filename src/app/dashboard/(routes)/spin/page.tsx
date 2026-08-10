import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { SPIN_ELIGIBLE_SUB_TIERS } from '@/constant/tiers';
import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminSpinConfig, getAdminSpinHistory } from '@/lib/api/resources/spin-admin';
import { getAccessToken } from '@/lib/api/server';
import type { SpinConfig, SpinHistoryMeta, SpinHistoryRow, SpinMoment, SpinTierId, SubTierCode } from '@/types/member';

import { SPIN_CONFIG_SEED, SPIN_HISTORY_META_SEED } from './seed';
import { SpinConfigClient } from './spin-config-client';
import { SpinHistoryClient } from './spin-history-client';

const TIER_VALUES: SpinTierId[] = ['visitor', 'r1', 'r4', 'r7', 'b1', 'b4', 'b7', 'b10'];
const MOMENT_VALUES: SpinMoment[] = ['registration', 'pre_renewal'];
const ELIGIBLE_SUB_TIERS = Array.from(SPIN_ELIGIBLE_SUB_TIERS) as SubTierCode[];

function isSpinTierId(value: string): value is SpinTierId {
    return (TIER_VALUES as readonly string[]).includes(value);
}

function isSpinMoment(value: string): value is SpinMoment {
    return (MOMENT_VALUES as readonly string[]).includes(value);
}

// GET /admin/spin/config's exact set of sub_tier_ids on a fresh response isn't
// confirmed (all 8 vs only the 5 eligible ones) — merge the eligible 5 over
// the seed's shape so the config form always has a row to render for each,
// and carry through anything else (ineligible codes) untouched.
function normalizeSpinConfig(raw: Partial<SpinConfig> | null | undefined): SpinConfig {
    const rawSubTiers = raw?.sub_tiers ?? [];

    const merged = ELIGIBLE_SUB_TIERS.map((code) => {
        const id = code.toLowerCase();
        const existing = rawSubTiers.find((t) => t.sub_tier_id === id);

        // Non-null: SPIN_CONFIG_SEED is authored with exactly these 5 ids.
        return existing ?? SPIN_CONFIG_SEED.sub_tiers.find((t) => t.sub_tier_id === id)!;
    });
    const untouched = rawSubTiers.filter(
        (t) => !ELIGIBLE_SUB_TIERS.some((code) => code.toLowerCase() === t.sub_tier_id)
    );

    return {
        global_enabled: raw?.global_enabled ?? SPIN_CONFIG_SEED.global_enabled,
        sub_tiers: [...merged, ...untouched]
    };
}

export default async function SpinPage({
    searchParams
}: {
    searchParams: Promise<{ tier?: string; moment?: string; page?: string }>;
}) {
    const { tier: rawTier = 'all', moment: rawMoment = 'all', page: rawPage } = await searchParams;
    // Whitelist before use — an unrecognised value would otherwise be sent to
    // the backend as a filter while the Select silently falls back to its
    // placeholder, showing no filter active for a filtered fetch.
    const tier = rawTier === 'all' || isSpinTierId(rawTier) ? rawTier : 'all';
    const moment = rawMoment === 'all' || isSpinMoment(rawMoment) ? rawMoment : 'all';
    const parsedPage = Number(rawPage);
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const token = await getAccessToken();

    let config: SpinConfig;
    let isConfigPlaceholder = false;
    let history: SpinHistoryRow[] = [];
    let historyMeta: SpinHistoryMeta = SPIN_HISTORY_META_SEED;

    if (token) {
        const [configResult, historyResult] = await Promise.allSettled([
            getAdminSpinConfig(token),
            getAdminSpinHistory(token, {
                // `tier` is deliberately NOT forwarded: `?tier=<any value>`
                // makes the endpoint answer 500 (verified 2026-08-10), which
                // would take the whole history table down. The filter control
                // is disabled in the client for the same reason. A hand-typed
                // ?tier= in the URL therefore changes nothing rather than
                // breaking the page. Restore this when the backend ask in
                // docs/BACKEND-ISSUES.md is resolved.
                moment: moment === 'all' ? undefined : moment,
                page,
                perPage: 20
            })
        ]);

        // Inspect rejections before any fallback logic runs: a 401 (expired
        // admin session) must force a logout, not be swallowed as "endpoint
        // missing" and silently rendered as seed data.
        if (configResult.status === 'rejected') handleApiAuthError(configResult.reason);
        if (historyResult.status === 'rejected') handleApiAuthError(historyResult.reason);

        if (configResult.status === 'fulfilled') {
            config = normalizeSpinConfig(configResult.value);
        } else {
            config = SPIN_CONFIG_SEED;
            isConfigPlaceholder = true;
        }

        if (historyResult.status === 'fulfilled') {
            history = historyResult.value.data;
            historyMeta = historyResult.value.meta;
        }
        // On failure, history/historyMeta stay at their seeded defaults — the
        // table's own empty state handles it, no honest placeholder exists for
        // a list of past events.
    } else {
        config = SPIN_CONFIG_SEED;
        isConfigPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <Heading
                title='Spin Wheel'
                description='Availability, per-tier discount and spin history for the registration and renewal wheel.'
            />

            <div className='space-y-6'>
                {isConfigPlaceholder ? (
                    <p className='text-muted-foreground text-sm'>
                        Couldn&apos;t load the current spin settings — showing defaults. Saving may fail.
                    </p>
                ) : null}

                <SpinConfigClient config={config} />
                <SpinHistoryClient rows={history} meta={historyMeta} tier={tier} moment={moment} />
            </div>
        </DashboardPageShell>
    );
}
