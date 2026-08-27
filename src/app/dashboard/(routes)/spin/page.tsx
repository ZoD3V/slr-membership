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

function normalizeSpinConfig(raw: Partial<SpinConfig> | null | undefined): SpinConfig {
    const rawSubTiers = raw?.sub_tiers ?? [];

    const merged = ELIGIBLE_SUB_TIERS.map((code) => {
        const id = code.toLowerCase();
        const existing = rawSubTiers.find((t) => t.sub_tier_id === id);
        if (existing) return existing;

        const seeded = SPIN_CONFIG_SEED.sub_tiers.find((t) => t.sub_tier_id === id);
        if (seeded) return seeded;

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
