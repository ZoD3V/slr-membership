import Link from 'next/link';

import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import type { ListError } from '@/components/common/list-error-card';
import { Button } from '@/components/ui/button';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getAllAdminWinners } from '@/lib/api/resources/giveaways';
import { getAccessToken } from '@/lib/api/server';
import { formatDateTime, formatShortDate } from '@/lib/member';

import { type WinnerRow, WinnersClient } from './winners-client';
import { Plus } from 'lucide-react';

export default async function WinnersPage({ searchParams }: { searchParams: Promise<{ giveaway?: string }> }) {
    const { giveaway } = await searchParams;
    const token = await getAccessToken();

    let rows: WinnerRow[] = [];
    let listError: ListError | null = null;

    try {
        if (token) {
            const winners = await getAllAdminWinners(token, giveaway);

            rows = winners.map((w) => {
                return {
                    id: w.winner_id,
                    prize: w.prize || '-',
                    giveaway: w.giveaway?.name || '-',
                    tier: w.giveaway?.tier || '-',
                    winner: w.full_name || '-',
                    state: w.state || '-',
                    opens: formatDateTime(w.giveaway?.opens_at),
                    closes: formatDateTime(w.giveaway?.closes_at ?? w.giveaway?.ends_at),
                    draws: formatDateTime(w.giveaway?.draws_at),
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

            <WinnersClient rows={rows} listError={listError} />
        </DashboardPageShell>
    );
}
