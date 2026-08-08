import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import { type ListError, ListErrorCard } from '@/components/common/list-error-card';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getPrizePool } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import { activeStage, nextStageNumber, stageLabel, stageProgress } from '@/lib/prizes';
import type { PrizePool } from '@/types/member';

export default async function PrizesPage() {
    // The read itself is public; the token gates the route and is what the save
    // action will need in Task 5.
    await getAccessToken();

    let pool: PrizePool | null = null;
    let listError: ListError | null = null;

    try {
        pool = await getPrizePool();
    } catch (error) {
        handleApiAuthError(error); // 401 → force logout; other errors fall through
        listError = toListError(error);
    }

    const stage = pool ? activeStage(pool.current_members) : null;
    const progress = pool ? stageProgress(pool.current_members) : null;
    const nextStage = pool ? nextStageNumber(pool.current_members) : null;

    return (
        <DashboardPageShell>
            <Heading title='Prizes' description='Edit the prize pool shown on the Prizes page' />

            {listError ? (
                <ListErrorCard
                    error={listError}
                    title='Could not load the prize pool'
                    description='The prizes endpoint is not available yet. See docs/BACKEND-ISSUES.md.'
                />
            ) : null}

            {pool && stage && progress ? (
                <dl className='max-w-4xl space-y-2 text-sm'>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Headline</dt>
                        <dd>{pool.headline}</dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Sub-label</dt>
                        <dd>{pool.prizes_sublabel}</dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Odds</dt>
                        <dd>{pool.odds_label}</dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Paid members</dt>
                        <dd className='tabular-nums'>{pool.current_members.toLocaleString('en-AU')}</dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Derived stage</dt>
                        <dd>
                            {stageLabel(stage)} · {progress.pct}%
                            {nextStage !== null
                                ? ` · ${progress.remaining.toLocaleString('en-AU')} more until Stage ${nextStage}`
                                : ' · top stage'}
                        </dd>
                    </div>
                </dl>
            ) : null}
        </DashboardPageShell>
    );
}
