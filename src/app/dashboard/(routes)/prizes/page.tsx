import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import { type ListError, ListErrorCard } from '@/components/common/list-error-card';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getPrizePool } from '@/lib/api/resources/prizes';
import type { PrizePool } from '@/types/member';

import { PrizesClient } from './prizes-client';

export default async function PrizesPage() {
    let pool: PrizePool | null = null;
    let listError: ListError | null = null;

    try {
        pool = await getPrizePool();
    } catch (error) {
        handleApiAuthError(error); // 401 → force logout; other errors fall through
        listError = toListError(error);
    }

    return (
        <DashboardPageShell>
            <Heading
                title='Prizes'
                description='Edit the prize pool shown on the Prizes page. Saved changes are not yet reflected on member-facing pages.'
            />

            {listError ? (
                <ListErrorCard
                    error={listError}
                    title='Could not load the prize pool'
                    description='The prizes endpoint is not available yet. See docs/BACKEND-ISSUES.md.'
                />
            ) : null}

            {pool ? <PrizesClient pool={pool} /> : null}
        </DashboardPageShell>
    );
}
