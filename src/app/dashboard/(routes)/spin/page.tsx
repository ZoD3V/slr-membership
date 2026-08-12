import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { SPIN_ELIGIBLE_SUB_TIERS, SUB_TIERS } from '@/constant/tiers';
import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminSpinConfig, getAdminSpinHistory } from '@/lib/api/resources/spin-admin';
import { getAccessToken } from '@/lib/api/server';
import type {
    SpinConfig,
    SpinHistoryMeta,
    SpinHistoryRow,
    SpinMoment,
    SpinSubTierConfig,
    SpinTierId,
    SubTierCode
} from '@/types/member';

import { SPIN_CONFIG_SEED, SPIN_HISTORY_META_SEED } from './seed';
import { SpinConfigClient } from './spin-config-client';
import { SpinHistoryClient } from './spin-history-client';

const MOMENT_VALUES: SpinMoment[] = ['registration', 'pre_renewal'];
const TIER_VALUES: SpinTierId[] = ['visitor', 'r1', 'r4', 'r7', 'b1', 'b4', 'b7', 'b10'];
const ELIGIBLE_SUB_TIERS = Array.from(SPIN_ELIGIBLE_SUB_TIERS) as SubTierCode[];

function isSpinMoment(value: string): value is SpinMoment {
    return (MOMENT_VALUES as readonly string[]).includes(value);
}

function isSpinTierId(value: string): value is SpinTierId {
    return (TIER_VALUES as readonly string[]).includes(value);
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
        if (existing) return existing;

        const seeded = SPIN_CONFIG_SEED.sub_tiers.find((t) => t.sub_tier_id === id);
        if (seeded) return seeded;

        // Safety net, not expected to trigger: SPIN_ELIGIBLE_SUB_TIERS
        // (constant/tiers.ts) and SPIN_CONFIG_SEED (./seed) are meant to list
        // exactly the same five codes. If a code is ever added to one without
        // the other, don't crash the page on a missing row — render it as a
        // disabled, zero-discount row instead.
        return {
            sub_tier_id: id as SpinSubTierConfig['sub_tier_id'],
            marketing_name: SUB_TIERS[code].marketingName,
            has_spin: false,
            spin_discount_cents: 0
        };
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
    // An unrecognised ?tier= must not be forwarded: the endpoint answers 200
    // with an empty list for garbage rather than a validation error, which
    // would read as "no spins" for a typo.
    const tier = rawTier === 'all' || isSpinTierId(rawTier) ? rawTier : 'all';
    const moment = rawMoment === 'all' || isSpinMoment(rawMoment) ? rawMoment : 'all';
    const parsedPage = Number(rawPage);
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const token = await getAccessToken();

    let config: SpinConfig;
    let isConfigPlaceholder = false;
    let history: SpinHistoryRow[] = [];
    let historyMeta: SpinHistoryMeta = SPIN_HISTORY_META_SEED;
    let historyFailed = false;

    if (token) {
        const [configResult, historyResult] = await Promise.allSettled([
            getAdminSpinConfig(token),
            getAdminSpinHistory(token, {
                tier: tier === 'all' ? undefined : tier,
                moment: moment === 'all' ? undefined : moment,
                page,
                perPage: 10
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
        } else {
            // On failure, history/historyMeta stay at their seeded defaults.
            // historyFailed tells the table to render a "couldn't load"
            // notice instead of its normal empty state, so a fetch failure
            // is never presented as the factual claim "no spins yet".
            historyFailed = true;
        }
    } else {
        config = SPIN_CONFIG_SEED;
        isConfigPlaceholder = true;
        historyFailed = true;
    }

    return (
        <DashboardPageShell>
            <div className='mx-auto w-full'>
                <Heading
                    title='Spin Wheel'
                    description='Availability, per-tier discount and spin history for the registration and renewal wheel.'
                />

                {isConfigPlaceholder ? (
                    <p className='text-muted-foreground mt-2 text-sm'>
                        Couldn&apos;t load the current spin settings — showing defaults. Saving may fail.
                    </p>
                ) : null}
            </div>

            <SpinConfigClient config={config} />
            <SpinHistoryClient
                rows={history}
                meta={historyMeta}
                tier={tier}
                moment={moment}
                historyFailed={historyFailed}
            />
        </DashboardPageShell>
    );
}
