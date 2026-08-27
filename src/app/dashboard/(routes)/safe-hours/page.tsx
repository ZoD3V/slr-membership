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
        handleApiAuthError(error);

        config = SAFE_HOURS_SEED;
        isPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <div className='mx-auto w-full'>
                <Heading title='Safe Hours' description='Configure the sign-up and plan-change lockout window.' />

                {isPlaceholder ? (
                    <p className='text-muted-foreground mt-2 text-sm'>
                        Couldn&apos;t load the current safe-hours settings — showing defaults. Saving may fail.
                    </p>
                ) : null}
            </div>

            <SafeHoursClient config={config} isPlaceholder={isPlaceholder} />
        </DashboardPageShell>
    );
}
