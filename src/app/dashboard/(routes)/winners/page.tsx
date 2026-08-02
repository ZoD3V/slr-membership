import Link from 'next/link';

import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import type { ListError } from '@/components/common/list-error-card';
import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getAdminWinners } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';
import { formatShortDate } from '@/lib/member';

import { loadGiveawaySchedules } from './_components/load';
import { type WinnerRow, WinnersClient } from './winners-client';
import { Plus } from 'lucide-react';

const PER_PAGE = 10;

export default async function WinnersPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; giveaway?: string }>;
}) {
    const { page: rawPage, giveaway } = await searchParams;
    const page = Math.max(1, Number(rawPage) || 1);
    const token = await getAccessToken();

    let rows: WinnerRow[] = [];
    let total = 0;
    let listError: ListError | null = null;

    try {
        if (token) {
            // Independent calls — the winners payload carries no schedule, so the
            // dates are joined in from the giveaways list by `giveaway_id`.
            const [res, schedules] = await Promise.all([
                getAdminWinners(token, { page, perPage: PER_PAGE, giveawayId: giveaway }),
                loadGiveawaySchedules()
            ]);

            total = res.pagination.total;
            rows = res.items.map((w) => {
                const schedule = w.giveaway?.giveaway_id ? schedules.get(w.giveaway.giveaway_id) : undefined;

                return {
                    id: w.winner_id,
                    prize: w.prize || '-',
                    giveaway: w.giveaway?.name || '-',
                    tier: w.giveaway?.tier || '-',
                    winner: w.full_name || '-',
                    state: w.state || '-',
                    opens: schedule?.opens ?? '-',
                    closes: schedule?.closes ?? '-',
                    draws: schedule?.draws ?? '-',
                    recorded_at: formatShortDate(w.recorded_at)
                };
            });
        }
    } catch (error) {
        handleApiAuthError(error);
        listError = toListError(error);
    }

    const newHref = giveaway ? `/dashboard/winners/new?giveaway=${giveaway}` : '/dashboard/winners/new';

    return (
        <DashboardPageShell>
            <div className='flex items-center justify-between'>
                <Heading
                    title='Winners'
                    description={giveaway ? 'Recorded winners for the selected giveaway' : 'Recorded giveaway winners'}
                />
                <div className='flex items-center gap-2'>
                    {giveaway ? (
                        <Button variant='outline' asChild>
                            <Link href='/dashboard/winners'>Show all</Link>
                        </Button>
                    ) : null}
                    <Button asChild>
                        <Link href={newHref}>
                            <Plus className='mr-2 h-4 w-4' />
                            Record Winner
                        </Link>
                    </Button>
                </div>
            </div>

            <WinnersClient
                rows={rows}
                listError={listError}
                page={page}
                total={total}
                perPage={PER_PAGE}
                giveawayFilter={giveaway}
            />
        </DashboardPageShell>
    );
}
