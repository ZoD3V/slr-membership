import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { getAdminSpinConfig, getAdminSpinHistory } from '@/lib/api/resources/spin-admin';
import { getAccessToken } from '@/lib/api/server';
import type { SpinConfig, SpinEligibleSubTier, SpinHistoryRow } from '@/types/member';

import { SPIN_CONFIG_SEED } from './seed';
import { SpinConfigClient } from './spin-config-client';
import { SpinHistoryClient } from './spin-history-client';

export default async function SpinPage({
    searchParams
}: {
    searchParams: Promise<{ tier?: string; moment?: string }>;
}) {
    const { tier = 'all', moment = 'all' } = await searchParams;
    const token = await getAccessToken();

    let config: SpinConfig;
    let isConfigPlaceholder = false;
    let history: SpinHistoryRow[] = [];

    if (token) {
        const [configResult, historyResult] = await Promise.allSettled([
            getAdminSpinConfig(token),
            getAdminSpinHistory(token, {
                tier: tier === 'all' ? undefined : (tier as SpinEligibleSubTier),
                moment: moment === 'all' ? undefined : (moment as 'registration' | 'renewal')
            })
        ]);

        if (configResult.status === 'fulfilled') {
            config = configResult.value;
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
