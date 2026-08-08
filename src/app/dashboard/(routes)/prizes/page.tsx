import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { getPrizePool } from '@/lib/api/resources/prizes';
import type { PrizePool } from '@/types/member';

import { PrizesClient } from './prizes-client';
import { PRIZE_POOL_SEED } from './seed';

export default async function PrizesPage() {
    let pool: PrizePool;
    let isPlaceholder = false;

    try {
        pool = await getPrizePool();
    } catch (error) {
        handleApiAuthError(error); // 401 → force logout; other errors fall through
        // The endpoint is still unimplemented, so the editor renders against the
        // seed document rather than an error card — the form stays usable for
        // admin walkthroughs. Saving still fails loudly via the action's toast.
        pool = PRIZE_POOL_SEED;
        isPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <Heading
                title='Prizes'
                description='Edit the prize pool shown on the Prizes page. Saved changes are not yet reflected on member-facing pages.'
            />

            {isPlaceholder ? (
                <p className='text-muted-foreground text-sm'>
                    Showing placeholder figures — the prizes endpoint is not live yet, so saving will not persist.
                </p>
            ) : null}

            <PrizesClient pool={pool} />
        </DashboardPageShell>
    );
}
