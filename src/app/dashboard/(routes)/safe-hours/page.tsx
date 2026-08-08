import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminSafeHours } from '@/lib/api/resources/safe-hours';
import { getAccessToken } from '@/lib/api/server';
import type { SafeHoursConfig } from '@/types/member';

import { SafeHoursClient } from './safe-hours-client';
import { SAFE_HOURS_SEED } from './seed';

export default async function SafeHoursPage() {
    const token = await getAccessToken();

    let config: SafeHoursConfig;
    let isPlaceholder = false;

    try {
        config = token ? await getAdminSafeHours(token) : SAFE_HOURS_SEED;
        if (!token) isPlaceholder = true;
    } catch (error) {
        handleApiAuthError(error); // 401 → force logout; other errors fall through
        // The endpoint is still unimplemented, so the editor renders against the
        // seed document rather than an error card — the form stays usable for
        // admin walkthroughs. Saving still fails loudly via the action's toast.
        config = SAFE_HOURS_SEED;
        isPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <Heading title='Safe Hours' description='Configure the sign-up and plan-change lockout window.' />

            {isPlaceholder ? (
                <p className='text-muted-foreground text-sm'>
                    Showing placeholder figures — the safe-hours endpoint is not live yet, so saving will not persist.
                </p>
            ) : null}

            <SafeHoursClient config={config} />
        </DashboardPageShell>
    );
}
